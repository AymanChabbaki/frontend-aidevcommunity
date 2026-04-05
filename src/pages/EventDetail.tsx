import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar, MapPin, Users, User as UserIcon, AlertCircle, CheckCircle,
  ArrowLeft, UserPlus, Eye, EyeOff, Github, Linkedin, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { eventService } from '@/services/event.service';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';

// ─── Guest Registration Modal ───────────────────────────────────────────────

interface GuestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (registration: any) => void;
  eventId: string;
  eventTitle: string;
}

const STUDY_LEVELS = ['BACHELOR', 'MASTER', 'DOCTORATE'];
const STUDY_PROGRAMS = [
  'BACHELOR_S1', 'BACHELOR_S2', 'BACHELOR_S3',
  'BACHELOR_S4', 'BACHELOR_S5', 'BACHELOR_S6',
  'MASTER_M1', 'MASTER_M2',
  'DOCTORATE_Y1', 'DOCTORATE_Y2', 'DOCTORATE_Y3', 'DOCTORATE_Y4',
];

const labelForProgram = (p: string) => {
  const map: Record<string, string> = {
    BACHELOR_S1: 'Bachelor S1', BACHELOR_S2: 'Bachelor S2', BACHELOR_S3: 'Bachelor S3',
    BACHELOR_S4: 'Bachelor S4', BACHELOR_S5: 'Bachelor S5', BACHELOR_S6: 'Bachelor S6',
    MASTER_M1: 'Master M1', MASTER_M2: 'Master M2',
    DOCTORATE_Y1: 'Doctorate Y1', DOCTORATE_Y2: 'Doctorate Y2',
    DOCTORATE_Y3: 'Doctorate Y3', DOCTORATE_Y4: 'Doctorate Y4',
  };
  return map[p] || p;
};

const GuestRegistrationModal = ({ open, onClose, onSuccess, eventId, eventTitle }: GuestModalProps) => {
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studyLevel: '',
    studyProgram: '',
    github: '',
    linkedin: '',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.displayName.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await eventService.registerAsGuest(eventId, {
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone || undefined,
        studyLevel: form.studyLevel || undefined,
        studyProgram: form.studyProgram || undefined,
        github: form.github || undefined,
        linkedin: form.linkedin || undefined,
      });

      if (response.success) {
        // Hydrate auth context with the new user's tokens
        loginWithTokens(response.data.user, response.data.accessToken, response.data.refreshToken);

        toast.success('🎉 Welcome! Account created & registration submitted!', {
          description: 'Your registration is pending staff approval. Check your dashboard for updates.',
          duration: 6000,
        });

        onSuccess(response.data.registration);
        onClose();
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      const msg = error.response?.data?.error || 'Registration failed';

      if (code === 'EMAIL_EXISTS') {
        toast.error('Account already exists', {
          description: 'An account with this email already exists. Please log in.',
          action: {
            label: 'Log In',
            onClick: () => navigate('/login'),
          },
          duration: 8000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Register for This Event</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                Create your AI Dev Community account and register for{' '}
                <span className="font-semibold text-foreground">{eventTitle}</span> in one step.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guest-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guest-name"
                placeholder="e.g. Youssef Benali"
                value={form.displayName}
                onChange={set('displayName')}
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest-email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guest-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="guest-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest-confirm">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="guest-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirm(v => !v)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="guest-phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="guest-phone"
              type="tel"
              placeholder="+212 6 XX XX XX XX"
              value={form.phone}
              onChange={set('phone')}
              disabled={submitting}
            />
          </div>

          {/* Academic Info */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <p className="text-sm font-medium">Academic Information <span className="text-muted-foreground text-xs">(optional)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guest-level">Study Level</Label>
                <Select
                  value={form.studyLevel}
                  onValueChange={(val) => setForm(prev => ({ ...prev, studyLevel: val, studyProgram: '' }))}
                  disabled={submitting}
                >
                  <SelectTrigger id="guest-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_LEVELS.map(l => (
                      <SelectItem key={l} value={l}>
                        {l.charAt(0) + l.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guest-program">Study Program</Label>
                <Select
                  value={form.studyProgram}
                  onValueChange={(val) => setForm(prev => ({ ...prev, studyProgram: val }))}
                  disabled={!form.studyLevel || submitting}
                >
                  <SelectTrigger id="guest-program">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_PROGRAMS.filter(p => {
                      if (form.studyLevel === 'BACHELOR') return p.startsWith('BACHELOR');
                      if (form.studyLevel === 'MASTER') return p.startsWith('MASTER');
                      if (form.studyLevel === 'DOCTORATE') return p.startsWith('DOCTORATE');
                      return true;
                    }).map(p => (
                      <SelectItem key={p} value={p}>{labelForProgram(p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guest-github" className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" /> GitHub <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="guest-github"
                placeholder="https://github.com/username"
                value={form.github}
                onChange={set('github')}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest-linkedin" className="flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="guest-linkedin"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedin}
                onChange={set('linkedin')}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Info note */}
          <Alert className="border-primary/30 bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              By registering, you agree to create an AI Dev Community account. You can log in later using your email and password.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1 gradient-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account & registering…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account & Register
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => { onClose(); navigate('/login'); }}
            >
              Log in
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main EventDetail Component ──────────────────────────────────────────────

const EventDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [badgeToken, setBadgeToken] = useState('');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id!);
      const foundEvent = response.data;
      
      if (foundEvent) {
        const mappedEvent = {
          ...foundEvent,
          image: foundEvent.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          registrations: foundEvent._count?.registrations || 0,
        };
        setEvent(mappedEvent);
        
        if (isAuthenticated && user) {
          const registrationsRes = await eventService.getMyRegistrations();
          const registered = registrationsRes.data.some((r: any) => r.eventId === id);
          setIsRegistered(registered);
          if (registered) {
            const registration = registrationsRes.data.find((r: any) => r.eventId === id);
            setBadgeToken(registration?.id || '');
            setRegistrationStatus(registration?.status || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  const displayTitle = language === 'fr' ? event.titleFr : language === 'ar' ? event.titleAr : event.title;
  const displayDescription = language === 'fr' ? event.descriptionFr : language === 'ar' ? event.descriptionAr : event.description;

  const handleRegister = async () => {
    // Not logged in — check if event allows guest registration
    if (!isAuthenticated) {
      if (event.allowGuestRegistration) {
        // Open the guest modal instead of redirecting
        setShowGuestModal(true);
        return;
      }
      toast.error('Please create an account or login to register for events', {
        description: 'You need to be logged in to register for events',
        duration: 5000,
      });
      setTimeout(() => navigate('/register'), 1000);
      return;
    }

    // Eligibility check (for logged-in users)
    if (event.requiresApproval) {
      const eligibleLevels = event.eligibleLevels || [];
      const eligiblePrograms = event.eligiblePrograms || [];
      
      if (eligibleLevels.length > 0 || eligiblePrograms.length > 0) {
        const userLevel = user?.studyLevel;
        const userProgram = user?.studyProgram;
        
        let isEligible = true;
        
        if (eligibleLevels.length > 0) {
          if (!userLevel || !eligibleLevels.includes(userLevel)) {
            isEligible = false;
          }
        }
        
        if (eligiblePrograms.length > 0) {
          if (!userProgram) {
            isEligible = false;
          } else {
            const userProgramMatches = eligiblePrograms.some((eligibleProg: string) => {
              return userProgram === eligibleProg || 
                     userProgram.endsWith('_' + eligibleProg) ||
                     userProgram.includes(eligibleProg);
            });
            if (!userProgramMatches) isEligible = false;
          }
        }
        
        if (!isEligible) {
          toast.error('You are not eligible for this event', {
            description: 'Please check the eligibility requirements below',
          });
          return;
        }
      }
    }

    try {
      const response = await eventService.registerForEvent(event.id);
      
      if (response.success) {
        setIsRegistered(true);
        setRegistrationStatus(response.data.status || 'PENDING');
        setBadgeToken(response.data.id);
        toast.success('Registration submitted!', {
          description: 'Your request is pending approval by staff.',
        });
        fetchEvent();
      }
    } catch (error: any) {
      console.error('Error registering for event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to register for event';
      toast.error(errorMessage);
    }
  };

  /** Called when the guest modal succeeds */
  const handleGuestRegistrationSuccess = (registration: any) => {
    setIsRegistered(true);
    setRegistrationStatus(registration?.status || 'PENDING');
    setBadgeToken(registration?.id || '');
    fetchEvent();
  };

  const generateBadge = () => {
    if (!user?.displayName && !user?.email) {
      toast.error('User information not available');
      return;
    }

    if (!badgeToken) {
      toast.error('Registration token not available');
      return;
    }

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = 210;
        const pageHeight = 297;
        
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        doc.setFillColor(20, 184, 166);
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Dev Community', 105, 25, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Event Registration Badge', 105, 38, { align: 'center' });
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const eventTitle = displayTitle || event.title;
        const splitTitle = doc.splitTextToSize(eventTitle, 150);
        doc.text(splitTitle, 105, 75, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text('Attendee:', 30, 95);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 184, 166);
        const attendeeName = user.displayName || user.email || 'Guest';
        doc.text(attendeeName, 30, 105);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text('Date:', 30, 120);
        doc.setTextColor(30, 41, 59);
        doc.text(format(new Date(event.startAt), 'PPP p'), 30, 130);
        
        doc.setTextColor(71, 85, 105);
        doc.text('Location:', 30, 145);
        doc.setTextColor(30, 41, 59);
        const splitLocation = doc.splitTextToSize(event.locationText || event.location || 'TBA', 150);
        doc.text(splitLocation, 30, 155);
        
        const contentHeight = 155 + (splitLocation.length * 5);
        doc.setDrawColor(20, 184, 166);
        doc.setLineWidth(0.5);
        doc.roundedRect(20, 60, 170, contentHeight - 50, 3, 3, 'S');
        
        const qrElement = document.querySelector('.registration-qr svg');
        if (qrElement instanceof SVGElement) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              const svgData = new XMLSerializer().serializeToString(qrElement);
              const img = new Image();
              const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);
              
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
                const qrDataUrl = canvas.toDataURL('image/png');
                doc.addImage(qrDataUrl, 'PNG', 75, contentHeight + 18, 60, 60);
                URL.revokeObjectURL(url);
                finalizePDF(doc, badgeToken, event.id, contentHeight);
              };
              
              img.src = url;
              return;
            }
          } catch (error) {
            console.error('Error adding QR code to PDF:', error);
          }
        }
        
        finalizePDF(doc, badgeToken, event.id, contentHeight);
      } catch (error) {
        console.error('Error generating badge:', error);
        toast.error('Failed to generate badge');
      }
    }, 100);
  };

  const finalizePDF = (doc: jsPDF, token: string, eventId: string, contentHeight: number) => {
    const pageWidth = 210;
    const pageHeight = 297;
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.text('Scan for verification', 105, contentHeight + 88, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Token: ${token}`, 105, contentHeight + 94, { align: 'center' });
    
    const footerY = pageHeight - 25;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, footerY, pageWidth, 25, 'F');
    
    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.3);
    doc.line(0, footerY, pageWidth, footerY);
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Us:', 105, footerY + 6, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Email: contactaidevcommunity@gmail.com', 105, footerY + 11, { align: 'center' });
    doc.text('Phone: +212 687830201', 105, footerY + 16, { align: 'center' });
    doc.text("Location: Faculty of Science Ben M'sik, Casablanca, Morocco", 105, footerY + 21, { align: 'center' });
    
    doc.save(`badge-${eventId}.pdf`);
    toast.success('Badge downloaded successfully!');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="overflow-hidden shadow-card">
            <div className="relative h-96">
              <img
                src={event.image}
                alt={displayTitle || event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="inline-block px-4 py-2 bg-primary rounded-full text-sm font-bold mb-4">
                  {event.category}
                </span>
                <h1 className="text-4xl font-bold mb-2">{displayTitle || event.title}</h1>
                <p className="text-lg">{displayDescription || event.description}</p>
              </div>
            </div>

            <div className="p-8">
              {/* Alert for non-authenticated + no guest registration */}
              {!isAuthenticated && !event.allowGuestRegistration && (
                <Alert className="mb-6 border-primary/50 bg-primary/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Please create an account to register for this event.</strong>
                    <br />
                    You need to be logged in to register and get access to event tickets.
                  </AlertDescription>
                </Alert>
              )}

              {/* Badge for guest-registration-allowed events shown to non-auth visitors */}
              {!isAuthenticated && event.allowGuestRegistration && (
                <Alert className="mb-6 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800 dark:text-emerald-300">
                    <strong>No account needed!</strong> You can register as a visitor — we'll create your AI Dev Community account automatically.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.date}</p>
                      <p className="font-medium">{format(new Date(event.startAt), 'PPP p')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.location}</p>
                      <p className="font-medium">{event.locationText || event.location || 'TBA'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.capacity}</p>
                      <p className="font-medium">
                        {event.registrations} / {event.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.speaker}</p>
                      <p className="font-medium">{event.speaker}</p>
                    </div>
                  </div>
                </div>
              </div>

              {event.requiresApproval && (event.eligibleLevels?.length > 0 || event.eligiblePrograms?.length > 0) && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Eligibility Requirements:</strong>
                    <div className="mt-2 space-y-1">
                      {event.eligibleLevels?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Study Levels: </span>
                          <span className="text-sm">{event.eligibleLevels.join(', ')}</span>
                        </div>
                      )}
                      {event.eligiblePrograms?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Study Programs: </span>
                          <span className="text-sm">{event.eligiblePrograms.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isRegistered ? (
                <div className="space-y-4">
                  {registrationStatus === 'PENDING' ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center space-y-2">
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">⏳ Registration Pending</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Your registration is awaiting approval from our staff. You will be notified once it is reviewed.
                      </p>
                      <p className="text-xs text-yellow-500">Badge download will be available after approval.</p>
                    </div>
                  ) : (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
                      <p className="text-lg font-medium mb-4">✓ You're registered for this event!</p>
                      <div className="flex justify-center mb-4 registration-qr">
                        <QRCodeSVG value={badgeToken} size={200} />
                      </div>
                      <Button onClick={generateBadge} className="gradient-primary">
                        {t.events.getTicket}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleRegister}
                  className="w-full gradient-primary"
                  size="lg"
                  disabled={event.registrations >= event.capacity}
                >
                  {event.registrations >= event.capacity
                    ? 'Event Full'
                    : !isAuthenticated && event.allowGuestRegistration
                    ? '🎟️ Register as Visitor'
                    : t.events.register}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSuccess={handleGuestRegistrationSuccess}
        eventId={event.id}
        eventTitle={displayTitle || event.title}
      />
    </div>
  );
};

export default EventDetail;