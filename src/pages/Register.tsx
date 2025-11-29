import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { UserPlus, ArrowRight, Code2, Rocket, Star, Award, TrendingUp, Users } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await register(name, email, password);
      if (success) {
        toast.success(t.auth.registerSuccess);
        
        // Store that user needs to complete the form
        localStorage.setItem('needsOnboarding', 'true');
        
        // Navigate to dashboard where the onboarding modal will show
        navigate('/dashboard');
      } else {
        toast.error('User already exists');
      }
    } catch (error) {
      toast.error(t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 opacity-20"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Code2 className="h-32 w-32 text-white" />
          </motion.div>
          <motion.div
            className="absolute bottom-32 left-20 opacity-20"
            animate={{ rotate: -360, y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Rocket className="h-24 w-24 text-white" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Star className="h-64 w-64 text-white" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-white space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-base px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              Start Your Journey
            </Badge>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Build Your Future in
              <span className="block bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300 bg-clip-text text-transparent">
                AI & Technology
              </span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Access cutting-edge resources, collaborate on innovative projects, and become part of a thriving tech community.
            </p>
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {[
              { icon: Code2, text: 'Access to exclusive coding workshops' },
              { icon: Award, text: 'Certificates and recognition programs' },
              { icon: TrendingUp, text: 'Career growth opportunities' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/90">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20"
          >
            {[
              { value: '500+', label: 'Members' },
              { value: '100+', label: 'Events' },
              { value: '50+', label: 'Projects' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Register Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 mb-6 shadow-lg"
            >
              <UserPlus className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground text-lg">
              Start your tech journey with us
            </p>
          </div>

          {/* Register Form */}
          <Card className="p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">{t.auth.name}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">{t.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">{t.auth.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 h-12 text-base group" 
                disabled={loading}
              >
                {loading ? t.common.loading : t.auth.register}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {t.auth.hasAccount}{' '}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  {t.auth.login}
                </Link>
              </p>
            </div>

            {/* Terms Notice */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-center text-muted-foreground">
              By registering, you agree to our Terms of Service and Privacy Policy
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;