import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, Vote, FileText, Award, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { eventService } from '@/services/event.service';
import { pollService } from '@/services/poll.service';
import { formService } from '@/services/form.service';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [myForms, setMyForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's event registrations
      const registrationsRes = await eventService.getMyRegistrations();
      setMyEvents(registrationsRes.data || []);

      // Fetch user's poll votes
      const votesRes = await pollService.getMyVotes();
      setMyVotes(votesRes.data || []);

      // Fetch user's form submissions
      const formsRes = await formService.getUserSubmissions();
      setMyForms(formsRes.data || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: Calendar,
      label: 'Events Registered',
      value: myEvents.length,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Vote,
      label: 'Polls Voted',
      value: myVotes.length,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: FileText,
      label: 'Forms Submitted',
      value: myForms.length,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Award,
      label: 'Badges Earned',
      value: myEvents.length,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome, {user?.displayName || user?.name}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">Here's your activity overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 shadow-card hover:shadow-glow transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* My Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 shadow-card mb-8">
            <h2 className="text-2xl font-bold mb-4">{t.dashboard.myEvents}</h2>
            {myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{registration.event?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {registration.event?.locationText} • {new Date(registration.event?.startAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/events/${registration.eventId}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No events registered yet</p>
                <Button asChild className="gradient-primary">
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 shadow-card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/events" className="flex flex-col items-center gap-2">
                  <Calendar className="h-8 w-8" />
                  <span>Browse Events</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/polls" className="flex flex-col items-center gap-2">
                  <Vote className="h-8 w-8" />
                  <span>Vote on Polls</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/profile" className="flex flex-col items-center gap-2">
                  <Award className="h-8 w-8" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;