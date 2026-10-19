import React, { useState } from 'react';
import { Booking } from '../types/travel';
import { X, Calendar, MapPin, Compass, AlertCircle, Plane, Train, Bus, Hotel, Printer, Camera } from 'lucide-react';

interface MyTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: any[];
  onCancelBooking: (id: string) => void;
  onAddToAlbum?: (booking: any) => void;
}

export const MyTripsModal: React.FC<MyTripsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onAddToAlbum,
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#073D36]" />
            <div>
              <h3 className="font-serif font-bold text-xl text-[#17201E]">
                My Trips & Reservations
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                Flights, Trains, Buses & Stays across India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const serviceType = booking.serviceType || 'HOTEL';
              const isCancelled = (booking.status || '').toLowerCase() === 'cancelled';
              const isPending = (booking.status || '').toLowerCase() === 'pending';

              return (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#FAF6F0] text-[#073D36]">
                        {serviceType === 'FLIGHT' && <Plane className="w-4 h-4 text-[#F27658]" />}
                        {serviceType === 'TRAIN' && <Train className="w-4 h-4 text-[#F27658]" />}
                        {serviceType === 'BUS' && <Bus className="w-4 h-4 text-[#F27658]" />}
                        {serviceType === 'HOTEL' && <Hotel className="w-4 h-4 text-[#073D36]" />}
                      </span>

                      <span className="font-serif font-bold text-base sm:text-lg text-[#17201E]">
                        {booking.title || booking.hotelName}
                      </span>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        Official Booking
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isCancelled ? 'CANCELLED' : isPending ? 'PENDING' : 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 flex items-center gap-1.5">
                      <span>{booking.subtitle || `${booking.roomName} · ${booking.hotelLocation}`}</span>
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-2 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        {booking.checkInOrDeparture || booking.checkIn}
                        {booking.checkOutOrArrival || booking.checkOut ? ` → ${booking.checkOutOrArrival || booking.checkOut}` : ''}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-400 pt-0.5 flex flex-wrap items-center gap-2">
                      <span>Ref / PNR: <strong className="font-mono text-neutral-700">{booking.referenceCode || booking.id}</strong></span>
                      <span>·</span>
                      <span>{booking.paymentMethod || 'Razorpay Verified'}</span>
                      {booking.paymentId && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-neutral-500">Txn: {booking.paymentId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="font-serif font-bold text-xl text-[#073D36] tabular-nums">
                        ₹{(booking.totalPaid || booking.totalPrice || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Total Paid (Incl. 18% GST)
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onAddToAlbum && !isCancelled && (
                        <button
                          onClick={() => onAddToAlbum(booking)}
                          className="px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#073D36]/20 text-[11px] font-semibold text-[#073D36] hover:bg-[#EFE7DB] flex items-center gap-1 cursor-pointer"
                          title="Save memory to Travel Album"
                        >
                          <Camera className="w-3 h-3 text-[#F27658]" />
                          <span>Album</span>
                        </button>
                      )}

                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1 rounded-full border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 flex items-center gap-1 cursor-pointer"
                        title="Print E-Ticket"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this reservation? Refunds are processed back to your original payment method via Razorpay as per the property cancellation policy.')) {
                              onCancelBooking(booking.id);
                            }
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <Compass className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-serif font-bold text-lg text-[#17201E]">No trips booked yet</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-4">
                Explore handpicked stays across India, search flights, trains, or let our AI concierge design your journey.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
