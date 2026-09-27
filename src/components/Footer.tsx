import React from 'react';
import { ArrowUp, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateTab?: (tab: 'flights' | 'trains' | 'buses' | 'hotels') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateTab }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#073D36] text-white border-t border-[#062F2B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to top button matching video */}
        <div className="mb-10">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#EFE7DB]/80 hover:text-white transition-colors cursor-pointer"
          >
            <span>&lt; Back to home</span>
          </button>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#073D36] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                P
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-white">
                PlanMyStay<span className="text-[#F27658]">.in</span>
              </span>
            </div>

            <p className="text-sm text-[#EFE7DB]/80 font-light leading-relaxed">
              Travel planning, made human.
            </p>

            <div className="text-xs text-[#EFE7DB]/60 font-light">
              Founded by <strong>Alluri Vijaya Priya</strong>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#EFE7DB]">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-xs text-[#EFE7DB]/75">
              <li>
                <button
                  onClick={() => onNavigateTab?.('flights')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Flights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('trains')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Trains
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('hotels')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hotels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('buses')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Buses
                </button>
              </li>
              <li>
                <a href="#hotels" className="hover:text-white transition-colors">
                  Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#EFE7DB]">
              COMPANY
            </h4>
            <ul className="space-y-2 text-xs text-[#EFE7DB]/75">
              <li>
                <a href="#experience" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="mailto:support@planmystay.in" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#hotels" className="hover:text-white transition-colors">
                  Partner With Us
                </a>
              </li>
            </ul>
          </div>

          {/* Peace of Mind Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#EFE7DB]">
              FOR YOUR PEACE OF MIND
            </h4>
            <ul className="space-y-2 text-xs text-[#EFE7DB]/75">
              <li>
                <a href="#hotels" className="hover:text-white transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#hotels" className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#hotels" className="hover:text-white transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#F27658] transition-colors cursor-pointer text-left"
                >
                  List Your Hotel
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching video */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EFE7DB]/60">
          <div>
            © 2026 PlanMyStay.in. Built for better journeys. To make travel effortless across India with transparent booking and AI trip planning.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#EFE7DB] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F27658]" />
              <span>Admin preview</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
