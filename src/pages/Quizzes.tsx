import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, Lock, Play, CheckCircle } from 'lucide-react';
import quizService, { Quiz, QuizAttempt } from '../services/quiz.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<{ [key: string]: QuizAttempt | null }>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'CLOSED'>('ALL');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);

      // Check attempts for each quiz
      const attemptPromises = data.map(async (quiz) => {
        try {
          const attemptData = await quizService.checkUserAttempt(quiz.id);
          return { quizId: quiz.id, attempt: attemptData.hasAttempted ? attemptData.attempt : null };
        } catch (error) {
          return { quizId: quiz.id, attempt: null };
        }
      });

      const attemptResults = await Promise.all(attemptPromises);
      const attemptsMap = attemptResults.reduce((acc, { quizId, attempt }) => {
        acc[quizId] = attempt || null;
        return acc;
      }, {} as { [key: string]: QuizAttempt | null });

      setAttempts(attemptsMap);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch quizzes',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    filter === 'ALL' ? true : quiz.status === filter
  );

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      UPCOMING: 'secondary',
      ACTIVE: 'default',
      CLOSED: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handlePlayQuiz = (quizId: string) => {
    navigate(`/quizzes/${quizId}/play`);
  };

  const handleViewResults = (quizId: string) => {
    navigate(`/quizzes/${quizId}/leaderboard`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge and compete with others!</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'UPCOMING', 'ACTIVE', 'CLOSED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status as any)}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">No quizzes available</p>
              <p className="text-muted-foreground">Check back later for new quizzes!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const attempt = attempts[quiz.id];
              const hasAttempted = !!attempt;

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col">
                    {quiz.coverImage && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={quiz.coverImage}
                          alt={quiz.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(quiz.status)}
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      {!quiz.coverImage && (
                        <div className="flex justify-end mb-2">
                          {getStatusBadge(quiz.status)}
                        </div>
                      )}
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(quiz.startAt).toLocaleDateString()} - {new Date(quiz.endAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(quiz.timeLimit / 60)} minutes</span>
                        </div>
                        {hasAttempted && attempt && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Score: {attempt.totalScore} points</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {quiz.status === 'UPCOMING' && (
                        <Button disabled className="w-full" variant="outline">
                          <Lock className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      )}
                      {quiz.status === 'ACTIVE' && !hasAttempted && (
                        <Button onClick={() => handlePlayQuiz(quiz.id)} className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Play Quiz
                        </Button>
                      )}
                      {quiz.status === 'ACTIVE' && hasAttempted && (
                        <Button onClick={() => handleViewResults(quiz.id)} className="w-full" variant="outline">
                          <Trophy className="mr-2 h-4 w-4" />
                          View Leaderboard
                        </Button>
                      )}
                      {quiz.status === 'CLOSED' && (
                        <Button onClick={() => handleViewResults(quiz.id)} className="w-full" variant="outline">
                          <Trophy className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Quizzes;
