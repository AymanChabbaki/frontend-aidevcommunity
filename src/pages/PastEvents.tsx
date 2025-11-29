import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Image as ImageIcon } from 'lucide-react';
import { eventService, Event } from '@/services/event.service';
import { Footer } from '@/components/Footer';

const PastEvents = () => {
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents({ status: 'COMPLETED' });
      const events = response.data || [];
      
      const now = new Date();
      const past = events.filter((event: Event) => 
        new Date(event.endAt) < now && event.imageUrl
      );

      setPastEvents(past);
    } catch (error) {
      console.error('Error fetching past events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <section className="gradient-primary py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Button asChild variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/10">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <ImageIcon className="h-3 w-3 mr-1" />
                Event Gallery
              </Badge>
              <h1 className="text-5xl font-bold mb-4 text-white">Past Events</h1>
              <p className="text-xl text-white/90">
                Explore highlights from our previous community gatherings, workshops, and tech talks
              </p>
            </motion.div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-64 bg-muted"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : pastEvents.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -10 }}
                    >
                      <Card className="overflow-hidden group cursor-pointer h-full flex flex-col">
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
                          <div className="absolute top-4 right-4">
                            <Badge>{event.category || 'Event'}</Badge>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary">
                              {event.status}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <h3 className="text-white font-bold text-lg mb-2">{event.title}</h3>
                            <p className="text-white/80 text-sm line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {event.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.startAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.locationText}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{event.capacity} attendees</span>
                            </div>
                          </div>
                          {event.speaker && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium text-muted-foreground">
                                Speaker: <span className="text-foreground">{event.speaker}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {pastEvents.length > 0 && (
                  <motion.div 
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-muted-foreground mb-4">
                      Showing {pastEvents.length} past {pastEvents.length === 1 ? 'event' : 'events'}
                    </p>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/events">
                        View Upcoming Events
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">No Past Events Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Check back soon for highlights from our community events
                </p>
                <Button asChild>
                  <Link to="/events">
                    View Upcoming Events
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default PastEvents;
