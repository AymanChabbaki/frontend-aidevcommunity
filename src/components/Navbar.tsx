import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut, Languages, Menu, ChevronDown } from 'lucide-react';
import NotificationToggle from './NotificationToggle';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/events', label: t.nav.events },
    { to: '/members', label: t.nav.members },
    { to: '/podcasts', label: 'Podcasts' },
    { to: '/polls', label: 'Polls' },
    { to: '/forms', label: 'Forms' },
    { to: '/quizzes', label: 'Quizzes' },
    { to: '/contact', label: t.nav.contact },
  ];

  // Dynamic user links based on role
  const getUserLinks = () => {
    if (!isAuthenticated || !user) return [];
    
    const role = user.role;
    
    if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard' },
        { to: '/admin/events', label: 'Manage Events' },
        { to: '/admin/users', label: 'Manage Users' },
      ];
    } else if (role === 'STAFF') {
      return [
        { to: '/staff/dashboard', label: 'Staff Dashboard' },
        { to: '/staff/events', label: 'Manage Events' },
        { to: '/staff/qr-scanner', label: 'QR Scanner' },
      ];
    } else {
      return [
        { to: '/dashboard', label: t.nav.dashboard },
        { to: '/profile', label: t.nav.profile },
        { to: '/notifications', label: t.nav.notifications },
      ];
    }
  };

  const userLinks = getUserLinks();

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b shadow-lg backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/logo.png" 
                alt="AI Dev Community" 
                className="h-12 w-12 relative z-10 transition-transform group-hover:scale-110" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2314b8a6;stop-opacity:1" /><stop offset="100%" style="stop-color:%236366f1;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad)" width="100" height="100" rx="20"/><text x="50" y="50" font-size="50" font-weight="bold" text-anchor="middle" dy=".35em" fill="white">AI</text></svg>';
                }} 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Dev Community
              </span>
              <span className="text-xs text-muted-foreground">Learn • Build • Connect</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <div className="relative">
                        {user?.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.displayName}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${
                            user?.photoUrl ? 'hidden' : ''
                          }`}
                        >
                          <span className="font-semibold text-white text-xs">
                            {user?.displayName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-semibold">{user?.displayName}</div>
                    <div className="px-2 py-0.5 text-xs text-muted-foreground">{user?.email}</div>
                    <DropdownMenuItem asChild>
                      <Link to={
                        user?.role === 'ADMIN' ? '/admin/dashboard' :
                        user?.role === 'STAFF' ? '/staff/dashboard' :
                        '/dashboard'
                      }>{t.nav.dashboard}</Link>
                    </DropdownMenuItem>
                    {user?.role === 'USER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/my-registrations">My Registrations</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile">{t.nav.profile}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'STAFF' && (
                      <DropdownMenuItem asChild>
                        <Link to="/staff/events">Organizer</Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">{t.nav.login}</Link>
                </Button>
                <Button asChild className="gradient-primary">
                  <Link to="/register">{t.nav.register}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Completely outside nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Slide Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-2xl z-[100] lg:hidden overflow-y-auto"
            >
                {/* Header */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90"></div>
                  <div className="relative px-6 py-8">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white rounded-xl blur-md opacity-30"></div>
                        <img 
                          src="/logo.png" 
                          alt="AI Dev Community" 
                          className="h-14 w-14 relative z-10" 
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100" rx="20"/><text x="50" y="50" font-size="50" font-weight="bold" text-anchor="middle" dy=".35em" fill="%2314b8a6">AI</text></svg>';
                          }} 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-white">
                          AI Dev Community
                        </span>
                        <span className="text-xs text-white/80">Learn • Build • Connect</span>
                      </div>
                    </Link>
                    
                    {isAuthenticated && user && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            {user.photoUrl ? (
                              <img
                                src={user.photoUrl}
                                alt={user.displayName}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${
                                user.photoUrl ? 'hidden' : ''
                              }`}
                            >
                              <span className="text-lg font-bold text-white">
                                {user.displayName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                            <p className="text-xs text-white/70 truncate">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-full">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="px-4 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 group"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {userLinks.length > 0 && (
                    <>
                      <div className="my-4 border-t border-border"></div>
                      <div className="space-y-1">
                        {userLinks.map((link, index) => (
                          <motion.div
                            key={link.to}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (navLinks.length + index) * 0.05 }}
                          >
                            <Link
                              to={link.to}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 group"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              {link.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}

                  {!isAuthenticated && (
                    <>
                      <div className="my-4 border-t border-border"></div>
                      <div className="space-y-2 px-4">
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 text-center text-base font-medium border border-primary text-primary rounded-lg hover:bg-primary/10 transition-all duration-200"
                        >
                          {t.nav.login}
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 text-center text-base font-medium gradient-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {t.nav.register}
                        </Link>
                      </div>
                    </>
                  )}

                  {isAuthenticated && (
                    <>
                      <div className="my-4 border-t border-border"></div>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        {t.nav.logout}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </>
  );
};