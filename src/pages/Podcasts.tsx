import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { podcastService, Podcast } from '@/services/podcast.service';
import { 
  Play, Eye, Calendar, ExternalLink, MessageSquare, 
  Podcast as PodcastIcon, Sparkles, TrendingUp, Users,
  Code2, Brain, Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Podcasts = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const data = await podcastService.getAllPodcasts({ status: 'published' });
      setPodcasts(data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter((podcast) =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const stats = [
    { label: 'Total Podcasts', value: podcasts.length, icon: PodcastIcon },
    { label: 'Total Views', value: podcasts.reduce((acc, p) => acc + p.views, 0), icon: Eye },
    { label: 'This Month', value: podcasts.filter(p => new Date(p.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2070" 
            alt="Podcasts" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30" />
        </div>

        {/* Animated Background Elements */}
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Code2 className="h-32 w-32 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ rotate: -360, y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="h-24 w-24 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <PodcastIcon className="h-3 w-3 mr-1" />
              AI Dev Community Podcasts
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Watch Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Podcasts</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Explore insightful conversations about AI, technology, and development. 
              Join the discussion on Discord after each episode!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Input
                type="text"
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                🔍
              </span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredPodcasts.length} {filteredPodcasts.length === 1 ? 'Podcast' : 'Podcasts'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Podcasts Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPodcasts.length === 0 ? (
            <div className="text-center py-20">
              <PodcastIcon className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No Podcasts Yet</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No podcasts match your search. Try different keywords."
                  : "Check back soon for our latest episodes!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPodcasts.map((podcast, index) => (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden h-full flex flex-col">
                    {/* Thumbnail or YouTube Embed */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {podcast.youtubeUrl ? (
                        <iframe
                          src={getYouTubeEmbedUrl(podcast.youtubeUrl)}
                          title={podcast.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : podcast.thumbnailUrl ? (
                        <img 
                          src={podcast.thumbnailUrl} 
                          alt={podcast.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <PodcastIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <CardHeader className="flex-grow">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {podcast.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {podcast.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{podcast.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(podcast.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {podcast.youtubeUrl && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            asChild
                          >
                            <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-1" />
                              Watch
                            </a>
                          </Button>
                        )}
                        {podcast.discordLink && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <a href={podcast.discordLink} target="_blank" rel="noopener noreferrer">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Discuss
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Want to suggest a podcast topic?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Head over to our home page to vote on existing topics or submit your own ideas!
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              asChild
              className="group"
            >
              <Link to="/">
                Vote for Topics
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Podcasts;
