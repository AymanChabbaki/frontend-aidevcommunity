import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Footer } from '@/components/Footer';
import { 
  Mail, MapPin, Phone, Send, Sparkles, MessageCircle, 
  Clock, Globe, CheckCircle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { contactService, ContactMessage } from '@/services/contact.service';

const Contact = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await contactService.sendMessage(formData);
      
      toast.success('Message sent successfully!', {
        description: 'We\'ll get back to you within 24-48 hours.',
        icon: <CheckCircle className="h-5 w-5" />,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      toast.error('Failed to send message', {
        description: error.response?.data?.error || 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contactaidevcommunity@gmail.com',
      link: 'mailto:contactaidevcommunity@gmail.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+212 687830201',
      link: 'tel:+212687830201',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'faculty of science Ben M\'sik, Casablanca, Morocco',
      link: 'https://maps.app.goo.gl/sZLcZNY3FuQZbkBP6',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Mon - Fri: 9AM - 6PM PST',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dmznisgxq/image/upload/v1764464539/0a4a2c55-d369-44ac-82d2-fccbe56b451f_gexk5l.jpg" 
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
              <MessageCircle className="h-32 w-32 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ rotate: -360, y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mail className="h-24 w-24 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Send className="h-28 w-28 text-white" />
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
                Get in Touch
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Let's Talk
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Together
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 shadow-card hover:shadow-glow transition-all h-full">
                  <motion.div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} mb-4`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <info.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">{info.title}</h3>
                  {info.link ? (
                    <a 
                      href={info.link} 
                      target={info.link.startsWith('http') ? '_blank' : undefined}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{info.value}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4">
                <MessageCircle className="h-3 w-3 mr-1" />
                Send Message
              </Badge>
              <h2 className="text-5xl font-bold mb-4">Drop Us a Line</h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below and we'll get back to you within 24-48 hours
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 md:p-12 shadow-card hover:shadow-glow transition-all">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">Your Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        className="h-12"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">Your Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        className="h-12"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base">Subject *</Label>
                    <Input 
                      id="subject" 
                      placeholder="What's this about?" 
                      value={formData.subject}
                      onChange={handleChange}
                      required 
                      className="h-12"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-base">Your Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={8}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-accent group h-14 text-lg" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map or Additional Info Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Globe className="h-16 w-16 mx-auto text-primary mb-6" />
              <h2 className="text-4xl font-bold mb-4">We're Here to Help</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our team is dedicated to providing you with the best support possible. 
                Whether you have a question about our events, want to collaborate, or just 
                want to say hello, we're all ears!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  24-48 Hour Response Time
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Friendly Support Team
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Always Available
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;