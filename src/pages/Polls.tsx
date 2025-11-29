import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Vote, CheckCircle, BarChart3, Users, TrendingUp, AlertCircle, Lock, Sparkles, Loader2 } from 'lucide-react';
import { pollService } from '@/services/poll.service';

interface PollOption {
  id: string;
  text: string;
  textFr?: string;
  textAr?: string;
  _count?: { votes: number };
}

interface Poll {
  id: string;
  question: string;
  questionFr?: string;
  questionAr?: string;
  options: PollOption[];
  startAt: string;
  endAt: string;
  visibility: string;
  status: string;
  createdAt: string;
  _count?: { votes: number };
}

const Polls = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    if (isAuthenticated && polls.length > 0) {
      fetchUserVotes();
    }
  }, [isAuthenticated, polls]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollService.getAllPolls();
      setPolls(response.data || []);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const votes: Record<string, string> = {};
      for (const poll of polls) {
        const response = await pollService.getUserVote(poll.id);
        if (response.data) {
          votes[poll.id] = response.data.optionId;
        }
      }
      setUserVotes(votes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    if (userVotes[pollId]) {
      toast.error('You have already voted on this poll');
      return;
    }

    try {
      await pollService.vote(pollId, optionId);
      
      // Update local state
      setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
      
      // Refresh polls to get updated counts
      await fetchPolls();
      
      toast.success(t.polls.votedSuccess);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit vote');
    }
  };

  const totalPolls = polls.length;
  const activePolls = polls.filter(p => p.status === 'ACTIVE').length;
  const totalVotesAllPolls = polls.reduce((sum, poll) => {
    const pollVotes = poll.options?.reduce((s, opt) => s + (opt._count?.votes || 0), 0) || 0;
    return sum + pollVotes;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero py-20 -mt-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 left-10 opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <BarChart3 className="h-32 w-32 text-white" />
          </motion.div>
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 right-10 opacity-20"
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          >
            <Vote className="h-24 w-24 text-white" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 25, repeat: Infinity }}
          >
            <Sparkles className="h-96 w-96 text-white" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-base px-4 py-2">
              <Vote className="h-4 w-4 mr-2" />
              Community Polls
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Your Voice
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Matters
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Share your opinion and help shape our community's future
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
          >
            {[
              { icon: BarChart3, label: 'Total Polls', value: totalPolls, color: 'from-blue-500 to-cyan-500' },
              { icon: Vote, label: 'Active Polls', value: activePolls, color: 'from-purple-500 to-pink-500' },
              { icon: Users, label: 'Total Votes', value: totalVotesAllPolls, color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Authentication Alert */}
      {!isAuthenticated && (
        <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <Lock className="h-5 w-5 text-orange-500" />
              <AlertDescription className="text-base ml-2">
                <strong>Login required:</strong> Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold underline hover:text-primary"
                >
                  sign in
                </button>{' '}
                to participate in polls and see results.
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      )}

      {/* Polls Section */}
      <div className="container mx-auto px-4 max-w-4xl py-16">

        <div className="space-y-8">
          {polls.map((poll, index) => {
            const displayQuestion =
              language === 'fr'
                ? poll.questionFr
                : language === 'ar'
                  ? poll.questionAr
                  : poll.question;
            const hasVoted = userVotes[poll.id];
            const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt._count?.votes || 0), 0) || 0;

            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-8 shadow-xl border-2 hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                  {/* Gradient Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                  
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                    >
                      <Vote className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">
                        {displayQuestion || poll.question}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {totalVotes} votes
                        </span>
                        <Badge variant={poll.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {poll.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {poll.options?.map((option, optIndex) => {
                      const displayText =
                        language === 'fr'
                          ? option.textFr
                          : language === 'ar'
                            ? option.textAr
                            : option.text;
                      const optionVotes = option._count?.votes || 0;
                      const percentage =
                        totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                      const isSelected = userVotes[poll.id] === option.id;

                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + optIndex * 0.05 }}
                        >
                          {hasVoted || !isAuthenticated ? (
                            <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-medium flex items-center gap-2">
                                  {displayText || option.text}
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 200 }}
                                    >
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    </motion.div>
                                  )}
                                </span>
                                <span className="text-base font-semibold text-primary">
                                  {optionVotes} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="relative h-3 bg-background rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full justify-start text-base h-auto py-4 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-primary transition-all group"
                              onClick={() => handleVote(poll.id, option.id)}
                            >
                              <span className="flex-1 text-left">{displayText || option.text}</span>
                              <TrendingUp className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {!hasVoted && isAuthenticated && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-muted-foreground mt-6 text-center flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Click an option to cast your vote
                    </motion.p>
                  )}

                  {!isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg"
                    >
                      <p className="text-sm text-center flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4 text-orange-500" />
                        <span>Login to vote and see full results</span>
                      </p>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Polls;