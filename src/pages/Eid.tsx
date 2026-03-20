import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Sparkles, Upload, X, Download, Copy, RefreshCw,
  ImageIcon, MessageSquareQuote, Rocket, Bot, Star, Heart,
  Loader2, Camera, Share2, CheckCheck, Moon, Instagram, Linkedin, Share
} from 'lucide-react';
import { generateEidAll, uploadEidPhoto, fileToBase64 } from '@/services/gemini.service';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  interests: string;
  dream: string;
}

interface ResultState {
  imageDataUrl: string;
  compliment: string;
}

// ─── Floating decoration orbs (icon-based, no emojis) ────────────────────────

const ORBS = [
  { icon: Sparkles, top: '10%', left: '5%',  delay: 0,   color: 'text-amber-400' },
  { icon: Star,     top: '20%', right: '8%', delay: 0.4, color: 'text-yellow-300' },
  { icon: Moon,     top: '50%', left: '3%',  delay: 0.8, color: 'text-emerald-400' },
  { icon: Rocket,   top: '70%', right: '5%', delay: 1.2, color: 'text-green-300' },
  { icon: Bot,      top: '35%', right: '3%', delay: 1.0, color: 'text-emerald-300' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const EidCelebration = () => {
  const [form, setForm] = useState<FormState>({ name: '', interests: '', dream: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Form helpers ────────────────────────────────────────────────────────────

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Foto khasso tkoun aqal mn 5 MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Generation ──────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!form.name.trim() || !form.interests.trim() || !form.dream.trim()) {
      toast.error('3mer les 3 cases qbel ma tbda.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let photoBase64: string | null = null;
      let photoMimeType: string | null = null;

      if (photoFile) {
        // Convert to base64 for Gemini face reference
        setLoadingStep('Reading your photo…');
        const b64result = await fileToBase64(photoFile).catch(() => null);
        if (b64result) {
          photoBase64 = b64result.base64;
          photoMimeType = b64result.mimeType;
        }
        // Upload to Cloudinary via backend (best-effort, non-blocking)
        setLoadingStep('Uploading your photo…');
        uploadEidPhoto(photoFile).catch(() => {});
      }

      // Generate image + compliment in parallel via backend
      setLoadingStep('AI is imagining your future Eid…');
      const generated = await generateEidAll({
        name: form.name.trim(),
        interests: form.interests.trim(),
        dream: form.dream.trim(),
        photoBase64,
        photoMimeType,
      });

      setResult(generated);

      // Scroll smoothly to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }, [form, photoFile]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.imageDataUrl;
    a.download = `${form.name.replace(/\s+/g, '_')}_Eid2030.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.compliment);
      setCopied(true);
      toast.success('Compliment copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy text. Please copy it manually.');
    }
  };

  const handleShareNative = async () => {
    if (!result) return;
    try {
      const response = await fetch(result.imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'eid_2030.png', { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Eid in 2030',
          text: result.compliment + '\n\n#EidMubarak #AiDevCommunity',
          files: [file],
        });
      } else {
        toast.error('Native sharing not supported on this browser. Try downloading.');
      }
    } catch (err) {
      toast.error('Could not share. Please download instead.');
    }
  };

  const handleLinkedInShare = () => {
    if (!result) return;
    // We need a public URL to share on LinkedIn; if imageDataUrl is Cloudinary URL, it works.
    // If it's base64, LinkedIn won't accept it, so we fallback to the app URL
    const publicUrl = result.imageDataUrl.startsWith('http') ? result.imageDataUrl : window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 text-white relative overflow-x-hidden">

      {/* Ambient background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-teal-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-amber-600/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icon orbs */}
      {ORBS.map((p, i) => {
        const Icon = p.icon;
        return (
          <motion.div
            key={i}
            className={`pointer-events-none absolute select-none opacity-20 ${p.color}`}
            style={{ top: p.top, left: (p as { left?: string }).left, right: (p as { right?: string }).right }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            aria-hidden
          >
            <Icon className="h-8 w-8" />
          </motion.div>
        );
      })}

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">

        {/* ── Hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Moon className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span>Traditional Moroccan Eid Celebration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              Your Eid in 2030
            </span>{' '}
            <Sparkles className="inline h-8 w-8 text-yellow-300 mb-1" />
          </h1>

          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
            Enter your name, interests and your dream in tech.{' '}
            <span className="text-white/90 font-semibold">Our AI will imagine your Eid in the future</span>{' '}
            and generate a special Moroccan compliment just for you.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
            {[
              { icon: Bot,     label: 'AI Caricature'    },
              { icon: MessageSquareQuote, label: 'Darija Eid Greeting' },
              { icon: Rocket,  label: 'Your 2030 Vision' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <Icon className="h-3.5 w-3.5 text-emerald-300" />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur border border-white/20 text-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-300" />
                  Your Name
                </Label>
                <Input
                  placeholder="Smiytek (p.ex. Youssef, Fatima...)"
                  value={form.name}
                  onChange={set('name')}
                  disabled={loading}
                  className="bg-white/10 border-white/25 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/30"
                />
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  Your Interests
                </Label>
                <Input
                  placeholder="coding, AI, design, robotics..."
                  value={form.interests}
                  onChange={set('interests')}
                  disabled={loading}
                  className="bg-white/10 border-white/25 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/30"
                />
              </div>

              {/* Dream role */}
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold flex items-center gap-1.5">
                  <Rocket className="h-4 w-4 text-amber-300" />
                  Dream Role in Tech
                </Label>
                <Input
                  placeholder="p.ex. ingénieur AI, fondateur startup, dev jeux..."
                  value={form.dream}
                  onChange={set('dream')}
                  disabled={loading}
                  className="bg-white/10 border-white/25 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/30"
                />
              </div>

              {/* Photo upload */}
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-teal-300" />
                  Upload your photo{' '}
                  <span className="font-normal text-white/50 ml-1">(optional)</span>
                </Label>

                {photoPreview ? (
                  <div className="relative inline-flex">
                    <img
                      src={photoPreview}
                      alt="Your uploaded photo"
                      className="h-24 w-24 rounded-xl object-cover border-2 border-emerald-400/60"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={loading}
                      className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-0.5 hover:bg-rose-600 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="flex items-center gap-3 w-full border-2 border-dashed border-white/25 hover:border-emerald-400/60 rounded-xl p-4 transition-colors text-white/60 hover:text-white/90 group"
                  >
                    <Upload className="h-5 w-5 group-hover:text-emerald-300 transition-colors" />
                    <span className="text-sm">Klik bach t9olloadi tswira dyalek (max 5 MB)</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                  tabIndex={-1}
                />
                <p className="text-xs text-white/40">
                  Tswirtek katkhdem ghir bash AI ikhayyel wajhek. Maqboulin: JPG, PNG, WebP.
                </p>
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base rounded-xl py-6 shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {loadingStep || 'AI katkhayyal Eidk...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Kifash ghatkoun f Eid 2030
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* ── Loading shimmer ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-10 text-center"
            >
              <div className="inline-flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-emerald-600/30 border-t-emerald-400 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-emerald-300 animate-pulse" />
                </div>
                <p className="text-white/70 text-lg font-medium animate-pulse">
                  {loadingStep || 'AI katkhayyal Eidk...'}
                </p>
                <p className="text-white/40 text-sm">Hada kayskhod 15–30 thinya</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.25 }}
              className="mt-12 space-y-6"
            >
              {/* Section heading */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.15 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 text-sm font-medium mb-3"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  Version dyalek f Eid 2030 wajda!
                </motion.div>
                <h2 className="text-2xl font-bold">
                  Bshetk,{' '}
                  <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
                    {form.name}
                  </span>{' '}
                  <Sparkles className="inline h-6 w-6 text-yellow-300" />
                </h2>
              </div>

              {/* Generated image */}
              <Card className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-1">
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-900/50 to-teal-900/50">
                    <img
                      src={result.imageDataUrl}
                      alt={`AI caricature of ${form.name} in Eid 2030`}
                      className="w-full object-contain max-h-[520px]"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur rounded-lg px-2 py-1 text-xs text-white/70 flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      AI-generated
                    </div>
                  </div>
                </div>
              </Card>

              {/* Compliment card */}
              <Card className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 backdrop-blur border border-emerald-400/30 rounded-2xl shadow-xl">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquareQuote className="h-5 w-5 text-emerald-300" />
                    <span className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">
                      Eid Greeting b Darija
                    </span>
                  </div>
                  <blockquote
                    className="text-xl leading-relaxed text-white font-medium text-right arabic-text"
                    dir="rtl"
                    lang="ar-MA"
                  >
                    {result.compliment}
                  </blockquote>
                  <div className="mt-4 flex items-center gap-1 text-xs text-white/40">
                    <Moon className="h-3 w-3 fill-amber-400 text-amber-400" />
                    Sna3 b l7ob f occasion d Eid
                  </div>
                </div>
              </Card>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <Button
                  onClick={handleDownload}
                  className="bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl gap-2 backdrop-blur"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </Button>

                <Button
                  onClick={handleCopy}
                  className="bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl gap-2 backdrop-blur"
                  variant="outline"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="h-4 w-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Message
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleShareNative}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl gap-2 border-0"
                >
                  <Instagram className="h-4 w-4" />
                  IG Story / Share
                </Button>

                <Button
                  onClick={handleLinkedInShare}
                  className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl gap-2 border-0"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Post
                </Button>

                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl gap-2 border-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate Again
                </Button>
              </div>

              {/* Share nudge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-white/40 text-sm flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Partaji version dyalek f réseaux sociaux b{' '}
                  <span className="text-emerald-300 font-medium">#EidMubarak #AiDevCommunity</span>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};

export default EidCelebration;
