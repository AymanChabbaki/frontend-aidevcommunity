import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { EventCard } from '@/components/EventCard';
import { Footer } from '@/components/Footer';
import { ArrowRight, Calendar, Users, Award, Sparkles, TrendingUp, Heart, Code2, Zap, Brain, Rocket, Image as ImageIcon } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { homeContentService, HomeContent } from '@/services/home-content.service';

const Index = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [homeContent, setHomeContent] = useState<Partial<HomeContent>>({
    heroTitle: 'Welcome to AI Dev Community',
    heroSubtitle: 'Join us in exploring the future of artificial intelligence and machine learning',
    heroCtaText: 'Get Started',
    heroCtaLink: '/register',
    showPastEvents: true,
    statsEnabled: true,
    totalEvents: 0,
    totalMembers: 0,
    activeProjects: 0,
    featuredEventIds: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentData, eventsResponse] = await Promise.all([
        homeContentService.getHomeContent(),
        eventService.getAllEvents()
      ]);
      
      setHomeContent(contentData);
      const events = eventsResponse.data || [];
      
      // Map events to EventCard format
      const mappedEvents = events.map((event: any) => ({
        ...event,
        date: event.startAt,
        location: event.locationText,
        image: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        registrations: event.registrations?.length || 0
      }));
      
      const now = new Date();
      const upcoming = mappedEvents.filter((event: any) => 
        new Date(event.startAt) > now
      ).slice(0, 3);
      
      const past = mappedEvents.filter((event: any) => 
        new Date(event.endAt) < now && event.imageUrl
      ).slice(0, 6);

      // Get featured events
      const featured = contentData.featuredEventIds && contentData.featuredEventIds.length > 0
        ? mappedEvents.filter((event: any) => contentData.featuredEventIds.includes(event.id)).slice(0, 3)
        : past.slice(0, 3);

      setUpcomingEvents(upcoming);
      setPastEvents(past);
      setFeaturedEvents(featured);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden -mt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dmznisgxq/image/upload/v1764464065/ebaa0d7d-edec-4e5d-9bcb-d5202154e802_rurmmh.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20" />
        </div>
        {/* Animated Background Elements */}
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Code2 className="h-32 w-32 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ 
                rotate: -360,
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="h-24 w-24 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-20">
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Rocket className="h-28 w-28 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Building the Future Together
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {homeContent.heroTitle || t.hero.title}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-white/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {homeContent.heroSubtitle || t.hero.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Button asChild size="lg" className="text-lg gradient-accent group">
                  <Link to={homeContent.heroCtaLink || '/events'}>
                    {homeContent.heroCtaText || t.hero.cta}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="text-lg">
                  <Link to="/events">{t.hero.learnMore}</Link>
                </Button>
              </motion.div>

              {/* Stats */}
              {homeContent.statsEnabled && (
                <motion.div 
                  className="grid grid-cols-3 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{homeContent.totalEvents}+</div>
                    <div className="text-sm text-white/70">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{homeContent.totalMembers}+</div>
                    <div className="text-sm text-white/70">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{homeContent.activeProjects}+</div>
                    <div className="text-sm text-white/70">Projects</div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right: Animated Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="relative h-[500px]">
                {featuredEvents.slice(0, 3).map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="absolute rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      width: index === 0 ? '70%' : '60%',
                      height: index === 0 ? '300px' : '200px',
                      top: index === 0 ? '0%' : index === 1 ? '30%' : '60%',
                      left: index === 0 ? '0%' : index === 1 ? '35%' : '10%',
                      zIndex: 3 - index,
                    }}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                  >
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <p className="text-white font-semibold text-sm">{event.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Regular Events</h3>
              <p className="text-muted-foreground">
                Weekly workshops, hackathons, and tech talks
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Vibrant Community</h3>
              <p className="text-muted-foreground">
                Connect with passionate developers and innovators
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn & Grow</h3>
              <p className="text-muted-foreground">
                Skill up with hands-on projects and mentorship
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl font-bold mb-4">{t.events.title}</h2>
            <p className="text-xl text-muted-foreground">
              Join our upcoming workshops and events
            </p>
          </motion.div>

          {upcomingEvents.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EventCard {...event} />
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <Button asChild size="lg" variant="outline">
                  <Link to="/events">View All Events</Link>
                </Button>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Gallery */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4">
                <ImageIcon className="h-3 w-3 mr-1" />
                Event Gallery
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Past Events</h2>
              <p className="text-xl text-muted-foreground">
                Highlights from our recent community gatherings
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="overflow-hidden group cursor-pointer">
                    <div className="relative h-64 overflow-hidden">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white font-bold text-lg mb-2">{event.title}</h3>
                        <p className="text-white/80 text-sm line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Button asChild variant="outline" size="lg">
                <Link to="/past-events">
                  View All Past Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Join?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Become part of our growing community of AI and tech enthusiasts
            </p>
            <Button asChild size="lg" className="gradient-accent">
              <Link to="/register">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;