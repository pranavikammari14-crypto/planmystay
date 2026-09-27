import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
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
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || (email.split('@')[0]),
      email: email || 'traveler@planmystay.in',
      role: 'USER',
      title: 'Member account',
      avatar: (name || email || 'US').slice(0, 2).toUpperCase(),
      phone: '+91 98490 00000',
    };
    onLoginSuccess(newUser);
    onClose();
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
              {isRegister ? 'Create PlanMyStay Account' : 'Sign In to PlanMyStay'}
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
        <div className="p-6 space-y-4">
          {/* Quick Founder Login Shortcut */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#073D36]/20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#17201E] text-white flex items-center justify-center text-xs font-bold">
                AP
              </div>
              <div>
                <div className="font-semibold text-xs text-[#17201E]">Alluri Vijaya Priya</div>
                <div className="text-[10px] text-neutral-500">Founder Account (Demo preset)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={loginAsFounder}
              className="px-3.5 py-1.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors cursor-pointer"
            >
              Sign in as AP
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400 my-2">
            <div className="flex-1 h-[1px] bg-[#EFE7DB]" />
            <span>or continue with email</span>
            <div className="flex-1 h-[1px] bg-[#EFE7DB]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
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
                    placeholder="e.g. Ramesh Varma"
                    className="w-full text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

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

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer mt-2"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-1">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-semibold text-[#F27658] hover:underline"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-semibold text-[#F27658] hover:underline"
                >
                  Create one now
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
