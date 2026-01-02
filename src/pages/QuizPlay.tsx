import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import quizService, { Quiz, QuizQuestion, QuizAnswer } from '../services/quiz.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';

// Fisher-Yates shuffle algorithm to randomize array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
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

  // Prevent copy/paste
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Action Blocked',
        description: 'Copying is disabled during the quiz',
      });
    };

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('contextmenu', preventRightClick);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, [toast]);

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

      // Randomize options order for each question
      const quizWithShuffledOptions = {
        ...data,
        questions: data.questions.map(question => ({
          ...question,
          options: shuffleArray(question.options)
        }))
      };

      setQuiz(quizWithShuffledOptions);
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
    if (showFeedback) return; // Prevent changing answer during feedback
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (!selectedOption || !quiz || !quiz.questions || showFeedback) return;

    const timeSpent = Date.now() - questionStartTime;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
    const isCorrect = selectedOption === correctOption?.id;
    const isLastQuestion = currentQuestionIndex >= quiz.questions.length - 1;

    // Store the answer
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      timeSpent,
    };

    // If it's the last question, submit immediately without feedback
    if (isLastQuestion) {
      const finalAnswers = [...answers, newAnswer];
      setAnswers(finalAnswers);
      handleSubmitQuiz(false);
      return;
    }

    // Show feedback for non-last questions
    setAnswerFeedback({
      correct: isCorrect,
      correctAnswer: correctOption?.text || ''
    });
    setShowFeedback(true);

    // Wait 1.5 seconds before moving to next question
    setTimeout(() => {
      setAnswers([...answers, newAnswer]);
      setSelectedOption(null);
      setShowFeedback(false);
      setAnswerFeedback(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    }, 1500);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{quiz.title}</h1>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
              </div>
              <motion.div 
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white shadow-lg"
                animate={timeRemaining !== null && timeRemaining < 30000 ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: timeRemaining !== null && timeRemaining < 30000 ? Infinity : 0
                }}
              >
                <Timer className="h-5 w-5" />
                <span className="text-lg font-bold">
                  {timeRemaining !== null ? formatTime(timeRemaining) : '0:00'}
                </span>
              </motion.div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4 overflow-hidden shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 h-3 rounded-full shadow-lg"
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
              initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 20, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring" }}
              style={{ perspective: 1000 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-2 border-purple-100 dark:border-purple-900">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <CardTitle className="text-2xl font-bold">{currentQuestion.question}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="font-semibold">{currentQuestion.points} points</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedOption === option.id;
                      const isCorrect = option.isCorrect;
                      const showCorrect = showFeedback && isCorrect;
                      const showIncorrect = showFeedback && isSelected && !isCorrect;

                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                          whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                        >
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            className={`w-full justify-start text-left h-auto py-4 px-6 relative overflow-hidden transition-all duration-300 ${
                              showCorrect ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' :
                              showIncorrect ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' :
                              isSelected ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105' :
                              'hover:border-purple-300 hover:shadow-md'
                            }`}
                            onClick={() => handleAnswerSelect(option.id)}
                            disabled={showFeedback}
                          >
                            <span className="font-bold mr-3 text-lg">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="flex-1">{option.text}</span>
                            {showCorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-2"
                              >
                                ✓
                              </motion.span>
                            )}
                            {showIncorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-2"
                              >
                                ✗
                              </motion.span>
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {showFeedback && answerFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                        answerFeedback.correct 
                          ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' 
                          : 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                      }`}
                    >
                      {answerFeedback.correct ? (
                        <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-300 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-semibold ${answerFeedback.correct ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {answerFeedback.correct ? 'Correct!' : 'Incorrect'}
                        </p>
                        {!answerFeedback.correct && (
                          <p className="text-sm mt-1 text-muted-foreground">
                            Correct answer: {answerFeedback.correctAnswer}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!selectedOption || submitting || showFeedback}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold shadow-lg"
                    >
                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <>
                          Next Question
                          <Trophy className="ml-2 h-5 w-5" />
                        </>
                      ) : (
                        <>
                          Submit Quiz
                          <Trophy className="ml-2 h-5 w-5" />
                        </>
                      )}
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
    </div>
  );
};

export default QuizPlay;
