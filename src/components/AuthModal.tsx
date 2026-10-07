import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Key, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types/travel';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

      setSuccessMessage(data.message || 'Reset link sent!');
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setMode('reset');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending password reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
      setMode('login');
      setPassword(newPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const loginAsFounder = () => {
    const founderUser: UserProfile = {
      id: 'usr_founder_01',
      name: 'Alluri Vijaya Priya',
      email: 'pranaviguntoju13@gmail.com',
      role: 'ADMIN',
      title: 'Founder account',
      avatar: 'AP',
      phone: '+91 98490 12345',
      preferences: {
        mealPref: 'North Indian & Continental',
        seatPref: 'Window / Lower Berth',
        hotelClass: '5-Star Luxury & Heritage',
      },
    };
    onLoginSuccess(founderUser);
    onClose();
  };

  const loginAsOwner = () => {
    const ownerUser: UserProfile = {
      id: 'usr_owner_01',
      name: 'Ramesh Varma',
      email: 'ramesh.varma@heritagehaveli.in',
      role: 'OWNER',
      title: 'Heritage Hotel Partner',
      avatar: 'RV',
      phone: '+91 94400 55667',
      preferences: {
        mealPref: 'Traditional Rajasthani Thali',
        seatPref: 'Aisle',
        hotelClass: 'Heritage Palace',
      },
    };
    onLoginSuccess(ownerUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#073D36] flex items-center justify-center text-white font-serif font-bold text-sm">
              P
            </div>
            <h3 className="font-serif font-bold text-lg text-[#17201E]">
              {mode === 'register' && 'Create PlanMyStay Account'}
              {mode === 'login' && 'Sign In to PlanMyStay'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Set New Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Role Shortcuts for Testing */}
          {mode === 'login' && (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-white border border-[#073D36]/20 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#17201E] text-white flex items-center justify-center text-xs font-bold">
                    AP
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#17201E]">Alluri Vijaya Priya</div>
                    <div className="text-[10px] text-neutral-500">Founder & Admin Account</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loginAsFounder}
                  className="px-3 py-1.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors cursor-pointer"
                >
                  Admin Login
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-amber-300 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-900 text-white flex items-center justify-center text-xs font-bold">
                    RV
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#17201E]">Ramesh Varma</div>
                    <div className="text-[10px] text-neutral-500">Hotel Owner Account</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loginAsOwner}
                  className="px-3 py-1.5 rounded-full bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 transition-colors cursor-pointer"
                >
                  Owner Login
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400 my-2">
                <div className="flex-1 h-[1px] bg-[#EFE7DB]" />
                <span>or continue with email</span>
                <div className="flex-1 h-[1px] bg-[#EFE7DB]" />
              </div>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <User className="w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98490 00000"
                    className="w-full text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200 leading-snug">
                🔒 Public registration registers your account with the standard <strong>User</strong> role. Property owner & administrative privileges require verified authorization.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-semibold text-[#F27658] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-xs text-neutral-600">
                Enter your registered email address below. We will generate instructions to securely reset your password.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Password Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
            </form>
          )}

          {/* MODE: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Set New Password'}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            {mode === 'register' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('login');
                  }}
                  className="font-semibold text-[#F27658] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            ) : mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('register');
                  }}
                  className="font-semibold text-[#F27658] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
