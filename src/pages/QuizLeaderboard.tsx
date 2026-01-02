import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import quizService, { LeaderboardEntry, Quiz } from '../services/quiz.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';

const QuizLeaderboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizData, leaderboardData] = await Promise.all([
        quizService.getQuizById(id!),
        quizService.getQuizLeaderboard(id!),
      ]);
      setQuiz(quizData);
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load leaderboard',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className={`h-6 w-6 ${getMedalColor(rank)}`} />;
    }
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/quizzes')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          {quiz && (
            <p className="text-muted-foreground text-lg">{quiz.title}</p>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">No participants yet</p>
              <p className="text-muted-foreground">Be the first to take this quiz!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 3 */}
            {leaderboard.length >= 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={index === 0 ? 'md:col-start-2' : ''}
                  >
                    <Card className={`relative overflow-hidden ${
                      entry.rank === 1 ? 'border-yellow-500 border-2' :
                      entry.rank === 2 ? 'border-gray-400 border-2' :
                      'border-amber-600 border-2'
                    }`}>
                      <div className={`absolute top-0 left-0 right-0 h-2 ${
                        entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        'bg-gradient-to-r from-amber-500 to-amber-700'
                      }`} />
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background">
                              <AvatarImage src={entry.profilePicture} alt={entry.displayName} />
                              <AvatarFallback className="text-2xl">
                                {entry.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 shadow-lg">
                              {getMedalIcon(entry.rank)}
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{entry.displayName}</CardTitle>
                        <CardDescription>{entry.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {entry.totalScore}
                        </div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Rest of leaderboard */}
            {leaderboard.length > 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>All Participants</CardTitle>
                  <CardDescription>Complete ranking of all quiz takers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard.slice(3).map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-muted-foreground min-w-[40px]">
                            #{entry.rank}
                          </span>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.profilePicture} alt={entry.displayName} />
                            <AvatarFallback>
                              {entry.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{entry.displayName}</div>
                            <div className="text-sm text-muted-foreground">{entry.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{entry.totalScore}</div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default QuizLeaderboard;
