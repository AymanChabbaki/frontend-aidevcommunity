import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
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

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className={`h-5 w-5 ${
        rank === 1 ? 'text-yellow-500' :
        rank === 2 ? 'text-gray-400' :
        'text-amber-600'
      }`} />;
    }
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  if (loading) {
    return (
      <Card>
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
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Monthly Leaderboard</CardTitle>
              <CardDescription>{currentMonth}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/quizzes')}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${index === 0 ? 'col-span-3 md:col-span-1' : 'col-span-3 md:col-span-1'}`}
            >
              <div className={`bg-gradient-to-br ${getMedalColor(entry.rank)} p-4 rounded-lg text-white shadow-lg`}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Avatar className={`${index === 0 ? 'h-16 w-16' : 'h-12 w-12'} border-2 border-white`}>
                      <AvatarImage src={entry.profilePicture} alt={entry.displayName} />
                      <AvatarFallback className="bg-white/20 backdrop-blur">
                        {entry.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
                      {getMedalIcon(entry.rank)}
                    </div>
                  </div>
                  <div className={`font-bold ${index === 0 ? 'text-base' : 'text-sm'} truncate w-full`}>
                    {entry.displayName}
                  </div>
                  <div className={`${index === 0 ? 'text-2xl' : 'text-xl'} font-bold mt-1`}>
                    {entry.totalScore}
                  </div>
                  <div className="text-xs opacity-90">
                    {entry.quizCount} {entry.quizCount === 1 ? 'quiz' : 'quizzes'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rest of leaderboard */}
        {leaderboard.length > 3 && (
          <div className="space-y-2">
            {leaderboard.slice(3, 10).map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-muted-foreground min-w-[24px]">
                    #{entry.rank}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.profilePicture} alt={entry.displayName} />
                    <AvatarFallback className="text-xs">
                      {entry.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{entry.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.quizCount} {entry.quizCount === 1 ? 'quiz' : 'quizzes'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span>{entry.totalScore}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardWidget;
