import React, { useState, useEffect } from 'react';
import { Hotel, Room, Booking, UserProfile } from '../types/travel';
import { PlanMyStayLogo } from './PlanMyStayLogo';
import { LegalTab } from './LegalModal';
import {
  X,
  Check,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  CreditCard,
  Sparkles,
  Loader2,
  Printer,
  AlertCircle,
  FileText,
  Building,
  MapPin,
  Lock,
  RotateCcw
} from 'lucide-react';

interface BookingFlowModalProps {
  hotel: Hotel | null;
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
  currentUser?: UserProfile | null;
  onOpenLegal?: (tab: LegalTab) => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  hotel,
  room,
  isOpen,
  onClose,
  onBookingComplete,
  currentUser,
  onOpenLegal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Dates & Guests
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-18');
  const [guestsCount, setGuestsCount] = useState(2);

  // Guest Details — strictly initialized from logged in user or empty, never hardcoding developer names
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('Quiet room with high floor and comfortable bed.');

  // Update when currentUser or isOpen changes
  useEffect(() => {
    if (currentUser) {
      if (!guestName) setGuestName(currentUser.name || '');
      if (!guestEmail) setGuestEmail(currentUser.email || '');
      if (!guestPhone) setGuestPhone(currentUser.phone || '');
    }
  }, [currentUser, isOpen]);

  // Add-ons
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['Airport Luxury Transfer']);

  // Coupon
  const [couponCode, setCouponCode] = useState('STAY2026');
  const [couponDiscount, setCouponDiscount] = useState(2500);
  const [couponApplied, setCouponApplied] = useState(true);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen || !hotel || !room) return null;

  // Calculate pricing
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 3
  );

  const basePrice = room.price * nights;
  const addOnsTotal = selectedAddons.length * 1500;
  const discountAmount = couponApplied ? couponDiscount : 0;
  const taxableSubtotal = Math.max(0, basePrice + addOnsTotal - discountAmount);
  const gst = Math.round(taxableSubtotal * 0.18);
  const finalTotal = taxableSubtotal + gst;

  const toggleAddon = (addon: string) => {
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addon));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'STAY2026') {
      setCouponDiscount(2500);
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === 'WELCOME500') {
      setCouponDiscount(500);
      setCouponApplied(true);
    } else {
      alert('Invalid or expired coupon code.');
    }
  };

  const handleProcessPayment = async () => {
    if (!guestName.trim() || !guestEmail.trim()) {
      alert('Please fill in guest name and email address in Step 2.');
      setStep(2);
      return;
    }

    if (hotel && (!hotel.bookingAuthorized || hotel.verificationStatus !== 'Verified')) {
      setPaymentError(
        `Direct digital booking is not authorized for "${hotel.name}". This is a Verified Informational Listing. No payment will be collected.`
      );
      setIsProcessingPayment(false);
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create genuine payment order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          hotelName: hotel.name,
          currency: 'INR',
          hotelId: hotel.id,
          roomName: room.name,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initialize payment order on server.');
      }

      const orderData = await orderRes.json();
      if (!orderData.orderId) {
        throw new Error('Valid Razorpay order ID was not received from the server.');
      }

      // Check if Razorpay SDK script is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error(
          'Razorpay payment checkout script is not loaded. Please ensure you are connected to the internet and ad-blockers are disabled, then reload the page.'
        );
      }

      // 2. Open Official Razorpay Checkout Modal
      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'PlanMyStay.in',
        description: `${hotel.name} · ${room.name} (${nights} Nights)`,
        image: 'https://planmystay.in/favicon.ico',
        order_id: orderData.orderId,
        prefill: {
          name: guestName.trim(),
          email: guestEmail.trim(),
          contact: guestPhone.trim(),
        },
        notes: {
          hotelId: hotel.id,
          hotelName: hotel.name,
          roomName: room.name,
          nights: String(nights),
          guests: String(guestsCount),
        },
        theme: {
          color: '#073D36',
        },
        handler: async (response: any) => {
          // Cryptographic handshake: verify signature server-side
          try {
            setIsProcessingPayment(true);
            setPaymentError(null);

            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: finalTotal,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || verifyData.error || 'Cryptographic payment verification failed.');
            }

            // 3. Payment is verified by server! Create verified production booking record
            const newBooking: Booking = {
              id: `PMS-${hotel.city.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
              hotelId: hotel.id,
              hotelName: hotel.name,
              hotelImage: hotel.images[0],
              hotelLocation: hotel.location,
              roomName: room.name,
              checkIn,
              checkOut,
              nights,
              guests: guestsCount,
              guestName: guestName.trim(),
              guestEmail: guestEmail.trim(),
              guestPhone: guestPhone.trim(),
              specialRequests,
              addOns: selectedAddons,
              basePrice,
              taxPrice: gst,
              totalPrice: finalTotal,
              totalPaid: finalTotal,
              status: 'confirmed',
              isDemo: false,
              bookingType: 'LIVE',
              referenceCode: `PMS-HTL-${hotel.city.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
              bookedAt: new Date().toISOString(),
              paymentMethod: paymentMethod === 'upi' ? 'UPI (Razorpay Verified)' : paymentMethod === 'card' ? 'Card (Razorpay Verified)' : 'NetBanking (Razorpay Verified)',
              paymentId: response.razorpay_payment_id,
            };

            // Persist verified reservation to backend database
            await fetch('/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newBooking),
            });

            setConfirmedBooking(newBooking);
            onBookingComplete(newBooking);
            setStep(6);
          } catch (err: any) {
            setPaymentError(err.message || 'Payment verification could not be completed.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (response: any) => {
        setIsProcessingPayment(false);
        setPaymentError(
          response?.error?.description ||
          'Payment failed or was declined by the bank. Please try another card or UPI handle.'
        );
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Payment processing could not be initialized. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Step Tracker */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-[#FAF6F0] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#F27658] uppercase tracking-wider">
              {step === 6 ? 'Official Tax Invoice & E-Ticket' : `Step ${step} of 5`}
            </span>
            <h3 className="font-serif font-bold text-xl text-[#17201E]">
              {step === 1 && 'Dates & Occupancy'}
              {step === 2 && 'Primary Guest Information'}
              {step === 3 && 'Enhance Your Stay'}
              {step === 4 && 'Price Summary & Discounts'}
              {step === 5 && 'Secure Razorpay Payment'}
              {step === 6 && 'Booking Confirmed!'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Dates & Occupancy */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB]">
                <div className="font-serif font-bold text-lg text-[#17201E]">{hotel.name}</div>
                <div className="text-xs text-neutral-500">{hotel.location} · {room.name}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl border border-[#EFE7DB]">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-sm font-semibold text-[#17201E] focus:outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-[#EFE7DB]">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-sm font-semibold text-[#17201E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#EFE7DB]">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Number of Guests
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full text-sm font-semibold text-[#17201E] focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults (Extra bed provided)</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
                <span>Calculated: <strong className="text-[#17201E]">{nights} Nights</strong> stay</span>
                <span>Base rate: ₹{room.price.toLocaleString('en-IN')} / night</span>
              </div>
            </div>
          )}

          {/* STEP 2: Guest Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Full Name (as per Govt ID) *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="E.g., High-floor room, late arrival, quiet corner..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36] resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#073D36] shrink-0" />
                <span>
                  <strong>Govt ID Check:</strong> In accordance with Indian hospitality regulations, all adult guests must present a valid Government Photo ID (Aadhaar, Passport, Driving License, or Voter ID) at check-in.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Enhance Your Stay */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-600">
                Optional services curated to elevate your stay. You can add or modify these before payment:
              </div>

              <div className="space-y-3">
                {[
                  { id: 'Airport Luxury Transfer', name: 'Airport / Railway Luxury Pick-up', desc: 'Chauffeured sedan from airport or rail terminal directly to hotel.', price: 1500 },
                  { id: 'Buffet Breakfast & High Tea', name: 'Gourmet Buffet Breakfast & High Tea', desc: 'Daily multi-cuisine buffet for all registered guests.', price: 1500 },
                  { id: 'Flexible Check-in', name: 'Early Check-in / Late Check-out Assurance', desc: 'Guaranteed 2-hour buffer on arrival or departure schedule.', price: 1500 },
                ].map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#073D36] bg-[#073D36]/5'
                          : 'border-[#EFE7DB] bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-xs sm:text-sm text-[#17201E] flex items-center gap-2">
                          <span>{addon.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#073D36] text-white px-2 py-0.5 rounded-full font-bold">
                              Added
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">{addon.desc}</p>
                      </div>

                      <div className="font-serif font-bold text-sm text-[#073D36]">
                        +₹{addon.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Price Summary & Discounts */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-3 text-xs">
                <div className="font-bold text-xs uppercase tracking-wider text-[#17201E] pb-2 border-b border-neutral-200">
                  Itemized Tariff Summary
                </div>

                <div className="flex justify-between">
                  <span>Room Tariff ({nights} Nights × ₹{room.price.toLocaleString('en-IN')}):</span>
                  <span className="font-semibold text-[#17201E]">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>

                {addOnsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Curated Add-ons ({selectedAddons.length}):</span>
                    <span className="font-semibold text-[#17201E]">₹{addOnsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {couponDiscount > 0 && couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Applied ({couponCode}):</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Applicable GST (18% on taxable charges):</span>
                  <span className="font-semibold text-[#17201E]">₹{gst.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-neutral-300 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-[#17201E]">Final Total Amount:</span>
                  <span className="font-serif font-bold text-2xl text-[#073D36]">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Coupon Engine */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] space-y-2">
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Promo Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="E.g., STAY2026, WELCOME500"
                    className="flex-1 p-2.5 rounded-xl border border-neutral-200 text-xs font-mono uppercase focus:outline-none focus:border-[#073D36]"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-4 py-2.5 rounded-xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{couponCode}</strong> applied successfully!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Payment Gateway Simulation & Verification */}
          {step === 5 && (
            <div className="space-y-4">
              {paymentError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Payment Verification Incomplete</div>
                    <p className="mt-0.5">{paymentError}</p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-500">Payable Amount (incl. 18% GST)</div>
                  <div className="font-serif font-bold text-2xl text-[#073D36]">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                {[
                  { id: 'upi', name: 'Instant UPI (Google Pay, PhonePe, Paytm, BHIM)', desc: 'Instant NPCI settlement with HMAC-SHA256 signature verification' },
                  { id: 'card', name: 'Credit or Debit Card (Visa, MasterCard, RuPay)', desc: 'Secure tokenized authorization with zero card storage' },
                  { id: 'netbanking', name: 'NetBanking (All Major Indian Banks)', desc: 'Enforced 2FA and 3D Secure banking verification' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-[#073D36] bg-[#073D36]/5'
                        : 'border-[#EFE7DB] bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#17201E]">{pm.name}</div>
                      <div className="text-[11px] text-neutral-500">{pm.desc}</div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id as any)}
                      className="accent-[#073D36] w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {/* Policy Consent Terms */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                <div>
                  By confirming this payment, you agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.('terms')}
                    className="text-[#073D36] font-semibold underline hover:text-[#F27658] cursor-pointer"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and acknowledge our{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.('cancellation')}
                    className="text-[#073D36] font-semibold underline hover:text-[#F27658] cursor-pointer"
                  >
                    Cancellation & Refund Policy
                  </button>.
                </div>
                <div className="text-neutral-400 text-[10px]">
                  Bookings are finalized only upon verified cryptographic signature confirmation by our backend.
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Official Booking Confirmation Ticket / Receipt */}
          {step === 6 && confirmedBooking && (
            <div className="space-y-5 text-center py-2" id="printable-booking-ticket">
              {/* Official Ticket Header with PlanMyStay Logo */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#073D36]/20 shadow-md text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                  <div>
                    <PlanMyStayLogo className="h-9 w-auto" />
                    <span className="text-[10px] text-neutral-400 block mt-0.5 uppercase tracking-wider font-semibold">
                      Official E-Ticket & Tax Invoice
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Booking Reference
                    </span>
                    <span className="font-mono font-bold text-lg text-[#073D36]">
                      {confirmedBooking.referenceCode || confirmedBooking.id}
                    </span>
                    <div className="text-[10px] font-medium text-emerald-700 flex items-center sm:justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>Verified Confirmed Reservation</span>
                    </div>
                  </div>
                </div>

                {/* Hotel & Guest Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Property & Location
                    </span>
                    <div className="font-serif font-bold text-base text-[#17201E]">
                      {confirmedBooking.hotelName || hotel.name}
                    </div>
                    <div className="text-neutral-500">
                      {hotel.fullAddress || `${hotel.city}, ${hotel.state}`}
                    </div>
                    <div className="text-neutral-500">
                      Room Category: <strong>{confirmedBooking.roomName || room.name}</strong> ({room.type})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Guest & Stay Schedule
                    </span>
                    <div className="font-semibold text-[#17201E]">
                      {guestName || confirmedBooking.guestName || 'Valued Guest'} ({guestsCount} {guestsCount === 1 ? 'Adult' : 'Adults'})
                    </div>
                    <div className="text-neutral-500">
                      Email: {guestEmail || confirmedBooking.guestEmail}
                    </div>
                    <div className="text-neutral-500">
                      Dates: <strong>{confirmedBooking.checkIn}</strong> to <strong>{confirmedBooking.checkOut}</strong> ({confirmedBooking.nights || nights} Nights)
                    </div>
                    <div className="text-neutral-500">
                      Check-in: 12:00 PM · Check-out: 11:00 AM
                    </div>
                  </div>
                </div>

                {/* Itemized Financial Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-2 text-xs text-neutral-600">
                  <div className="font-bold text-[#17201E] uppercase tracking-wider text-[10px] pb-1 border-b border-neutral-200">
                    Payment Breakdown & GST Invoice
                  </div>

                  <div className="flex justify-between">
                    <span>Room Charges ({nights} Nights × ₹{room.price.toLocaleString('en-IN')}):</span>
                    <span className="font-medium text-[#17201E]">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>

                  {addOnsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Curated Add-ons:</span>
                      <span className="font-medium text-[#17201E]">₹{addOnsTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promo Discount ({couponCode}):</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Applicable GST & Govt Taxes (18%):</span>
                    <span className="font-medium text-[#17201E]">₹{gst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-300 flex justify-between items-baseline text-sm">
                    <span className="font-bold text-[#17201E]">Total Amount Paid:</span>
                    <span className="font-serif font-bold text-xl text-[#073D36]">
                      ₹{(confirmedBooking.totalPaid || confirmedBooking.totalPrice || finalTotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/60 flex flex-wrap justify-between gap-1">
                    <span>Payment Gateway: <strong>Razorpay Secured ({paymentMethod.toUpperCase()})</strong></span>
                    <span>Status: <strong className="text-emerald-700">PAID & SETTLED</strong></span>
                    <span>Transaction ID: <strong className="font-mono">{confirmedBooking.paymentId}</strong></span>
                  </div>
                </div>

                {/* Policy Reference & Support */}
                <div className="text-[11px] text-neutral-500 pt-1 space-y-1">
                  <div>
                    <strong>Cancellation & Refund Policy:</strong> {hotel.cancellationPolicy || 'Free cancellation up to 48 hours prior to check-in.'}
                  </div>
                  <div>
                    <strong>Need Support?</strong> Contact <strong>support@planmystay.in</strong> quoting booking reference <strong>{confirmedBooking.referenceCode || confirmedBooking.id}</strong>.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-[#073D36]" />
                  <span>Print Ticket / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-2.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 6 && (
          <div className="p-4 border-t border-neutral-100 bg-[#FAF6F0] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-6 py-2.5 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
                className="px-7 py-2.5 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{finalTotal.toLocaleString('en-IN')} & Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
