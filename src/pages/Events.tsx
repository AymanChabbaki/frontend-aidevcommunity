import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/event.service';
import { 
  Search, Calendar, Filter, Sparkles, TrendingUp, 
  MapPin, Users, Clock, Tag, ArrowRight, Zap,
  Code2, Brain, Rocket
} from 'lucide-react';

const Events = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());

  const categories = ['all', 'workshop', 'hackathon', 'conference', 'meetup', 'webinar'];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserRegistrations();
    }
  }, [isAuthenticated]);

  const fetchUserRegistrations = async () => {
    try {
      const response = await eventService.getMyRegistrations();
      const registeredEventIds = new Set<string>(
        response.data.map((reg: any) => reg.eventId)
      );
      setUserRegistrations(registeredEventIds);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      const eventsData = response.data || [];
      
      // Map events to EventCard format
      const mappedEvents = eventsData.map((event: any) => ({
        ...event,
        date: event.startAt,
        location: event.locationText,
        image: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        registrations: event._count?.registrations || 0,
      }));
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.locationText || event.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      event.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    const now = new Date();
    const eventDate = new Date(event.startAt || event.date);
    const matchesFilter = 
      (activeFilter === 'upcoming' && eventDate >= now) ||
      (activeFilter === 'past' && eventDate < now) ||
      activeFilter === 'all';
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar },
    { label: 'Upcoming', value: events.filter(e => new Date(e.startAt || e.date) >= new Date()).length, icon: TrendingUp },
    { label: 'Categories', value: new Set(events.map(e => e.category).filter(Boolean)).size, icon: Tag },
    { label: 'Total Registrations', value: events.reduce((acc, e) => acc + (e.registrations || 0), 0), icon: Users },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dmznisgxq/image/upload/v1764464496/1c6aed91-81c6-4798-a892-5022bbf99bf0_mh4ek1.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20" />
        </div>
        {/* Animated Background Elements */}
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Calendar className="h-32 w-32 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ rotate: -360, y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            >
              <Rocket className="h-24 w-24 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Code2 className="h-28 w-28 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto -mt-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Discover Events
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Upcoming
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Tech Events
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Join workshops, hackathons, and tech talks to level up your skills
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-white"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 text-center shadow-card hover:shadow-glow transition-all">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  </motion.div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap justify-center lg:justify-start">
              {['upcoming', 'past', 'all'].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="capitalize"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {filter}
                </Button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap justify-center lg:justify-end">
              {categories.map((category) => (
                <motion.div key={category} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 text-sm capitalize"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <p className="text-lg text-muted-foreground">
                  Showing <span className="font-bold text-primary">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
                </p>
              </motion.div>

              <AnimatePresence mode="popLayout">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -10 }}
                    >
                      <EventCard 
                        {...event} 
                        isRegistered={userRegistrations.has(event.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Card className="p-12 max-w-md mx-auto">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Calendar className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setActiveFilter('upcoming'); }}>
                  Clear Filters
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="h-16 w-16 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-5xl font-bold mb-6">
              Want to Organize an Event?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Become an organizer and share your knowledge with our community
            </p>
            <Button asChild size="lg" className="text-lg gradient-accent group">
              <a href="mailto:events@aidevclub.com">
                Get in Touch
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;