import React from 'react';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import { PlanMyStayLogo } from './PlanMyStayLogo';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenOwnerPortal?: () => void;
  onOpenLegal?: (tab: LegalTab) => void;
  onNavigateTab?: (tab: 'flights' | 'trains' | 'buses' | 'hotels') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenOwnerPortal,
  onOpenLegal,
  onNavigateTab,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#073D36] text-white border-t border-[#062F2B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to top button */}
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
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-sm">
              <PlanMyStayLogo className="h-7 w-auto" />
            </div>

            <p className="text-sm text-[#EFE7DB]/80 font-light leading-relaxed">
              Travel planning, made human. Curated, verified, and affordable stays across India.
            </p>

            <div className="text-xs text-[#EFE7DB]/60 font-light">
              Official Platform: <span className="text-white font-medium">PlanMyStay.in</span>
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
                  onClick={() => onNavigateTab?.('hotels')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Hotels & Stays
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('flights')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Flights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('trains')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Trains
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('buses')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Buses
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#EFE7DB]">
              COMPANY & SUPPORT
            </h4>
            <ul className="space-y-2 text-xs text-[#EFE7DB]/75">
              <li>
                <button
                  onClick={() => onOpenLegal?.('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('support')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Help & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenOwnerPortal ? onOpenOwnerPortal() : onOpenAdmin()}
                  className="hover:text-white transition-colors cursor-pointer text-left font-medium text-[#F27658]"
                >
                  List Your Property (Owners)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#EFE7DB]">
              LEGAL POLICIES
            </h4>
            <ul className="space-y-2 text-xs text-[#EFE7DB]/75">
              <li>
                <button
                  onClick={() => onOpenLegal?.('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('cancellation')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cancellation & Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#F27658] transition-colors cursor-pointer text-left"
                >
                  Admin Verification Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EFE7DB]/60">
          <div>
            © 2026 PlanMyStay.in. Built for better journeys across India with transparent booking and verified accommodations.
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
