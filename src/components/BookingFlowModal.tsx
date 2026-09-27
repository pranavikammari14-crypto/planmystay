import React, { useState } from 'react';
import { Hotel, Room, Booking } from '../types/travel';
import { X, Check, ShieldCheck, Calendar, User, ArrowRight, CreditCard, Sparkles, Loader2, Download, Printer } from 'lucide-react';

interface BookingFlowModalProps {
  hotel: Hotel | null;
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  hotel,
  room,
  isOpen,
  onClose,
  onBookingComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Dates & Guests
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-18');
  const [guestsCount, setGuestsCount] = useState(2);

  // Guest Details
  const [guestName, setGuestName] = useState('Alluri Vijaya Priya');
  const [guestEmail, setGuestEmail] = useState('pranaviguntoju13@gmail.com');
  const [guestPhone, setGuestPhone] = useState('+91 98490 12345');
  const [specialRequests, setSpecialRequests] = useState('Quiet high-floor room with king bed and late check-in.');

  // Add-ons
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['Airport Luxury Transfer']);

  // Coupon
  const [couponCode, setCouponCode] = useState('STAY2026');
  const [couponDiscount, setCouponDiscount] = useState(2500);
  const [couponApplied, setCouponApplied] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
    setIsProcessingPayment(true);

    try {
      // Create backend order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          hotelName: hotel.name,
        }),
      });
      const orderData = await orderRes.json();

      // Simulate payment verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        addOns: selectedAddons,
        basePrice,
        taxPrice: gst,
        totalPrice: finalTotal,
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
        paymentMethod: paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : paymentMethod === 'card' ? 'Visa / Mastercard' : 'NetBanking',
        paymentId: `pay_rzp_${Date.now()}`,
      };

      // Persist in backend
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });

      setConfirmedBooking(newBooking);
      onBookingComplete(newBooking);
      setStep(6);
    } catch (err) {
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Step Tracker */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-[#FAF6F0] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#F27658] uppercase tracking-wider">
              {step === 6 ? 'Confirmed Voucher' : `Step ${step} of 5`}
            </span>
            <h3 className="font-serif font-bold text-xl text-[#17201E]">
              {step === 1 && 'Dates & Occupancy'}
              {step === 2 && 'Primary Guest Information'}
              {step === 3 && 'Enhance Your Stay'}
              {step === 4 && 'Price Summary & Discounts'}
              {step === 5 && 'Secure Payment'}
              {step === 6 && 'Booking Confirmed!'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
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
                  Full Name (as per Govt ID)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
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
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Add-ons */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                Enhance your stay with PlanMyStay’s curated on-property experiences.
              </p>

              {[
                { name: 'Airport Luxury Transfer', price: '₹1,500', desc: 'Chauffeur-driven luxury sedan meet & greet at arrival' },
                { name: 'Royal Buffet Dinner Upgrade', price: '₹1,500', desc: 'Chef-crafted regional tasting menu for both guests' },
                { name: 'Late Checkout Guarantee (4 PM)', price: '₹1,500', desc: 'Relax without rushing on your departure day' },
              ].map((addon) => {
                const isSelected = selectedAddons.includes(addon.name);
                return (
                  <div
                    key={addon.name}
                    onClick={() => toggleAddon(addon.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#073D36] bg-[#073D36]/5'
                        : 'border-[#EFE7DB] bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#17201E]">{addon.name}</div>
                      <div className="text-xs text-neutral-500">{addon.desc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#073D36]">{addon.price}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#073D36] border-[#073D36] text-white' : 'border-neutral-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 4: Price Summary & Discount code */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Coupon Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter Promo Code"
                  className="flex-1 p-3 rounded-xl border border-neutral-200 text-sm font-semibold uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-5 py-3 rounded-xl bg-[#073D36] text-white text-xs font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponApplied && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Coupon <strong>{couponCode}</strong> applied: Saved ₹{couponDiscount.toLocaleString('en-IN')}!</span>
                </div>
              )}

              {/* Price Breakdown Card */}
              <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Room Charge ({nights} Nights × ₹{room.price.toLocaleString('en-IN')}):</span>
                  <span className="font-semibold text-[#17201E]">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons ({selectedAddons.length} chosen):</span>
                    <span className="font-semibold text-[#17201E]">₹{addOnsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Travel Wallet / Promo Discount:</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Govt Taxes & GST (18%):</span>
                  <span className="font-semibold text-[#17201E]">₹{gst.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-[#17201E]">Total Amount Payable:</span>
                  <span className="font-serif font-bold text-2xl text-[#073D36] tabular-nums">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Gateway Simulation */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-500">Payable via Razorpay Gateway</div>
                  <div className="font-serif font-bold text-xl text-[#073D36]">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                {[
                  { id: 'upi', name: 'Instant UPI (Google Pay, PhonePe, Paytm)', desc: 'Scan QR or enter UPI ID' },
                  { id: 'card', name: 'Credit or Debit Card', desc: 'Visa, MasterCard, RuPay, Amex' },
                  { id: 'netbanking', name: 'NetBanking', desc: 'HDFC, ICICI, SBI, Axis & all major Indian banks' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-[#073D36] bg-[#073D36]/5'
                        : 'border-[#EFE7DB] bg-white'
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
                      className="accent-[#073D36] w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Booking Confirmation */}
          {step === 6 && confirmedBooking && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h4 className="font-serif font-bold text-2xl text-[#17201E]">
                  Your Stay is Confirmed!
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Confirmation voucher sent to <strong>{confirmedBooking.guestEmail}</strong>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] text-left space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#17201E]">Booking ID:</span>
                  <span className="font-mono font-bold text-[#F27658]">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hotel:</span>
                  <span className="font-semibold text-[#17201E]">{confirmedBooking.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="font-semibold text-[#17201E]">{confirmedBooking.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-semibold text-[#17201E]">{confirmedBooking.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-semibold text-[#17201E]">{confirmedBooking.checkOut} ({confirmedBooking.nights} Nights)</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-[#073D36]">₹{confirmedBooking.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-full border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors cursor-pointer"
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
                    <span>Confirming with Bank...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{finalTotal.toLocaleString('en-IN')} & Book</span>
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
