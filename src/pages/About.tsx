import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { 
  Target, Users, Lightbulb, Award, Sparkles, TrendingUp, 
  Code2, Brain, Rocket, Zap, Heart, Star, ArrowRight,
  Globe, Shield, Cpu, Calendar
} from 'lucide-react';

const About = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower developers with AI knowledge and foster innovation in technology',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a supportive environment where everyone can learn and grow together',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Encouraging creative thinking and cutting-edge solutions to real-world problems',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for quality in everything we do, from events to education',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const features = [
    {
      icon: Code2,
      title: 'Hands-on Workshops',
      description: 'Practical coding sessions with real-world projects and expert guidance',
    },
    {
      icon: Brain,
      title: 'AI Learning Path',
      description: 'Structured curriculum from basics to advanced machine learning concepts',
    },
    {
      icon: Rocket,
      title: 'Hackathons',
      description: 'Competitive coding events to build innovative solutions',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect with developers and companies worldwide',
    },
    {
      icon: Shield,
      title: 'Mentorship Program',
      description: 'Learn from experienced professionals in the industry',
    },
    {
      icon: Cpu,
      title: 'Cutting-edge Tech',
      description: 'Stay updated with the latest in AI and technology',
    },
  ];

  const stats = [
    { label: 'Active Members', value: '500+', icon: Users },
    { label: 'Events Hosted', value: '100+', icon: Calendar },
    { label: 'Projects Built', value: '200+', icon: Code2 },
    { label: 'Countries', value: '15+', icon: Globe },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Foundation',
      description: 'Started as a small study group of passionate AI enthusiasts',
    },
    {
      year: '2021',
      title: 'First Hackathon',
      description: 'Organized our first 24-hour hackathon with 50+ participants',
    },
    {
      year: '2022',
      title: 'Community Growth',
      description: 'Expanded to 200+ members and partnered with tech companies',
    },
    {
      year: '2023',
      title: 'Global Reach',
      description: 'Connected with international communities and hosted online events',
    },
    {
      year: '2024',
      title: 'Innovation Hub',
      description: 'Established as a leading tech community with 500+ active members',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dmznisgxq/image/upload/v1764464454/bb7ba696-d1d6-43b0-a138-5f428b51a391_wrnuvd.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20" />
        </div>
        {/* Animated Background Elements */}
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-32 w-32 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ rotate: -360, y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-24 w-24 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="h-28 w-28 text-white" />
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
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Building the Future
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Together
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              We're a vibrant community of developers, innovators, and tech enthusiasts 
              passionate about artificial intelligence and its applications.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="text-lg gradient-accent group">
                <Link to="/register">
                  Join Our Community
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/events">Explore Events</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <Card className="p-8 text-center shadow-card hover:shadow-glow transition-all">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4"
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">
              <Heart className="h-3 w-3 mr-1" />
              Our Core Values
            </Badge>
            <h2 className="text-5xl font-bold mb-4">What Drives Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do in our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -15, scale: 1.02 }}
              >
                <Card className="p-8 shadow-card hover:shadow-glow transition-all h-full group relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} mb-6`}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
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
            className="text-center mb-16"
          >
            <Badge className="mb-4">
              <Star className="h-3 w-3 mr-1" />
              What We Offer
            </Badge>
            <h2 className="text-5xl font-bold mb-4">Community Benefits</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to grow as a developer and innovator
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="p-6 shadow-card hover:shadow-glow transition-all h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              Our Journey
            </Badge>
            <h2 className="text-5xl font-bold mb-4">Timeline</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milestones that shaped our community
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative pl-8 pb-12 border-l-4 border-primary/20 last:pb-0"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -left-6 top-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg"
                >
                  {item.year.slice(2)}
                </motion.div>
                <Card className="p-6 ml-8 shadow-card hover:shadow-glow transition-all">
                  <div className="text-sm text-muted-foreground mb-1">{item.year}</div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-12 shadow-card relative overflow-hidden">
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <div className="relative z-10">
                <Badge className="mb-6">
                  <Heart className="h-3 w-3 mr-1" />
                  Our Story
                </Badge>
                <h2 className="text-4xl font-bold mb-8">From Small Beginnings to Big Impact</h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Founded in 2020, AI Dev Community started as a small group of students passionate 
                    about artificial intelligence and machine learning. What began as weekly study 
                    sessions has grown into a thriving community of hundreds of members.
                  </p>
                  <p>
                    We organize regular workshops, hackathons, and networking events that bring 
                    together beginners and experts alike. Our mission is to make AI education 
                    accessible to everyone and foster innovation in the tech community.
                  </p>
                  <p>
                    Today, we're proud to be one of the leading tech communities in our region, 
                    with partnerships with major tech companies and universities. Our members have 
                    gone on to work at top tech companies and start their own successful ventures.
                  </p>
                  <p>
                    Whether you're just starting your journey in tech or you're an experienced 
                    developer, there's a place for you in our community. Join us and be part of 
                    something amazing!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
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
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-16 w-16 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-5xl font-bold mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Start your journey with us today and connect with amazing developers
            </p>
            <Button asChild size="lg" className="text-lg gradient-accent group">
              <Link to="/register">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;