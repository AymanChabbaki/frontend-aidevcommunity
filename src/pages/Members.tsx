import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Linkedin, Github, Twitter, Mail, Users, Sparkles, Star, Award, Code2, Brain, Rocket } from 'lucide-react';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  displayName: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  staffRole?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  email: string;
  createdAt: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userService.getPublicMembers();
      setMembers(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'STAFF':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'STAFF':
        return 'Staff';
      default:
        return 'Member';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null;
    // If it's already a full URL, return it
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    // Otherwise, prepend the backend URL
    const API_URL = import.meta.env.VITE_API_URL || 'https://backend-aidevcommunity.vercel.app/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Users className="h-16 w-16 mx-auto text-primary mb-4" />
          </motion.div>
          <p className="text-xl text-muted-foreground">Loading our amazing team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero py-32 md:py-40 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Users className="h-32 w-32 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ rotate: -360, y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="h-24 w-24 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Award className="h-28 w-28 text-white" />
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
                Our Team
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Meet Our
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Amazing Team
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Meet the passionate individuals driving our community forward and making innovation happen
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-6 text-white"
            >
              <div className="text-center">
                <div className="text-4xl font-bold">{members.length}+</div>
                <div className="text-sm text-white/70">Members</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{members.filter(m => m.role === 'ADMIN' || m.role === 'STAFF').length}</div>
                <div className="text-sm text-white/70">Leaders</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{members.reduce((acc, m) => acc + (m.skills?.length || 0), 0)}+</div>
                <div className="text-sm text-white/70">Skills</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
              whileHover={{ y: -15, scale: 1.03 }}
            >
              <Card className="p-8 shadow-card hover:shadow-glow transition-all h-full group relative overflow-hidden">
                {/* Gradient Background on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                <div className="relative z-10">
                  {/* Player Card Style Image */}
                  <div className="relative h-64 mb-6 -mx-8 -mt-8 overflow-hidden rounded-t-lg">
                    <motion.div
                      className="w-full h-full relative"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      {member.photoUrl ? (
                        <img
                          src={getImageUrl(member.photoUrl) || ''}
                          alt={member.displayName}
                          className="w-full h-full object-contain bg-gradient-to-br from-muted to-muted/50"
                          onError={(e) => {
                            const initials = getInitials(member.displayName);
                            e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2314b8a6;stop-opacity:1" /><stop offset="100%" style="stop-color:%230d9488;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad1)" width="400" height="300"/><text x="200" y="150" font-size="80" text-anchor="middle" dy=".3em" fill="white" font-weight="bold">${initials}</text></svg>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white text-6xl font-bold">
                          {getInitials(member.displayName)}
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Member Name Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                          {member.displayName}
                        </h3>
                        {member.role === 'STAFF' && member.staffRole && (
                          <p className="text-sm font-medium text-white/90 drop-shadow">
                            {member.staffRole}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant={getRoleBadgeVariant(member.role) as any} className="text-sm px-4 py-1.5">
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>
                    
                    {member.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed px-2">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.skills.map((skill, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-xs font-medium rounded-full hover:from-primary/30 hover:to-secondary/30 transition-all cursor-default"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-primary/10">
                    {member.linkedin && (
                      <motion.a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Linkedin className="h-5 w-5" />
                      </motion.a>
                    )}
                    {member.github && (
                      <motion.a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Github className="h-5 w-5" />
                      </motion.a>
                    )}
                    {member.twitter && (
                      <motion.a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Twitter className="h-5 w-5" />
                      </motion.a>
                    )}
                    <motion.a
                      href={`mailto:${member.email}`}
                      className="p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Mail className="h-5 w-5" />
                    </motion.a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {members.length === 0 && (
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
                <Users className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">No Team Members Yet</h3>
              <p className="text-muted-foreground">Check back soon to meet our amazing team!</p>
            </Card>
          </motion.div>
        )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Members;