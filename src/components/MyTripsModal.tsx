import React from 'react';
import { Booking } from '../types/travel';
import { X, Calendar, MapPin, Compass, AlertCircle } from 'lucide-react';

interface MyTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
}

export const MyTripsModal: React.FC<MyTripsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#073D36]" />
            <h3 className="font-serif font-bold text-xl text-[#17201E]">
              My Trips & Bookings
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-[#17201E]">
                      {booking.hotelName}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F27658]" />
                    <span>{booking.hotelLocation}</span>
                    <span>·</span>
                    <span className="font-medium text-[#17201E]">{booking.roomName}</span>
                  </div>

                  <div className="text-xs text-neutral-600 flex items-center gap-2 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {booking.checkIn} → {booking.checkOut} ({booking.nights} Nights)
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 pt-0.5">
                    Ref ID: <strong className="font-mono text-neutral-600">{booking.id}</strong> · {booking.paymentMethod}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 gap-2">
                  <div className="text-left sm:text-right">
                    <div className="font-serif font-bold text-xl text-[#073D36] tabular-nums">
                      ₹{booking.totalPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutral-400">Total Paid</div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this booking? Free cancellation policy applies.')) {
                          onCancelBooking(booking.id);
                        }
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      Cancel stay
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Compass className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-serif font-bold text-lg text-[#17201E]">No trips planned yet</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-4">
                Explore handpicked stays across India or let our AI concierge design your journey.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
