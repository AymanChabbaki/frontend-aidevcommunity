import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar, MapPin, Users, Mic2, AlertCircle, CheckCircle2,
  ArrowLeft, UserPlus, Eye, EyeOff, Github, Linkedin, Loader2,
  Clock, Tag, Download, QrCode, ShieldCheck, Info, PartyPopper,
  Ticket, Lock
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
  customFields?: Array<{
    id: string; label: string; type: string;
    required: boolean; options: string[];
  }>;
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

const GuestRegistrationModal = ({ open, onClose, onSuccess, eventId, eventTitle, customFields = [] }: GuestModalProps) => {
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    displayName: '', email: '', password: '', confirmPassword: '',
    phone: '', studyLevel: '', studyProgram: '', github: '', linkedin: '',
  });
  // Custom field values keyed by field id
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all required fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSubmitting(true);
    try {
      // Validate required custom fields
      for (const f of customFields) {
        if (f.required && !customValues[f.id]?.trim()) {
          toast.error(`Please fill in: ${f.label}`); setSubmitting(false); return;
        }
      }
      const response = await eventService.registerAsGuest(eventId, {
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone || undefined,
        studyLevel: form.studyLevel || undefined,
        studyProgram: form.studyProgram || undefined,
        github: form.github || undefined,
        linkedin: form.linkedin || undefined,
        customFieldValues: Object.keys(customValues).length > 0 ? customValues : undefined,
      });
      if (response.success) {
        loginWithTokens(response.data.user, response.data.accessToken, response.data.refreshToken);
        toast.success('Welcome! Account created & registration submitted!', {
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
          action: { label: 'Log In', onClick: () => navigate('/login') },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guest-name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="guest-name" placeholder="e.g. Youssef Benali" value={form.displayName} onChange={set('displayName')} required disabled={submitting} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest-email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="guest-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required disabled={submitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guest-password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input id="guest-password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required disabled={submitting} className="pr-10" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest-confirm">Confirm Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input id="guest-confirm" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} required disabled={submitting} className="pr-10" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guest-phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="guest-phone" type="tel" placeholder="+212 6 XX XX XX XX" value={form.phone} onChange={set('phone')} disabled={submitting} />
          </div>

          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <p className="text-sm font-medium">Academic Information <span className="text-muted-foreground text-xs">(optional)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guest-level">Study Level</Label>
                <Select value={form.studyLevel} onValueChange={(val) => setForm(prev => ({ ...prev, studyLevel: val, studyProgram: '' }))} disabled={submitting}>
                  <SelectTrigger id="guest-level"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {STUDY_LEVELS.map(l => <SelectItem key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guest-program">Study Program</Label>
                <Select value={form.studyProgram} onValueChange={(val) => setForm(prev => ({ ...prev, studyProgram: val }))} disabled={!form.studyLevel || submitting}>
                  <SelectTrigger id="guest-program"><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {STUDY_PROGRAMS.filter(p => {
                      if (form.studyLevel === 'BACHELOR') return p.startsWith('BACHELOR');
                      if (form.studyLevel === 'MASTER') return p.startsWith('MASTER');
                      if (form.studyLevel === 'DOCTORATE') return p.startsWith('DOCTORATE');
                      return true;
                    }).map(p => <SelectItem key={p} value={p}>{labelForProgram(p)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guest-github" className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" /> GitHub <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input id="guest-github" placeholder="https://github.com/username" value={form.github} onChange={set('github')} disabled={submitting} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest-linkedin" className="flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input id="guest-linkedin" placeholder="https://linkedin.com/in/username" value={form.linkedin} onChange={set('linkedin')} disabled={submitting} />
            </div>
          </div>

          {/* Dynamic custom fields from event config */}
          {customFields.length > 0 && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <p className="text-sm font-medium">Additional Information</p>
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={`cf-${field.id}`}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {field.type === 'select' ? (
                      <Select
                        value={customValues[field.id] || ''}
                        onValueChange={(v) => setCustomValues(prev => ({ ...prev, [field.id]: v }))}
                        disabled={submitting}
                      >
                        <SelectTrigger id={`cf-${field.id}`}><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={`cf-${field.id}`}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={`Enter ${field.label.toLowerCase()}…`}
                        value={customValues[field.id] || ''}
                        onChange={(e) => setCustomValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                        disabled={submitting}
                      />
                    ) : (
                      <Input
                        id={`cf-${field.id}`}
                        type={field.type}
                        placeholder={`Enter ${field.label.toLowerCase()}…`}
                        value={customValues[field.id] || ''}
                        onChange={(e) => setCustomValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                        disabled={submitting}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert className="border-primary/30 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              By registering, you agree to create an AI Dev Community account. You can log in later using your email and password.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1 gradient-primary" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account & registering…</> : <><UserPlus className="h-4 w-4 mr-2" />Create Account & Register</>}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button type="button" className="text-primary hover:underline font-medium" onClick={() => { onClose(); navigate('/login'); }}>Log in</button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Info Chip ────────────────────────────────────────────────────────────────
const InfoChip = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-semibold text-sm leading-snug">{value}</p>
    </div>
  </div>
);

// ─── Capacity Bar ─────────────────────────────────────────────────────────────
const CapacityBar = ({ current, max }: { current: number; max: number }) => {
  const pct = Math.min(100, Math.round((current / max) * 100));
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-primary';
  return (
    <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Capacity</p>
            <p className="font-semibold text-sm">{current} / {max} registered</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${pct >= 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : pct >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </div>
  );
};

// ─── Main EventDetail Component ───────────────────────────────────────────────
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
  const [registering, setRegistering] = useState(false);
  // custom field values for logged-in users
  const [authCustomValues, setAuthCustomValues] = useState<Record<string, string>>({});

  useEffect(() => { fetchEvent(); }, [id, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id!);
      const foundEvent = response.data;
      if (foundEvent) {
        setEvent({
          ...foundEvent,
          image: foundEvent.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
          registrations: foundEvent._count?.registrations || 0,
        });
        if (isAuthenticated && user) {
          const registrationsRes = await eventService.getMyRegistrations();
          const reg = registrationsRes.data.find((r: any) => r.eventId === id);
          if (reg) {
            setIsRegistered(true);
            setBadgeToken(reg.id || '');
            setRegistrationStatus(reg.status || '');
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading event…</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-10 shadow-lg">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')} className="gradient-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Events
          </Button>
        </motion.div>
      </div>
    );
  }

  const displayTitle = language === 'fr' ? event.titleFr : language === 'ar' ? event.titleAr : event.title;
  const displayDescription = language === 'fr' ? event.descriptionFr : language === 'ar' ? event.descriptionAr : event.description;
  const spotsLeft = event.capacity - event.registrations;
  const isFull = spotsLeft <= 0;

  // ── Register handler ──
  const handleRegister = async () => {
    if (!isAuthenticated) {
      if (event.allowGuestRegistration) { setShowGuestModal(true); return; }
      toast.error('Please create an account or log in to register', { description: 'You need to be logged in to attend events', duration: 5000 });
      setTimeout(() => navigate('/register'), 1000);
      return;
    }
    if (event.requiresApproval) {
      const el = event.eligibleLevels || [];
      const ep = event.eligiblePrograms || [];
      if (el.length > 0 || ep.length > 0) {
        let ok = true;
        if (el.length > 0 && (!user?.studyLevel || !el.includes(user.studyLevel))) ok = false;
        if (ep.length > 0) {
          if (!user?.studyProgram) ok = false;
          else {
            const match = ep.some((p: string) => user.studyProgram === p || user.studyProgram?.endsWith('_' + p) || user.studyProgram?.includes(p));
            if (!match) ok = false;
          }
        }
        if (!ok) { toast.error('You are not eligible for this event', { description: 'Check the eligibility requirements below' }); return; }
      }
    }
    // Validate required custom fields for authenticated users
    const eventCustomFields: Array<{ id: string; label: string; required: boolean }> = event.customFields || [];
    for (const f of eventCustomFields) {
      if (f.required && !authCustomValues[f.id]?.trim()) {
        toast.error(`Please fill in: ${f.label}`); return;
      }
    }
    try {
      setRegistering(true);
      const cfv = Object.keys(authCustomValues).length > 0 ? authCustomValues : undefined;
      const response = await eventService.registerForEvent(event.id, cfv);
      if (response.success) {
        setIsRegistered(true);
        setRegistrationStatus(response.data.status || 'PENDING');
        setBadgeToken(response.data.id);
        toast.success('Registration submitted!', { description: 'Your request is pending approval by staff.' });
        fetchEvent();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleGuestRegistrationSuccess = (registration: any) => {
    setIsRegistered(true);
    setRegistrationStatus(registration?.status || 'PENDING');
    setBadgeToken(registration?.id || '');
    fetchEvent();
  };

  // ── Badge PDF ──
  const generateBadge = () => {
    if (!badgeToken) { toast.error('Registration token not available'); return; }

    // ── PATH A: Custom badge.png template (Precision Coordinate Design) ─
    if (event.useCustomBadge) {
      const imgLoad = new Image();
      imgLoad.crossOrigin = 'anonymous';
      imgLoad.onload = () => {
        try {
          // 1. Target high-resolution canvas (A4 @ 170 DPI = 1414 × 2000 px)
          const BW = imgLoad.naturalWidth  || 1414;
          const BH = imgLoad.naturalHeight || 2000;
          const canvas = document.createElement('canvas');
          canvas.width = BW; canvas.height = BH;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(imgLoad, 0, 0, BW, BH);

          // 2. mm-to-pixel scaling helper (A4 width = 210mm)
          const mm = (v: number) => Math.round(v * BW / 210);

          // 3. Helper: Position elements based on BOX (X, Y, W, H) in mm
          // Titles/Text will be centered within their respective boxes
          
          // ── A. Event Title ──
          // cm: 0.7x, 5.13y, 14.37w, 2.8h  =>  mm: 7x, 51.3y, 143.7w, 28h
          // Font: 31 pt (approx 10.93 mm)
          const eventTitle = (displayTitle || event.title || '').toUpperCase();
          const titleBox = { x: mm(7), y: mm(51.3), w: mm(143.7), h: mm(28) };
          ctx.save();
          ctx.textAlign = 'center'; 
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = mm(2);
          
          // 31 pt = (31/72) * 25.4 mm ≈ 10.936 mm
          const titleSizePt = 31;
          const titleSizeMm = (titleSizePt / 72) * 25.4;
          ctx.font = `600 ${mm(titleSizeMm)}px "Inter", "Helvetica Neue", sans-serif`;
          
          ctx.fillText(eventTitle, titleBox.x + titleBox.w / 2, titleBox.y + titleBox.h / 2);
          ctx.restore();

          // ── B. Attendee Name ──
          // cm: 7.52x, 11.58y, 9.45w, 1.22h  =>  mm: 75.2x, 115.8y, 94.5w, 12.2h
          const nameText = (user?.displayName || user?.email || 'Guest').toUpperCase();
          const nameBox = { x: mm(75.2), y: mm(115.8), w: mm(94.5), h: mm(12.2) };
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = mm(2.5); ctx.shadowOffsetY = mm(0.5);
          // @ts-ignore
          if ('letterSpacing' in ctx) ctx.letterSpacing = 'mm(1)px';
          ctx.font = `900 ${mm(15)}px "Inter", "Helvetica Neue", sans-serif`;
          
          // Scale Name to fit box height/width
          let nameSize = 15;
          while ((ctx.measureText(nameText).width > nameBox.w * 0.95 || mm(nameSize) > nameBox.h * 1.5) && nameSize > 6) {
            nameSize -= 0.5;
            ctx.font = `900 ${mm(nameSize)}px "Inter", "Helvetica Neue", sans-serif`;
          }
          ctx.fillText(nameText, nameBox.x + nameBox.w / 2, nameBox.y + nameBox.h / 2);
          ctx.restore();

          // ── C. Date Time ──
          // cm: 1.83x, 25.16y, 6.53w, 0.57h  =>  mm: 18.3x, 251.6y, 65.3w, 5.7h
          const dateStr = format(new Date(event.startAt), "MMM dd, yyyy • HH:mm").toUpperCase();
          const dateBox = { x: mm(18.3), y: mm(251.6), w: mm(65.3), h: mm(5.7) };
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.font = `500 ${mm(5.5)}px "Inter", sans-serif`;
          
          let dateSize = 5.5;
          while (ctx.measureText(dateStr).width > dateBox.w && dateSize > 3) {
            dateSize -= 0.2;
            ctx.font = `500 ${mm(dateSize)}px "Inter", sans-serif`;
          }
          ctx.fillText(dateStr, dateBox.x + dateBox.w / 2, dateBox.y + dateBox.h / 2);
          ctx.restore();

          // ── D. QR Code ──
          // cm: 0.89x, 15.44y, 8.4w, 8.4h  =>  mm: 8.9x, 154.4y, 84w, 84h
          const QR_SIZE = mm(84);
          const QX = mm(8.9);
          const QY = mm(154.4);

          const savePDF = () => {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            doc.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, 210, 297);
            doc.save(`badge-${event.id}.pdf`);
            toast.success('Precision-designed badge downloaded!');
          };

          const finalizeWithQR = (qrDataUrl?: string) => {
            if (qrDataUrl) {
              const qImg = new Image();
              qImg.onload = () => {
                // Professional Touch: Soft white backing for the QR to ensure readability
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = mm(3);
                ctx.fillStyle = '#FFFFFF';
                // Slight padding for the white board
                const pad = mm(2);
                ctx.beginPath();
                ctx.roundRect(QX - pad, QY - pad, QR_SIZE + pad * 2, QR_SIZE + pad * 2, mm(3));
                ctx.fill();
                ctx.restore();
                
                ctx.drawImage(qImg, QX, QY, QR_SIZE, QR_SIZE);
                savePDF();
              };
              qImg.src = qrDataUrl;
            } else {
              savePDF();
            }
          };

          // QR SVG Capture
          const qrSvg = document.querySelector('.registration-qr svg');
          if (qrSvg instanceof SVGElement) {
            const qCanvas = document.createElement('canvas');
            qCanvas.width = 600; qCanvas.height = 600; // High res QR
            const qCtx = qCanvas.getContext('2d');
            if (qCtx) {
              const svgData = new XMLSerializer().serializeToString(qrSvg);
              const blob    = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const url     = URL.createObjectURL(blob);
              const qrLoader = new Image();
              qrLoader.onload = () => { 
                qCtx.drawImage(qrLoader, 0, 0, 600, 600); 
                URL.revokeObjectURL(url); 
                finalizeWithQR(qCanvas.toDataURL('image/png')); 
              };
              qrLoader.src = url;
              return;
            }
          }
          finalizeWithQR();
        } catch (e) {
          console.error(e);
          toast.error('Coordinate rendering issue.');
          generateDefaultBadge();
        }
      };
      imgLoad.onerror = () => generateDefaultBadge();
      imgLoad.src = '/badge.png';
      return;
    }

    // ── PATH B: Default generated badge ────────────────────────────────────
    generateDefaultBadge();
  };

  const generateDefaultBadge = () => {
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const W = 210, H = 297;
        doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
        doc.setFillColor(20, 184, 166); doc.rect(0, 0, W, 50, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(32); doc.setFont('helvetica', 'bold');
        doc.text('AI Dev Community', 105, 25, { align: 'center' });
        doc.setFontSize(14); doc.setFont('helvetica', 'normal');
        doc.text('Event Registration Badge', 105, 38, { align: 'center' });
        doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
        const splitTitle = doc.splitTextToSize(displayTitle || event.title, 150);
        doc.text(splitTitle, 105, 75, { align: 'center' });
        doc.setFontSize(16); doc.setTextColor(71, 85, 105); doc.setFont('helvetica', 'normal');
        doc.text('Attendee:', 30, 95);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 184, 166);
        doc.text(user?.displayName || user?.email || 'Guest', 30, 105);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
        doc.text('Date:', 30, 120); doc.setTextColor(30, 41, 59);
        doc.text(format(new Date(event.startAt), 'PPP p'), 30, 130);
        doc.setTextColor(71, 85, 105); doc.text('Location:', 30, 145); doc.setTextColor(30, 41, 59);
        const splitLoc = doc.splitTextToSize(event.locationText || 'TBA', 150);
        doc.text(splitLoc, 30, 155);
        const ch = 155 + splitLoc.length * 5;
        doc.setDrawColor(20, 184, 166); doc.setLineWidth(0.5); doc.roundedRect(20, 60, 170, ch - 50, 3, 3, 'S');
        const qrEl = document.querySelector('.registration-qr svg');
        if (qrEl instanceof SVGElement) {
          const canvas = document.createElement('canvas'); canvas.width = 200; canvas.height = 200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const svgData = new XMLSerializer().serializeToString(qrEl);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              doc.addImage(canvas.toDataURL('image/png'), 'PNG', 75, ch + 18, 60, 60);
              URL.revokeObjectURL(url);
              finalizePDF(doc, badgeToken, event.id, ch);
            };
            img.src = url; return;
          }
        }
        finalizePDF(doc, badgeToken, event.id, ch);
      } catch { toast.error('Failed to generate badge'); }
    }, 100);
  };

  const finalizePDF = (doc: jsPDF, token: string, eventId: string, ch: number) => {
    const W = 210, H = 297, fy = H - 25;
    doc.setTextColor(71, 85, 105); doc.setFontSize(10);
    doc.text('Scan for verification', 105, ch + 88, { align: 'center' });
    doc.setFontSize(8); doc.text(`Token: ${token}`, 105, ch + 94, { align: 'center' });
    doc.setFillColor(248, 250, 252); doc.rect(0, fy, W, 25, 'F');
    doc.setDrawColor(20, 184, 166); doc.setLineWidth(0.3); doc.line(0, fy, W, fy);
    doc.setTextColor(71, 85, 105); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Contact Us:', 105, fy + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Email: contactaidevcommunity@gmail.com', 105, fy + 11, { align: 'center' });
    doc.text('Phone: +212 687830201', 105, fy + 16, { align: 'center' });
    doc.text("Location: Faculty of Science Ben M'sik, Casablanca, Morocco", 105, fy + 21, { align: 'center' });
    doc.save(`badge-${eventId}.pdf`);
    toast.success('Badge downloaded successfully!');
  };

  // ── Status badge ──
  const statusColor: Record<string, string> = {
    UPCOMING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    ONGOING: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    COMPLETED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-10">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[1fr_400px] gap-8 items-start"
        >
          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div className="space-y-6">

            {/* Square image — Instagram proportions */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src={event.image}
                alt={displayTitle || event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top badges */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                <Badge className={`border font-semibold text-xs px-3 py-1 backdrop-blur-sm ${statusColor[event.status] || statusColor.UPCOMING}`}>
                  {event.status}
                </Badge>
                {event.allowGuestRegistration && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                    <UserPlus className="h-3 w-3" /> Open to visitors
                  </span>
                )}
              </div>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                    {event.category}
                  </span>
                  {(event.tags || []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                  {displayTitle || event.title}
                </h1>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> About this Event
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {displayDescription || event.description}
              </p>
            </div>

            {/* Eligibility requirements */}
            {event.requiresApproval && (event.eligibleLevels?.length > 0 || event.eligiblePrograms?.length > 0) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Eligibility Requirements</p>
                </div>
                <div className="space-y-2">
                  {event.eligibleLevels?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 pt-1">Study Levels:</span>
                      {event.eligibleLevels.map((l: string) => (
                        <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/50">{l}</span>
                      ))}
                    </div>
                  )}
                  {event.eligiblePrograms?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 pt-1">Programs:</span>
                      {event.eligiblePrograms.map((p: string) => (
                        <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/50">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-8">

            {/* Meta info chips */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Event Details</h2>
              <InfoChip icon={Calendar} label="Date" value={format(new Date(event.startAt), 'EEEE, MMMM d, yyyy')} />
              <InfoChip icon={Clock} label="Time" value={`${format(new Date(event.startAt), 'p')} → ${format(new Date(event.endAt), 'p')}`} />
              <InfoChip icon={MapPin} label="Location" value={event.locationText || 'TBA'} />
              <InfoChip icon={Mic2} label="Speaker" value={event.speaker || 'TBA'} />
              <CapacityBar current={event.registrations} max={event.capacity} />
            </div>

            {/* Visitor banner */}
            <AnimatePresence>
              {!isAuthenticated && event.allowGuestRegistration && (
                <motion.div key="visitor-banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/30">
                  <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    <strong>No account needed!</strong> You can register as a visitor and we'll create your AI Dev Community account automatically.
                  </p>
                </motion.div>
              )}
              {!isAuthenticated && !event.allowGuestRegistration && (
                <motion.div key="login-banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-primary/5 border border-primary/20">
                  <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    <strong>Account required.</strong> Please log in or create an account to register for this event.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration section */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              {isRegistered ? (
                <div className="space-y-4">
                  {registrationStatus === 'PENDING' ? (
                    <div className="text-center space-y-3">
                      <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                        <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Registration Pending</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your registration is awaiting staff approval. You'll be notified once it's reviewed.
                        </p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg px-4 py-2.5">
                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 justify-center">
                          <Ticket className="h-3.5 w-3.5" /> Badge download available after approval
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                        <PartyPopper className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">You're Registered!</p>
                        <p className="text-sm text-muted-foreground mt-1">Show this QR code at the event entrance.</p>
                      </div>
                      <div className="flex justify-center p-4 bg-white rounded-xl border border-border registration-qr">
                        <QRCodeSVG value={badgeToken} size={180} />
                      </div>
                      <Button onClick={generateBadge} className="w-full gradient-primary" size="lg">
                        <Download className="h-4 w-4 mr-2" /> Download Badge PDF
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="font-bold text-lg mb-1">Ready to Join?</p>
                    <p className="text-sm text-muted-foreground">
                      {isFull ? 'This event is fully booked.' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining`}
                    </p>
                  </div>

                  {/* Custom fields for authenticated users */}
                  {isAuthenticated && (event.customFields || []).length > 0 && (
                    <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
                      <p className="text-sm font-semibold">Additional Information</p>
                      {(event.customFields as Array<{id:string;label:string;type:string;required:boolean;options:string[]}>).map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label htmlFor={`auth-cf-${field.id}`}>
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          {field.type === 'select' ? (
                            <Select
                              value={authCustomValues[field.id] || ''}
                              onValueChange={(v) => setAuthCustomValues(prev => ({ ...prev, [field.id]: v }))}
                            >
                              <SelectTrigger id={`auth-cf-${field.id}`}><SelectValue placeholder="Select…" /></SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt: string) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`auth-cf-${field.id}`}
                              type={field.type}
                              placeholder={`Enter ${field.label.toLowerCase()}…`}
                              value={authCustomValues[field.id] || ''}
                              onChange={(e) => setAuthCustomValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleRegister}
                    className="w-full gradient-primary h-12 text-base font-semibold"
                    size="lg"
                    disabled={isFull || registering}
                  >
                    {registering ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registering…</>
                    ) : isFull ? (
                      <><Users className="h-4 w-4 mr-2" /> Event Full</>
                    ) : !isAuthenticated && event.allowGuestRegistration ? (
                      <><UserPlus className="h-4 w-4 mr-2" /> Register as Visitor</>
                    ) : (
                      <><Ticket className="h-4 w-4 mr-2" /> {t.events.register}</>
                    )}
                  </Button>
                  {!isAuthenticated && (
                    <p className="text-center text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <button className="text-primary hover:underline font-medium" onClick={() => navigate('/login')}>Log in</button>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {(event.tags || []).length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 border border-border transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSuccess={handleGuestRegistrationSuccess}
        eventId={event.id}
        eventTitle={displayTitle || event.title}
        customFields={event.customFields || []}
      />
    </div>
  );
};

export default EventDetail;