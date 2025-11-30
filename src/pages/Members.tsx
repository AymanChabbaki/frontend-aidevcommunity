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
  studyLevel?: string | null;
  studyProgram?: string | null;
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
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dmznisgxq/image/upload/v1764464353/b38daf15-402d-440f-aad8-57731b39c047_ofosvj.jpg" 
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

      {/* Team Showcase - Football Style */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, currentColor 35px, currentColor 36px), repeating-linear-gradient(90deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)',
            backgroundSize: '36px 36px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Leadership Team - Large Showcase */}
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-white border-0 text-base px-6 py-2">
                <Award className="h-4 w-4 mr-2" />
                Leadership Team
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Champions</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Leading the community with vision, passion, and dedication
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {members.filter(m => m.role === 'ADMIN' || m.role === 'STAFF').map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-muted/50 to-background border border-border shadow-xl hover:shadow-2xl transition-all duration-500">
                    {/* Number Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* Photo Section - Full Width */}
                    <div className="relative h-80 overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        {member.photoUrl ? (
                          <img
                            src={getImageUrl(member.photoUrl) || ''}
                            alt={member.displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const initials = getInitials(member.displayName);
                              e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2314b8a6;stop-opacity:1" /><stop offset="100%" style="stop-color:%236366f1;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad${index})" width="400" height="400"/><text x="200" y="200" font-size="120" text-anchor="middle" dy=".3em" fill="white" font-weight="bold">${initials}</text></svg>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white text-7xl font-bold">
                            {getInitials(member.displayName)}
                          </div>
                        )}
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      </motion.div>

                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                            {member.displayName}
                          </h3>
                          {member.staffRole && (
                            <p className="text-sm font-medium text-primary-foreground/90 mb-2 drop-shadow">
                              {member.staffRole}
                            </p>
                          )}
                          {member.studyLevel && (
                            <p className="text-xs text-primary-foreground/80 mb-3 drop-shadow">
                              {member.studyLevel.charAt(0) + member.studyLevel.slice(1).toLowerCase()}
                              {member.studyProgram && ` - ${member.studyProgram.replace(/_/g, ' ')}`}
                            </p>
                          )}
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            {getRoleLabel(member.role)}
                          </Badge>
                        </motion.div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-6">
                      {member.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {member.bio}
                        </p>
                      )}

                      {member.skills && member.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {member.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                +{member.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Social Links */}
                      <div className="flex items-center gap-2 pt-4 border-t">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${member.email}`}
                          className="p-2 rounded-lg hover:bg-primary hover:text-white transition-all ml-auto"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community Members */}
          {members.filter(m => m.role === 'USER').length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <Badge className="mb-4 bg-gradient-to-r from-secondary to-accent text-white border-0 text-base px-6 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  Community Members
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">The Squad</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Talented individuals contributing to our mission
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {members.filter(m => m.role === 'USER').map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-card border shadow-lg hover:shadow-xl transition-all">
                      {/* Compact Photo */}
                      <div className="relative h-48 overflow-hidden">
                        {member.photoUrl ? (
                          <img
                            src={getImageUrl(member.photoUrl) || ''}
                            alt={member.displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const initials = getInitials(member.displayName);
                              e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2314b8a6;stop-opacity:1" /><stop offset="100%" style="stop-color:%236366f1;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad${index})" width="300" height="300"/><text x="150" y="150" font-size="80" text-anchor="middle" dy=".3em" fill="white" font-weight="bold">${initials}</text></svg>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl font-bold">
                            {getInitials(member.displayName)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      {/* Compact Info */}
                      <div className="p-4">
                        <h4 className="font-bold text-base mb-1 truncate">{member.displayName}</h4>
                        <p className="text-xs text-muted-foreground mb-3 truncate">
                          {member.bio || 'Community Member'}
                        </p>
                        <div className="flex gap-2">
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-primary hover:text-white transition-all">
                              <Linkedin className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {member.github && (
                            <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-primary hover:text-white transition-all">
                              <Github className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <a href={`mailto:${member.email}`} className="p-1.5 rounded hover:bg-primary hover:text-white transition-all ml-auto">
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {members.length === 0 && !loading && (
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
      </section>

      <Footer />
    </div>
  );
};

export default Members;