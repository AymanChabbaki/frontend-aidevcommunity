import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Crown, Award, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import quizService, { MonthlyLeaderboardEntry } from '../services/quiz.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const LeaderboardWidget = () => {
  const [leaderboard, setLeaderboard] = useState<MonthlyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await quizService.getMonthlyLeaderboard();
      setLeaderboard(data.slice(0, 10)); // Show top 10
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-500 to-amber-700';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl">
        <CardContent className="py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return null; // Don't show widget if no data
  }

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-2 border-purple-100 dark:border-purple-900">
      <CardHeader className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Trophy className="h-8 w-8 text-yellow-500 drop-shadow-lg" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Monthly Leaderboard
              </CardTitle>
              <CardDescription className="font-medium">{currentMonth}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/quizzes')} className="hover:bg-primary/10">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Top 3 - Compact Podium */}
        <div className="grid grid-cols-3 gap-3">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
            >
              <div className="relative">
                <motion.div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${getMedalColor(entry.rank)} rounded-2xl blur opacity-60`}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-xl border-2 ${
                  entry.rank === 1 ? 'border-yellow-400' :
                  entry.rank === 2 ? 'border-gray-400' :
                  'border-amber-600'
                } ${entry.rank === 1 ? 'transform scale-105' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <Avatar className={`${entry.rank === 1 ? 'h-16 w-16' : 'h-14 w-14'} border-2 ${
                        entry.rank === 1 ? 'border-yellow-400' :
                        entry.rank === 2 ? 'border-gray-400' :
                        'border-amber-600'
                      } shadow-lg`}>
                        <AvatarImage src={entry.profilePicture} alt={entry.displayName} />
                        <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-purple-400 to-blue-400">
                          {entry.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                        {entry.rank === 1 ? (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Medal className={`h-4 w-4 ${
                            entry.rank === 2 ? 'text-gray-400' : 'text-amber-600'
                          }`} />
                        )}
                      </div>
                    </div>
                    <div className={`${entry.rank === 1 ? 'text-2xl' : 'text-xl'} font-black ${
                      entry.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent' :
                      entry.rank === 2 ? 'text-gray-500' :
                      'text-amber-600'
                    }`}>
                      {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : '3rd'}
                    </div>
                    <div className={`font-bold text-center truncate w-full ${entry.rank === 1 ? 'text-sm' : 'text-xs'}`}>
                      {entry.displayName}
                    </div>
                    {(entry.hasPenalty) && (
                      <span className="inline-flex items-center justify-center text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold mt-1">
                        <AlertTriangle className="h-3 w-3" />
                      </span>
                    )}
                    <div className={`bg-gradient-to-r ${getMedalColor(entry.rank)} rounded-full px-3 py-1 mt-2 shadow-md`}>
                      <div className={`${entry.rank === 1 ? 'text-lg' : 'text-base'} font-black text-white`}>
                        {entry.totalScore}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {entry.quizCount} quiz{entry.quizCount !== 1 ? 'zes' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rest of leaderboard - Compact Table */}
        {leaderboard.length > 3 && (
          <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 sticky top-0 z-10 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
                  <tr>
                    <th className="text-left p-2 text-xs font-bold">Rank</th>
                    <th className="text-left p-2 text-xs font-bold">Player</th>
                    <th className="text-right p-2 text-xs font-bold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(3, 10).map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="border-b last:border-b-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-2">
                        <span className="text-sm font-semibold text-muted-foreground">
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={entry.profilePicture} alt={entry.displayName} />
                            <AvatarFallback className="text-xs">
                              {entry.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm truncate">{entry.displayName}</span>
                              {entry.hasPenalty && (
                                <span className="inline-flex items-center text-xs bg-red-600 text-white px-1 py-0.5 rounded-full font-bold flex-shrink-0">
                                  <AlertTriangle className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.quizCount} quiz{entry.quizCount !== 1 ? 'zes' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="font-bold text-sm text-primary">{entry.totalScore}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardWidget;
