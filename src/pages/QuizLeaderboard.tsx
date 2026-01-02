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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900 dark:to-yellow-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        {/* Header */}
        <div className="mb-12">
          <Button variant="ghost" onClick={() => navigate('/quizzes')} className="mb-6 hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
          <motion.div 
            className="flex items-center justify-center gap-4 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Trophy className="h-16 w-16 text-yellow-500 drop-shadow-2xl" />
            </motion.div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </motion.div>
          {quiz && (
            <p className="text-center text-xl text-muted-foreground font-medium">{quiz.title}</p>
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
            {/* Top 3 - Podium Style */}
            {leaderboard.length >= 1 && (
              <div className="mb-12">
                {/* Reorder for podium: 2nd, 1st, 3rd */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {/* Second Place */}
                  {leaderboard[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="order-1"
                    >
                      <div className="relative">
                        <motion.div
                          className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-3xl blur opacity-75"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                          }}
                        />
                        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border-4 border-gray-400">
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-full p-4 shadow-xl"
                            >
                              <Medal className="h-8 w-8 text-white" />
                            </motion.div>
                          </div>
                          <div className="flex flex-col items-center pt-6">
                            <Avatar className="h-20 w-20 border-4 border-gray-400 shadow-xl mb-3">
                              <AvatarImage src={leaderboard[1].profilePicture} alt={leaderboard[1].displayName} />
                              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-gray-300 to-gray-500">
                                {leaderboard[1].displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-4xl font-black mb-1 text-gray-500">2nd</div>
                            <h3 className="text-lg font-bold text-center mb-1">{leaderboard[1].displayName}</h3>
                            <p className="text-sm text-muted-foreground mb-3 text-center">{leaderboard[1].email}</p>
                            <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-full px-6 py-3 shadow-lg">
                              <div className="text-3xl font-black text-white">{leaderboard[1].totalScore}</div>
                              <div className="text-xs text-white/80 text-center">points</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* First Place - Tallest */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0 }}
                    className="order-2"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl blur-lg opacity-75"
                        animate={{
                          scale: [1, 1.08, 1],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      />
                      <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 transform md:scale-110">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <motion.div
                            animate={{
                              y: [0, -15, 0],
                              rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                            className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-5 shadow-2xl"
                          >
                            <Trophy className="h-10 w-10 text-white" />
                          </motion.div>
                        </div>
                        <div className="flex flex-col items-center pt-8">
                          <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-2xl mb-4">
                            <AvatarImage src={leaderboard[0].profilePicture} alt={leaderboard[0].displayName} />
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-yellow-400 to-yellow-600">
                              {leaderboard[0].displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                            1st
                          </div>
                          <h3 className="text-xl font-bold text-center mb-2">{leaderboard[0].displayName}</h3>
                          <p className="text-sm text-muted-foreground mb-4 text-center">{leaderboard[0].email}</p>
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full px-8 py-4 shadow-2xl">
                            <div className="text-4xl font-black text-white">{leaderboard[0].totalScore}</div>
                            <div className="text-xs text-white/80 text-center">points</div>
                          </div>
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                            className="mt-4 text-4xl"
                          >
                            👑
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Third Place */}
                  {leaderboard[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="order-3"
                    >
                      <div className="relative">
                        <motion.div
                          className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-amber-800 rounded-3xl blur opacity-75"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                          }}
                        />
                        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border-4 border-amber-600">
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-full p-4 shadow-xl"
                            >
                              <Medal className="h-8 w-8 text-white" />
                            </motion.div>
                          </div>
                          <div className="flex flex-col items-center pt-6">
                            <Avatar className="h-20 w-20 border-4 border-amber-600 shadow-xl mb-3">
                              <AvatarImage src={leaderboard[2].profilePicture} alt={leaderboard[2].displayName} />
                              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-amber-600 to-amber-800">
                                {leaderboard[2].displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-4xl font-black mb-1 text-amber-600">3rd</div>
                            <h3 className="text-lg font-bold text-center mb-1">{leaderboard[2].displayName}</h3>
                            <p className="text-sm text-muted-foreground mb-3 text-center">{leaderboard[2].email}</p>
                            <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-full px-6 py-3 shadow-lg">
                              <div className="text-3xl font-black text-white">{leaderboard[2].totalScore}</div>
                              <div className="text-xs text-white/80 text-center">points</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Rest of leaderboard - Table */}
            {leaderboard.length > 3 && (
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">All Participants</CardTitle>
                  <CardDescription>Complete ranking of all quiz takers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2">
                          <th className="text-left p-3 font-bold">Rank</th>
                          <th className="text-left p-3 font-bold">Participant</th>
                          <th className="text-right p-3 font-bold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.slice(3).map((entry, index) => (
                          <motion.tr
                            key={entry.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b hover:bg-accent/50 transition-colors"
                          >
                            <td className="p-4">
                              <span className="text-lg font-bold text-muted-foreground">
                                #{entry.rank}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
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
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex flex-col items-end">
                                <div className="text-xl font-bold text-primary">{entry.totalScore}</div>
                                <div className="text-xs text-muted-foreground">points</div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuizLeaderboard;
