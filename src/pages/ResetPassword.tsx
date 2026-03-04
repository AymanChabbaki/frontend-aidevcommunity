import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';

type Strength = 'weak' | 'medium' | 'strong';

const getStrength = (password: string): Strength => {
  if (password.length < 8) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3 && password.length >= 10) return 'strong';
  if (score >= 2 && password.length >= 8) return 'medium';
  return 'weak';
};

const strengthConfig: Record<Strength, { label: string; color: string; bars: number }> = {
  weak:   { label: 'Weak',   color: 'bg-red-500',    bars: 1 },
  medium: { label: 'Medium', color: 'bg-yellow-500', bars: 2 },
  strong: { label: 'Strong', color: 'bg-green-500',  bars: 3 },
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [tokenState, setTokenState] = useState<'validating' | 'valid' | 'invalid'>('validating');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTokenState('invalid');
      return;
    }
    setToken(tokenParam);

    authService.validateResetToken(tokenParam)
      .then(() => setTokenState('valid'))
      .catch(() => setTokenState('invalid'));
  }, [searchParams]);

  const strength = newPassword ? getStrength(newPassword) : null;
  const { label: strengthLabel, color: strengthColor, bars: strengthBars } = strength
    ? strengthConfig[strength]
    : { label: '', color: '', bars: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      const msg = error.response?.data?.error || '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setTokenState('invalid');
      } else {
        toast.error(msg || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (tokenState === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="p-10 shadow-lg text-center w-full max-w-md">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating your reset link…</p>
        </Card>
      </div>
    );
  }

  // ── Expired / invalid state ────────────────────────────────────────
  if (tokenState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Link Expired or Invalid</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              This password reset link is no longer valid. Links expire after 1 hour or after being used once.
            </p>
            <Button asChild className="w-full mb-3">
              <Link to="/forgot-password">Request a New Link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Your password has been updated successfully. Redirecting to login…
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Reset form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
            <p className="text-muted-foreground text-sm">
              Choose a strong password you haven't used before.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── New Password ── */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          bar <= strengthBars ? strengthColor : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength === 'weak' ? 'text-red-500' :
                    strength === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {strengthLabel} password
                    {strength === 'weak' && ' — add uppercase, numbers, or symbols'}
                  </p>
                </div>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <p className="text-xs text-green-600">Passwords match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting…
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
