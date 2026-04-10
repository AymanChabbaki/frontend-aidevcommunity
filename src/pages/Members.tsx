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

  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'https://backend-aidevcommunity.vercel.app/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-24 h-24 rounded-full border-t-2 border-primary animate-spin" />
          </motion.div>
          <p className="mt-8 text-primary font-medium tracking-widest uppercase text-sm">Initializing Nebula...</p>
        </div>
      </div>
    );
  }

  const leadership = members.filter(m => (m.role === 'ADMIN' || m.role === 'STAFF') && m.displayName !== 'Admin User');
  const community = members.filter(m => m.role === 'USER' && m.displayName !== 'Admin User');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary selection:text-white overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 opacity-40 bg-[url('https://res.cloudinary.com/dmznisgxq/image/upload/v1764464353/b38daf15-402d-440f-aad8-57731b39c047_ofosvj.jpg')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/60 to-[#0a0a0c]" />

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-5xl mx-auto"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              The Community
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">
              BEYOND THE <br />
              <span className="bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
                CONSTELLATION
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              We are not just a group of developers. We are the architects of the next digital era.
              Meet the minds behind AI Dev Community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="relative pb-40 z-10">
        <div className="container mx-auto px-4 space-y-32">

          {/* Leadership - Focus Grid */}
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary/80">Command Center</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {leadership.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                  <div className="relative bg-[#111115]/80 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] h-full flex flex-col items-center text-center">
                    {/* Futuristic Avatar Frame */}
                    <div className="relative mb-8 pt-4">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors" />
                      <div className="relative w-40 h-40 rounded-full p-1.5 bg-gradient-to-tr from-primary to-secondary overflow-hidden">
                        <div className="w-full h-full rounded-full bg-[#111115] p-1 overflow-hidden">
                          {member.photoUrl ? (
                            <img
                              src={getImageUrl(member.photoUrl) || ''}
                              alt={member.displayName}
                              className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center text-5xl font-black bg-[#1a1a20]">
                              {getInitials(member.displayName)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black font-bold uppercase text-[10px] tracking-widest py-1 px-4 rounded-full border-4 border-[#111115]">
                        {member.role}
                      </Badge>
                    </div>

                    <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors tracking-tight">
                      {member.displayName}
                    </h3>
                    <p className="text-sm text-primary font-medium tracking-widest uppercase mb-4 opacity-70">
                      {member.staffRole || 'Core Architect'}
                    </p>

                    <p className="text-white/40 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                      {member.bio || 'Architecting complex systems and fostering community innovation through advanced AI technologies.'}
                    </p>

                    <div className="mt-auto flex gap-4">
                      {member.github && (
                        <a href={formatUrl(member.github)} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:scale-110 transition-all">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={formatUrl(member.linkedin)} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:scale-110 transition-all">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={formatUrl(member.twitter)} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 hover:scale-110 transition-all">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      <a href={`mailto:${member.email}`} className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all">
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community - The Grid */}
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">The Vanguard</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {community.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] p-6 rounded-[2rem] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10">
                        {member.photoUrl ? (
                          <img
                            src={getImageUrl(member.photoUrl) || ''}
                            alt={member.displayName}
                            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1a1a20] flex items-center justify-center font-bold text-xl">
                            {getInitials(member.displayName)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold truncate text-lg group-hover:text-primary transition-colors">{member.displayName}</h4>
                        <p className="text-xs text-white/30 truncate uppercase tracking-tighter">Verified Member</p>
                      </div>
                    </div>

                    <p className="text-sm text-white/40 font-light mb-6 line-clamp-2 h-10">
                      {member.bio || 'Active contributor and innovator within the AI ecosystem.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        {member.github && (
                          <a href={formatUrl(member.github)} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={formatUrl(member.linkedin)} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <a href={`mailto:${member.email}`} className="text-xs font-bold text-primary group-hover:tracking-widest transition-all">
                        CONNECT
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Empty State */}
      {members.length === 0 && !loading && (
        <div className="relative z-10 py-40 text-center">
          <Rocket className="w-20 h-20 mx-auto text-primary mb-8 opacity-20 animate-bounce" />
          <h3 className="text-4xl font-black mb-4 tracking-tight">NEBULA IS CURRENTLY VOID</h3>
          <p className="text-white/40">Deployment of the community fleet is pending.</p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Members;
