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
import { Bell, User, LogOut, Languages, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/events', label: t.nav.events },
    { to: '/members', label: t.nav.members },
    { to: '/polls', label: 'Polls' },
    { to: '/forms', label: 'Forms' },
    { to: '/contact', label: t.nav.contact },
  ];

  // Dynamic user links based on role
  const getUserLinks = () => {
    if (!isAuthenticated || !user) return [];
    
    const role = user.role;
    
    if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard' },
        { to: '/organizer/events', label: 'Manage Events' },
        { to: '/admin/users', label: 'Manage Users' },
        { to: '/profile', label: t.nav.profile },
      ];
    } else if (role === 'STAFF') {
      return [
        { to: '/staff/dashboard', label: 'Staff Dashboard' },
        { to: '/organizer/events', label: 'Manage Events' },
        { to: '/organizer/qr-scanner', label: 'QR Scanner' },
        { to: '/profile', label: t.nav.profile },
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
                <Link to="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-semibold">{user?.displayName}</div>
                    <div className="px-2 py-0.5 text-xs text-muted-foreground">{user?.email}</div>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">{t.nav.dashboard}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t.nav.profile}</Link>
                    </DropdownMenuItem>
                    {user?.role === 'STAFF' && (
                      <DropdownMenuItem asChild>
                        <Link to="/organizer/events">Organizer</Link>
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  >
                    {link.label}
                  </Link>
                ))}
                {userLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    >
                      {t.nav.register}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};