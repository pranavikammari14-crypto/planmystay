import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  AlertCircle,
  Info,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  Send,
  AlertTriangle
} from 'lucide-react';
import { PlanMyStayLogo } from './PlanMyStayLogo';

export type LegalTab = 'about' | 'privacy' | 'terms' | 'cancellation' | 'contact' | 'support';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Booking Inquiry');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Keep URL hash in sync for direct navigation
  useEffect(() => {
    if (isOpen) {
      window.location.hash = activeTab;
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does PlanMyStay.in confirm my hotel reservation?',
      a: 'When you select an available stay, our platform locks the inventory and calculates the exact room charges, selected add-ons, and applicable 18% GST. Upon successful completion and server-side verification of payment via our RBI-authorized gateway (Razorpay), a confirmed e-ticket with a unique PlanMyStay Reference Code is generated and stored in your account.',
    },
    {
      q: 'What is the difference between Indicative Rates and Live Inventory?',
      a: 'To provide the widest coverage of quality budget stays across India, certain properties display verified reference prices sourced directly from established hotel chains (e.g., Treebo, Ginger, ibis). When you initiate a reservation, the live rate is confirmed before payment so you are never charged unexpected fees.',
    },
    {
      q: 'What identification documents are required at hotel check-in?',
      a: 'In accordance with Indian hospitality regulations, every adult guest staying at the property must present a valid government-issued photo ID at the front desk. Acceptable documents include Aadhaar Card, Passport, Voter ID Card, or Driving License. Please note that PAN Cards are not accepted as proof of address.',
    },
    {
      q: 'How does the Cancellation & Refund Policy work?',
      a: 'Cancellations made 48 hours or more prior to the scheduled 12:00 PM check-in date are eligible for a 100% full refund. Cancellations made between 24 and 48 hours before check-in receive a 50% refund on room charges. Cancellations under 24 hours or no-shows are non-refundable. Verified refunds are credited back to your original payment source (UPI, Card, NetBanking) within 5 to 7 working days.',
    },
    {
      q: 'Are my payment details secure on PlanMyStay.in?',
      a: 'Yes. PlanMyStay.in does not store credit/debit card numbers, CVVs, or NetBanking passwords on our servers. All financial handshakes occur directly through encrypted 256-bit TLS/SSL channels with Razorpay using HMAC-SHA256 signature verification.',
    },
    {
      q: 'How do I access my booking receipts and e-tickets?',
      a: 'You can view, download, or print your official e-tickets at any time by clicking "My Trips & Tickets" in the main navigation menu or from your User Dashboard.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-[#EFE7DB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#EFE7DB] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-[#EFE7DB] shadow-xs">
              <PlanMyStayLogo className="h-7 sm:h-8 w-auto" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#17201E]">
                Official Legal & Information Center
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                PlanMyStay.in • Policies, Terms, Leadership & Customer Support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/PlanMyStay_Errors_and_Fixing_Rules_Audit_Report.pdf"
              download="PlanMyStay_Errors_and_Fixing_Rules_Audit_Report.pdf"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#EFE7DB] text-xs font-semibold text-[#073D36] transition-colors shadow-xs"
              title="Download Pre-Launch Audit Report & Fixing Rules PDF"
            >
              <FileText className="w-3.5 h-3.5 text-[#F27658]" />
              <span>Audit & Rules PDF</span>
            </a>
            <button
              onClick={() => {
                window.location.hash = '';
                onClose();
              }}
              className="p-2 rounded-full hover:bg-neutral-200/70 transition-colors text-neutral-500 hover:text-neutral-900 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EFE7DB] bg-white px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms & Conditions</span>
          </button>

          <button
            onClick={() => setActiveTab('cancellation')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cancellation'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Cancellation & Refunds</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'support'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-neutral-700 leading-relaxed">
          {/* TAB 1: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-[#073D36]/10 text-[#073D36] text-[11px] font-bold uppercase tracking-wider">
                  Our Mission & Story
                </span>
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E]">
                  PlanMyStay.in — Travel Planning, Made Human.
                </h4>
                <p className="text-neutral-600 leading-relaxed">
                  PlanMyStay.in was founded to bring clarity, transparency, and effortless discovery to travelers across India. We believe every journey—from a spontaneous weekend getaway in Hyderabad or Mysuru, to high-stakes business conferences in Bengaluru and Mumbai, to spiritual retreats in Varanasi and Haridwar—deserves genuine accommodations and honest pricing.
                </p>
              </div>

              {/* DEDICATED FOUNDER & LEADERSHIP SECTION */}
              <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#073D36]" />
                  <h5 className="font-serif font-bold text-lg text-[#17201E]">
                    Leadership & Operations
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-5 rounded-xl bg-white border border-[#EFE7DB] shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                      Founder & Owner
                    </span>
                    <div className="font-serif font-bold text-xl text-[#073D36]">
                      Alluri Vijaya Priya
                    </div>
                    <p className="text-xs text-neutral-600 mt-1.5 leading-snug">
                      Strategic Vision, Property Curation, Commercial Partnerships & Guest Experience.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-white border border-[#EFE7DB] shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                      Technical Architecture
                    </span>
                    <div className="font-serif font-bold text-xl text-[#073D36]">
                      Lead Developer
                    </div>
                    <p className="text-xs text-neutral-600 mt-1.5 leading-snug">
                      Full-Stack Cloud Architecture, DRF Engineering, Security & Payment Integrity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[#17201E] text-base">What Sets PlanMyStay Apart</h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#F27658] mt-1.5 shrink-0"></span>
                    <span><strong>Verified Affordable Hotels:</strong> Curating dependable budget accommodations from respected chains such as Treebo, Ginger, ibis, Lemon Tree, Bloom Hotels, and rigorously inspected independent properties.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#F27658] mt-1.5 shrink-0"></span>
                    <span><strong>Price Transparency:</strong> Clear distinctions between indicative reference prices and verified live inventory, with explicit room charges, add-ons, and 18% GST itemized before payment.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#F27658] mt-1.5 shrink-0"></span>
                    <span><strong>Multimodal Connectivity:</strong> Integrated search connecting flights, Indian Railways, intercity buses, and local hotel bookings in one seamless interface.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#F27658] mt-1.5 shrink-0"></span>
                    <span><strong>Independent Partner Portal:</strong> Enabling legitimate hotel and farmhouse owners to list properties directly, subject to administrator review and verified licensing.</span>
                  </li>
                </ul>
              </div>

              {/* Notice of items pending founder confirmation */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Public Registration Details Pending Confirmation:</span>
                </div>
                <p className="text-amber-800 pl-5">
                  Corporate Registration / CIN number and registered corporate address are being updated for official public filings. For all business inquiries, contact <strong>founder@planmystay.in</strong> or <strong>support@planmystay.in</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  Data Protection & Privacy
                </span>
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-2">
                  PlanMyStay.in Privacy Policy
                </h4>
                <p className="text-xs text-neutral-400 mt-1">Last Updated: October 2026 • Compliant with Indian DPDP Standards</p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-neutral-600">
                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">1. Information We Collect</h5>
                  <p>When you use PlanMyStay.in, we collect only the necessary details to provide hotel reservations, account management, and travel discovery:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><strong>Account & Profile Information:</strong> Name, email address, mobile number, and password hashes. Passwords are protected using cryptographic PBKDF2 hashing algorithms with individual per-user salts.</li>
                    <li><strong>Reservation Details:</strong> Check-in and check-out dates, guest count, room category, special requests, and government ID type specified for check-in.</li>
                    <li><strong>Private-by-Default Travel Album:</strong> Photos uploaded to your personal Travel Album are private to your authenticated account ID by default (`is_private = true`) and are never published to public directories without your express instruction.</li>
                    <li><strong>Technical Device Telemetry:</strong> Anonymized browser type, device category, IP address, and session timestamps required for fraud prevention and double-booking avoidance.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">2. Payment Processing & Financial Security</h5>
                  <p>
                    PlanMyStay.in integrates with Reserve Bank of India (RBI) authorized payment gateways, including Razorpay. <strong>We do not store credit card numbers, debit card numbers, CVVs, or NetBanking passwords on our servers.</strong> All payment processing occurs over encrypted 256-bit TLS/SSL channels with cryptographic HMAC-SHA256 signature verification performed on our secure backend.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">3. Use of Your Information</h5>
                  <p>Your information is used strictly to:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Confirm and issue digital booking receipts, e-vouchers, and PNR references.</li>
                    <li>Communicate essential itinerary updates, confirmation tickets, or cancellation notices.</li>
                    <li>Transmit necessary guest roster details to the booked accommodation to honor your reservation.</li>
                    <li>Maintain platform security, prevent fraudulent reservations, and protect inventory integrity.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">4. Strict No-Sale Policy</h5>
                  <p>
                    PlanMyStay.in does not sell, rent, lease, or trade your personal data to third-party telemarketers, credit bureaus, or commercial advertisers. Data sharing is limited exclusively to the operational partner (hotel, transport operator, or payment gateway) required to fulfill your reservation.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">5. User Rights & Data Deletion</h5>
                  <p>
                    Under applicable data protection laws, you hold the right to access, rectify, or request erasure of your personal account information and travel history. To request an export or complete deletion of your data, email our Privacy Desk at <strong>privacy@planmystay.in</strong>.
                  </p>
                </section>

                {/* Grievance Desk Callout */}
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] text-xs space-y-1">
                  <div className="font-bold text-[#17201E]">Grievance Officer Contact Details:</div>
                  <div className="text-neutral-600">
                    Email: <strong>grievance@planmystay.in</strong> • Attn: Data Privacy Officer
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    * Physical corporate postal address and nodal officer contact telephone will be published upon final corporate gazette filing.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
                  Terms of Service
                </span>
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-2">
                  PlanMyStay.in Terms & Conditions
                </h4>
                <p className="text-xs text-neutral-400 mt-1">Effective Date: October 2026 • Governed by the Laws of India</p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-neutral-600">
                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">1. Platform Scope & Purpose</h5>
                  <p>
                    PlanMyStay.in operates as an online travel discovery and reservation management technology platform. We facilitate connections between travelers and verified third-party accommodation providers, transport operators, and curated stays across India.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">2. Indicative Pricing & Inventory Confirmation</h5>
                  <p>
                    Listed property rates reflect current indicative reference schedules. A reservation is legally finalized and room inventory secured only once payment has been verified by the backend gateway and a confirmed PlanMyStay Reference Code with an itemized GST invoice is issued.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">3. Mandatory Government Photo Identification</h5>
                  <p>
                    In accordance with Indian government regulations and local police guidelines, all adult guests must present an original, valid government-issued photo identity proof at the time of check-in (Aadhaar Card, Passport, Driving License, or Voter ID). PAN cards are generally not accepted as valid address proof. The property reserves the right to deny check-in to guests unable to present valid identification.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">4. Check-in, Check-out & House Rules</h5>
                  <p>
                    Standard hotel check-in time across India is 12:00 PM and check-out is 11:00 AM, unless otherwise stated on your booking voucher. Early check-in or late check-out is strictly subject to room availability and may attract nominal fees directly payable to the host property. Guests agree to abide by the respective hotel's house policies regarding occupancy, visitor hours, and noise regulations.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">5. Intellectual Property & Ownership Rights</h5>
                  <p>
                    The PlanMyStay.in brand name, logo, graphic marks, design system, website copy, and proprietary backend booking systems are the exclusive intellectual property of PlanMyStay.in and its lawful licensors. No portion of the platform may be copied, reproduced, reverse-engineered, or distributed without prior written consent.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">6. Property Owner Listings & Verification</h5>
                  <p>
                    Hotel and farmhouse owners listing properties via the Partner Portal warrant that all uploaded images, licensing records, room rates, and property amenities are authentic and up to date. PlanMyStay.in administrators review and verify property records prior to public publication.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">7. Governing Law & Dispute Resolution</h5>
                  <p>
                    These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with the use of PlanMyStay.in shall be subject to the exclusive jurisdiction of the competent courts of India.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 4: CANCELLATION & REFUND POLICY */}
          {activeTab === 'cancellation' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                  Cancellation & Refund Rules
                </span>
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-2">
                  PlanMyStay.in Cancellation & Refund Policy
                </h4>
                <p className="text-xs text-neutral-400 mt-1">Clear, fair, and transparent cancellation terms across all bookings</p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-neutral-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>48+ Hours Before Check-in</span>
                    </div>
                    <div className="font-serif font-bold text-lg text-emerald-900">100% Full Refund</div>
                    <p className="text-xs text-emerald-800">
                      Cancellations made 48 hours or more prior to the scheduled 12:00 PM check-in date are eligible for a complete 100% refund of the total booking amount.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>24 to 48 Hours Before Check-in</span>
                    </div>
                    <div className="font-serif font-bold text-lg text-amber-900">50% Room Refund</div>
                    <p className="text-xs text-amber-800">
                      Cancellations requested between 24 and 48 hours prior to check-in receive a 50% refund on room charges (excluding non-refundable gateway fees).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                  <div className="font-bold text-xs uppercase tracking-wider text-rose-800">
                    Under 24 Hours or No-Show
                  </div>
                  <p className="text-xs text-rose-900">
                    Cancellations submitted within 24 hours of scheduled arrival or guest no-shows are non-refundable, as the room inventory is committed and held by the property.
                  </p>
                </div>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">Refund Timelines & Payment Mode</h5>
                  <p>
                    All verified refunds are initiated automatically back to the original payment source (UPI, Debit/Credit Card, NetBanking). Refunds typically reflect in the guest's bank account within <strong>5 to 7 working days</strong>, subject to individual banking settlement cycles.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">Host-Initiated Cancellations & Force Majeure</h5>
                  <p>
                    In the rare event that a property is unable to honor a confirmed reservation due to structural issues, unforeseen weather events, or operational constraints, guests will receive an immediate 100% refund or equivalent alternate accommodation of equal or higher standard at no additional cost.
                  </p>
                </section>

                <section className="space-y-2">
                  <h5 className="font-bold text-[#17201E] text-sm sm:text-base">How to Initiate a Cancellation</h5>
                  <p>
                    You can cancel an upcoming trip at any time directly through the <strong>My Trips</strong> portal on PlanMyStay.in, or by sending your booking reference code to <strong>support@planmystay.in</strong>.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#073D36]/10 text-[#073D36] text-[11px] font-bold uppercase tracking-wider">
                  Get In Touch
                </span>
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-2">
                  Contact PlanMyStay.in
                </h4>
                <p className="text-xs text-neutral-500 mt-1">We're here to assist you with reservations, partner queries, and support.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE7DB] flex items-center justify-center text-[#073D36]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider text-neutral-400">Customer Support</div>
                  <div className="font-semibold text-sm text-[#073D36]">support@planmystay.in</div>
                  <p className="text-[11px] text-neutral-500">General inquiries, booking help & refunds</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE7DB] flex items-center justify-center text-[#073D36]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider text-neutral-400">Hotel Partners</div>
                  <div className="font-semibold text-sm text-[#073D36]">partners@planmystay.in</div>
                  <p className="text-[11px] text-neutral-500">Property listings, verifications & contracts</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE7DB] flex items-center justify-center text-[#073D36]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider text-neutral-400">Privacy & Grievances</div>
                  <div className="font-semibold text-sm text-[#073D36]">grievance@planmystay.in</div>
                  <p className="text-[11px] text-neutral-500">Data protection & legal compliance</p>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="p-6 rounded-2xl bg-white border border-[#EFE7DB] shadow-xs space-y-4">
                <h5 className="font-serif font-bold text-lg text-[#17201E]">Send Us a Direct Message</h5>

                {contactSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>Thank you! Your message has been received. Our support team will reply to <strong>{contactEmail}</strong> shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Priya Sharma"
                          className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#073D36]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#073D36]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Inquiry Subject
                      </label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#073D36] bg-white cursor-pointer"
                      >
                        <option value="Booking Inquiry">Existing Reservation / PNR Inquiry</option>
                        <option value="Cancellation Request">Cancellation & Refund Assistance</option>
                        <option value="Hotel Partnership">Hotel or Farmhouse Owner Listing</option>
                        <option value="General Feedback">Feedback or Feature Suggestion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Message Details
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please include your booking reference code or property details if applicable..."
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#073D36] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Information Flagged for Confirmation */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 space-y-1">
                <div><strong>Operating Hours:</strong> 9:00 AM – 8:00 PM IST (Monday through Saturday)</div>
                <div><strong>Location:</strong> India • Dedicated corporate phone helpline and registered entity office address will be updated upon final registry gazette.</div>
              </div>
            </div>
          )}

          {/* TAB 6: HELP & SUPPORT / FAQS */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
                  Knowledge Base & FAQs
                </span>
                <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-2">
                  Frequently Asked Questions
                </h4>
                <p className="text-xs text-neutral-500 mt-1">Everything you need to know about booking, check-in, and payments.</p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-[#EFE7DB] rounded-2xl overflow-hidden bg-white shadow-xs"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-xs sm:text-sm text-[#17201E]">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#073D36] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-1 border-t border-[#EFE7DB] bg-[#FAF6F0]/50 text-xs text-neutral-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick links to actions */}
              <div className="p-5 rounded-2xl bg-[#073D36] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-serif font-bold text-base">Still need assistance?</div>
                  <p className="text-xs text-[#EFE7DB]/80 mt-0.5">
                    Our guest support desk is standing by to help with your trip.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="px-5 py-2 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                >
                  Contact Support Desk
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EFE7DB] bg-[#FAF6F0] flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            © 2026 PlanMyStay.in • All rights reserved
          </div>
          <button
            onClick={() => {
              window.location.hash = '';
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
