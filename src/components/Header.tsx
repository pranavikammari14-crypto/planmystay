import React, { useState } from 'react';
import { UserProfile } from '../types/travel';
import { Compass, Wallet, Settings, LogOut, ShieldCheck, Menu, X, ChevronDown, Sparkles, Flame, Hotel as HotelIcon, LayoutDashboard, Camera } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  onOpenDashboard?: () => void;
  onOpenOwnerPortal?: () => void;
  onOpenTrips: () => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateTab?: (tab: 'flights' | 'trains' | 'buses' | 'hotels') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenDashboard,
  onOpenOwnerPortal,
  onOpenTrips,
  onOpenWallet,
  onOpenSettings,
  onOpenAdmin,
  onOpenAI,
  onOpenAuth,
  onLogout,
  onNavigateTab,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Traveler');
  const firstName = displayName.split(' ')[0] || 'Traveler';
  const avatarText = user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : (user?.email ? user.email.slice(0, 2).toUpperCase() : 'AP'));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFE7DB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#073D36] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              P
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-[#17201E]">
              PlanMyStay<span className="text-[#F27658]">.in</span>
            </span>
          </a>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100/90 text-amber-900 border border-amber-300/70">
            Demo Mode
          </span>
        </div>

        {/* Center Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#17201E]/80">
          <button
            onClick={() => onNavigateTab?.('hotels')}
            className="hover:text-[#F27658] transition-colors cursor-pointer"
          >
            Stays
          </button>
          <button
            onClick={() => onNavigateTab?.('flights')}
            className="hover:text-[#F27658] transition-colors cursor-pointer"
          >
            Flights
          </button>
          <button
            onClick={() => onNavigateTab?.('trains')}
            className="hover:text-[#F27658] transition-colors cursor-pointer"
          >
            Trains
          </button>
          <button
            onClick={() => onNavigateTab?.('buses')}
            className="hover:text-[#F27658] transition-colors cursor-pointer"
          >
            Buses
          </button>
          <a
            href="#experience"
            className="hover:text-[#F27658] transition-colors"
          >
            Experience
          </a>
        </nav>

        {/* Right Action & Profile */}
        <div className="flex items-center gap-3">
          {/* AI Quick Button on desktop */}
          <button
            onClick={onOpenAI}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#073D36]/10 text-[#073D36] hover:bg-[#073D36] hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F27658]" />
            <span>AI Concierge</span>
          </button>

          {/* User Profile Dropdown Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-[#EFE7DB] hover:border-[#073D36]/30 bg-[#FAF6F0] hover:bg-white transition-all cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#17201E] text-white flex items-center justify-center text-xs font-bold tracking-wider">
                  {avatarText}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[#17201E] max-w-[110px] truncate">
                  {firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Profile Dropdown matching the video */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-[#EFE7DB] p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header in dropdown */}
                    <div className="flex items-center gap-3 p-3 border-b border-neutral-100">
                      <div className="w-10 h-10 rounded-full bg-[#17201E] text-white flex items-center justify-center font-bold text-sm">
                        {avatarText}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-sm text-[#17201E] truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          {user.title || 'Founder account'}
                        </div>
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="py-2 space-y-0.5">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenDashboard) onOpenDashboard();
                          else onOpenTrips();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-800 hover:text-[#073D36] hover:bg-[#FAF6F0] transition-colors cursor-pointer text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#073D36]" />
                        <div className="flex-1 flex items-center justify-between">
                          <span>User Dashboard</span>
                          <span className="text-[10px] font-bold text-[#F27658] bg-[#F27658]/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Flame className="w-3 h-3 fill-[#F27658]" />
                            <span>Streak</span>
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenTrips();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:text-[#073D36] hover:bg-[#F7F1E8] transition-colors cursor-pointer text-left"
                      >
                        <Compass className="w-4 h-4 text-neutral-500" />
                        <span>My Trips & Tickets</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenWallet();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:text-[#073D36] hover:bg-[#F7F1E8] transition-colors cursor-pointer text-left"
                      >
                        <Wallet className="w-4 h-4 text-neutral-500" />
                        <span>Travel wallet</span>
                      </button>

                      {(user.role === 'OWNER' || user.role === 'ADMIN') && onOpenOwnerPortal && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenOwnerPortal();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100/70 transition-colors cursor-pointer text-left"
                        >
                          <HotelIcon className="w-4 h-4 text-amber-700" />
                          <span>Owner Portal</span>
                        </button>
                      )}

                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#073D36] bg-[#073D36]/5 hover:bg-[#073D36]/10 transition-colors cursor-pointer text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#073D36]" />
                          <span>Admin Executive Hub</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:text-[#073D36] hover:bg-[#F7F1E8] transition-colors cursor-pointer text-left"
                      >
                        <Settings className="w-4 h-4 text-neutral-500" />
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#073D36] text-white hover:bg-[#062F2B] transition-colors cursor-pointer"
            >
              Sign in
            </button>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-b border-[#EFE7DB] space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <button
              onClick={() => {
                onNavigateTab?.('hotels');
                setMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#F7F1E8] text-[#17201E] text-left font-medium"
            >
              🏨 Stays
            </button>
            <button
              onClick={() => {
                onNavigateTab?.('flights');
                setMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#F7F1E8] text-[#17201E] text-left font-medium"
            >
              ✈️ Flights
            </button>
            <button
              onClick={() => {
                onNavigateTab?.('trains');
                setMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#F7F1E8] text-[#17201E] text-left font-medium"
            >
              🚆 Trains
            </button>
            <button
              onClick={() => {
                onNavigateTab?.('buses');
                setMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#F7F1E8] text-[#17201E] text-left font-medium"
            >
              🚌 Buses
            </button>
          </div>
          <button
            onClick={() => {
              setMenuOpen(false);
              onOpenAI();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#073D36] text-white text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#F27658]" />
            Plan with AI Concierge
          </button>
        </div>
      )}
    </header>
  );
};
