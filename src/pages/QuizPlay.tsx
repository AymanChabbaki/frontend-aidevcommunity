import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, AlertCircle } from 'lucide-react';
import quizService, { Quiz, QuizQuestion, QuizAnswer } from '../services/quiz.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0 && !quizStarted) {
      setTimeRemaining(quiz.timeLimit * 1000); // Convert seconds to milliseconds
      setQuizStarted(true);
    }
  }, [quiz, quizStarted]);

  useEffect(() => {
    // Don't start timer until quiz is loaded and started
    if (!quizStarted || timeRemaining === null || submitting) {
      return;
    }

    if (timeRemaining <= 0 && quiz) {
      // Time's up, auto-submit
      handleSubmitQuiz(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev !== null ? Math.max(0, prev - 100) : null);
    }, 100);

    return () => clearInterval(timer);
  }, [timeRemaining, quiz, quizStarted, submitting]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizById(id!);
      
      // Check if quiz is active
      if (data.status !== 'ACTIVE') {
        toast({
          variant: 'destructive',
          title: 'Quiz Not Available',
          description: 'This quiz is not currently active.',
        });
        navigate('/quizzes');
        return;
      }

      // Check if user already attempted
      const attemptData = await quizService.checkUserAttempt(id!);
      if (attemptData.hasAttempted) {
        toast({
          variant: 'destructive',
          title: 'Already Attempted',
          description: 'You have already completed this quiz.',
        });
        navigate(`/quizzes/${id}/leaderboard`);
        return;
      }

      setQuiz(data);
      setQuestionStartTime(Date.now());
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load quiz',
      });
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (!selectedOption || !quiz || !quiz.questions) return;

    const timeSpent = Date.now() - questionStartTime;
    const currentQuestion = quiz.questions[currentQuestionIndex];

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      timeSpent,
    };

    setAnswers([...answers, newAnswer]);
    setSelectedOption(null);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz(false);
    }
  };

  const handleSubmitQuiz = async (autoSubmit: boolean = false) => {
    if (!quiz || !quiz.questions || submitting) return;

    setSubmitting(true);

    try {
      // Add current answer if not auto-submit and there's a selection
      let finalAnswers = [...answers];
      if (!autoSubmit && selectedOption) {
        const timeSpent = Date.now() - questionStartTime;
        const currentQuestion = quiz.questions[currentQuestionIndex];
        finalAnswers.push({
          questionId: currentQuestion.id,
          selectedOption,
          timeSpent,
        });
      }

      const result = await quizService.submitQuizAnswers(id!, finalAnswers);

      toast({
        title: 'Quiz Completed!',
        description: `You scored ${result.totalScore} points and ranked #${result.rank}!`,
      });

      navigate(`/quizzes/${id}/leaderboard`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit quiz',
      });
      setSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quiz not found or has no questions.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Timer className="h-5 w-5" />
              <span className={timeRemaining !== null && timeRemaining < 30000 ? 'text-red-500' : ''}>
                {timeRemaining !== null ? formatTime(timeRemaining) : '0:00'}
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                <CardDescription>{currentQuestion.points} points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant={selectedOption === option.id ? 'default' : 'outline'}
                        className="w-full justify-start text-left h-auto py-4 px-6"
                        onClick={() => handleAnswerSelect(option.id)}
                      >
                        <span className="font-semibold mr-3">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{option.text}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!selectedOption || submitting}
                    size="lg"
                  >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Warning for last 30 seconds */}
        {timeRemaining !== null && timeRemaining < 30000 && timeRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Hurry! Less than 30 seconds remaining!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizPlay;
