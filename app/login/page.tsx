'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Users,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayInput } from '@/components/ui/ClayInput';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserRole } from '@/lib/data/types';
import { loginUser, resetUserPassword } from '@/lib/data/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'forgot_password'>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginUser(email, password, role);
      setIsLoading(false);
      if (user.role === 'faculty') {
        router.push('/faculty');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'student') {
        router.push('/student');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const targetEmail = forgotEmail.trim() || email.trim();
    if (!targetEmail.includes('@')) {
      setError('Please provide a valid institutional email address (e.g. 241fa18067@campus.edu.in).');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    try {
      setIsResetting(true);
      const res = await resetUserPassword(targetEmail, newPassword);
      setIsResetting(false);
      setSuccessMessage(res.message);
      // Pre-fill login credentials
      setEmail(targetEmail);
      setPassword(newPassword);
    } catch (err: any) {
      setIsResetting(false);
      setError(err?.message || 'Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[var(--clay-bg)] text-[var(--clay-text)] relative">
      {/* Background ambient clay glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF7A59]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#2EC4B6]/15 blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-heading font-extrabold text-white hover:text-[#FF7A59] transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
          <span className="text-white">Back to Landing Page</span>
        </Link>
      </div>

      {/* Main Clay Card Form */}
      <ClayCard className="w-full max-w-lg p-6 sm:p-10 relative z-10 shadow-[var(--shadow-clay-card-hover)]">
        {/* Header */}
        {mode === 'signin' ? (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#FF7A59] flex items-center justify-center text-white shadow-[var(--shadow-clay-coral)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--clay-text)]">
                Sign In to CampusPulse
              </h1>
              <span className="text-xs font-bold text-[var(--clay-muted)] block">
                Smart Campus Analytics Platform
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#2EC4B6] flex items-center justify-center text-white shadow-[var(--shadow-clay-btn)]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--clay-text)]">
                Reset Password
              </h1>
              <span className="text-xs font-bold text-[var(--clay-muted)] block">
                Choose a new password for your account
              </span>
            </div>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block mb-2">
            Institutional Role
          </label>
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)]">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-heading font-bold text-xs select-none transition-all ${
                role === 'student'
                  ? 'bg-[var(--clay-card)] text-[#5B6CFF] shadow-[var(--shadow-clay-btn)]'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-heading font-bold text-xs select-none transition-all ${
                role === 'faculty'
                  ? 'bg-[var(--clay-card)] text-[#2EC4B6] shadow-[var(--shadow-clay-btn)]'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-heading font-bold text-xs select-none transition-all ${
                role === 'admin'
                  ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-[var(--shadow-clay-btn)]'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* VIEW 1: SIGN IN */}
        {mode === 'signin' ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <ClayInput
              label="College Email Address"
              type="email"
              placeholder="Email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <ClayInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--clay-muted)] hover:text-[var(--clay-text)] transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setError(null);
                    setSuccessMessage(null);
                    if (email) setForgotEmail(email);
                  }}
                  className="text-xs font-bold text-[#FF7A59] hover:text-[#ff623b] hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <ClayButton
              type="submit"
              variant="coral"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to CampusPulse'}</span>
              <ArrowRight className="h-4 w-4" />
            </ClayButton>
          </form>
        ) : (
          /* VIEW 2: FORGOT / RESET PASSWORD */
          <div className="space-y-4 mb-6">
            {successMessage ? (
              <div className="space-y-3">
                <p className="text-xs text-[var(--clay-muted)] font-medium">
                  Your new password is now active. Click below to sign in with your updated credentials.
                </p>
                <ClayButton
                  type="button"
                  variant="coral"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </ClayButton>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <ClayInput
                  label="Registered Institutional Email"
                  type="email"
                  placeholder="Email"
                  icon={<Mail className="h-4 w-4" />}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />

                <ClayInput
                  label="New Password of Your Choice"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Password"
                  icon={<Lock className="h-4 w-4" />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[var(--clay-muted)] hover:text-[var(--clay-text)] transition-colors p-1"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  required
                />

                <ClayInput
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Password"
                  icon={<Lock className="h-4 w-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[var(--clay-muted)] hover:text-[var(--clay-text)] transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  required
                />

                <ClayButton
                  type="submit"
                  variant="coral"
                  size="lg"
                  fullWidth
                  disabled={isResetting}
                >
                  <span>{isResetting ? 'Saving New Password...' : 'Save New Password'}</span>
                  <ArrowRight className="h-4 w-4" />
                </ClayButton>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-bold text-[var(--clay-muted)] hover:text-[var(--clay-text)] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--clay-border)] flex items-center justify-between text-xs text-[var(--clay-muted)]">
          <span className="flex items-center gap-1.5 font-bold text-[var(--clay-text)]">
            <ShieldCheck className="h-4 w-4 text-[#2EC4B6]" />
            Strict Institutional Access
          </span>
          <span className="text-[11px]">Contact Academic Office for assistance</span>
        </div>
      </ClayCard>
    </div>
  );
}
