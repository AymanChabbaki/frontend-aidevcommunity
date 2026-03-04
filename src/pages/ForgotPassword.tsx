import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Send, CheckCircle2, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { authService } from '@/services/auth.service';

const RESEND_COOLDOWN = 60; // seconds

const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setResendCountdown(RESEND_COOLDOWN);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setEmailSent(true);
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || resending) return;
    setResending(true);
    try {
      await authService.forgotPassword(email.trim());
      toast.success('Reset link resent! Check your inbox.');
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg">
          <AnimatePresence mode="wait">
            {!emailSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                  <p className="text-muted-foreground">
                    No worries — we'll send you reset instructions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                  <p className="text-muted-foreground text-sm">
                    We sent a reset link to
                  </p>
                  <p className="font-semibold text-foreground mt-1">{maskEmail(email)}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2 mb-6">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    • Open the email and click <strong>Reset My Password</strong>
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    • The link expires in <strong>1 hour</strong>
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    • Check your <strong>spam / junk</strong> folder if you don't see it
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={resendCountdown > 0 || resending}
                  >
                    {resending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Resending...
                      </>
                    ) : resendCountdown > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Resend in {resendCountdown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Email
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => { setEmailSent(false); setResendCountdown(0); }}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Wrong email? Try a different one
                  </Button>
                </div>

                <div className="text-center mt-6">
                  <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
