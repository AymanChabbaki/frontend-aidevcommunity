import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Mail, ArrowRight, Instagram, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-10"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="AI Dev Community" className="h-12 w-12 object-contain" />
              <h3 className="text-2xl font-bold text-white">AI Dev Community</h3>
            </div>
            <p className="text-slate-300 mb-6 text-lg leading-relaxed">
              Building the future of AI together. Join our vibrant community of developers, innovators, and tech enthusiasts.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-white font-semibold">Stay Updated</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-primary"
                />
                <Button className="gradient-accent">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <a
                href="https://discord.gg/XduuPdg6bG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#5865F2]/20 hover:border-[#5865F2] border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="Discord"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/aidev_communityfsbm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-pink-500/20 hover:border-pink-500 border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/share/G6KF7b56dSLF2SYh/?mibextid=qi2Omg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-600/20 hover:border-blue-600 border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/ai-dev-community"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:border-blue-500 border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://chat.whatsapp.com/Ftvj3lJBgCy6MtLwGeM2kv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-green-500/20 hover:border-green-500 border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@ai.dev.community"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-black/40 hover:border-white border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="TikTok"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="mailto:contactaidevcommunity@gmail.com"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-red-500/20 hover:border-red-500 border border-transparent flex items-center justify-center text-white transition-all hover:scale-110"
                title="Gmail"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8">
            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Events', to: '/events' },
                  { label: 'Past Events', to: '/past-events' },
                  { label: 'Members', to: '/members' },
                  { label: 'Polls', to: '/polls' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link 
                      to={item.to} 
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:ml-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact', to: '/contact' },
                  { label: 'Dashboard', to: '/dashboard' },
                  { label: 'Profile', to: '/profile' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link 
                      to={item.to} 
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:ml-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} AI Dev Community. Développé par <a href="https://github.com/AymanChabbaki" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ayman Chabbaki</a>.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:contactaidevcommunity@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="h-4 w-4 inline mr-1" />
                contactaidevcommunity@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
