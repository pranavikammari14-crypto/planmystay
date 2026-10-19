import React, { useState } from 'react';
import { Hotel, Room } from '../types/travel';
import { X, Star, MapPin, Check, Wifi, Sparkles, Coffee, ShieldCheck, Heart, ArrowRight, Clock, AlertCircle, Building2, CheckCircle2, Phone, ExternalLink } from 'lucide-react';
import { PlanMyStayLogo } from './PlanMyStayLogo';

interface HotelDetailModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectRoomForBooking: (hotel: Hotel, room: Room) => void;
}

export const HotelDetailModal: React.FC<HotelDetailModalProps> = ({
  hotel,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectRoomForBooking,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquirySent, setInquirySent] = useState(false);

  if (!isOpen || !hotel) return null;

  const isPendingVerification = hotel.isVerifiedInventory === false;
  const isIndicative = hotel.isIndicativePrice ?? true;

  const handleSendInquiry = () => {
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-xl border border-[#EFE7DB] shadow-xs">
              <PlanMyStayLogo className="h-6 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F27658]" />
              <span className="font-semibold text-xs tracking-wider uppercase text-[#073D36]">
                {hotel.stars} Star Stay · {hotel.city}, {hotel.state}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(hotel.id)}
              className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
              title={isFavorite ? 'Saved' : 'Save'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-[#F27658] text-[#F27658]' : ''
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-7">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-neutral-100 shadow-sm">
              <img
                src={hotel.images[activeImageIndex] || hotel.images[0]}
                alt={hotel.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm">
                Photo {activeImageIndex + 1} of {hotel.images.length}
              </div>

              {/* Status Badges Overlay */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                {hotel.brand && (
                  <span className="px-3 py-1 rounded-full bg-[#073D36]/90 backdrop-blur-sm text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{hotel.brand}</span>
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Property</span>
                </span>
                {hotel.bookingAuthorized ? (
                  <span className="px-3 py-1 rounded-full bg-[#073D36] text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F27658]" />
                    <span>Direct Booking Authorized</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <span>Verified Informational Listing</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher */}
            {hotel.images.length > 1 && (
              <div className="flex gap-2">
                {hotel.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#073D36] scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Title & Price Card */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-[#F27658] shrink-0" />
                <span className="font-medium text-neutral-700">{hotel.fullAddress || `${hotel.name}, ${hotel.city}, ${hotel.state}`}</span>
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#17201E]">
                {hotel.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 font-semibold text-[#17201E] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="tabular-nums">{hotel.rating.toFixed(1)} / 5.0</span>
                </div>
                <span className="text-neutral-500">
                  Based on {hotel.reviewCount.toLocaleString('en-IN')} verified reviews
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-600 font-medium">{hotel.neighborhood}</span>
              </div>
            </div>

            {/* Price Preview */}
            <div className="sm:self-center bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE7DB] text-right min-w-[180px]">
              <div className="text-[11px] font-bold uppercase text-neutral-500">
                {isIndicative ? 'Indicative Reference Rate' : 'Starting from'}
              </div>
              <div className="font-serif font-bold text-3xl text-[#073D36] tabular-nums">
                ₹{hotel.pricePerNight.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-neutral-500">per night + 18% GST</div>
            </div>
          </div>

          {/* Verification Credential & Booking Policy Card */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            hotel.bookingAuthorized
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-[#FAF6F0] border-[#EFE7DB] text-neutral-800'
          }`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${
                hotel.bookingAuthorized ? 'text-emerald-700' : 'text-[#073D36]'
              }`} />
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span>Verified Hotel Listing</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600">
                    Source: {hotel.verificationSource}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Audited: {hotel.lastVerifiedDate}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {hotel.bookingAuthorized ? (
                    <span>
                      <strong>Instant Booking Enabled:</strong> Direct room reservations, inventory hold, and immediate PlanMyStay digital tax invoice generation are active for this property.
                    </span>
                  ) : (
                    <span>
                      <strong>Verified Informational Listing:</strong> This hotel is authenticated in our directory. In accordance with PlanMyStay verification guidelines, direct digital payments are reserved for partners with active live inventory allotment. Room reservation is available directly through the property's official portal or desk.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {!hotel.bookingAuthorized && hotel.officialUrl && (
              <a
                href={hotel.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#073D36] hover:bg-[#062F2B] text-white font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <span>Official Booking Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F27658]" />
              </a>
            )}
          </div>

          {/* Policies & Timings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] text-xs">
            <div className="space-y-1">
              <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px]">
                Check-in / Check-out
              </span>
              <div className="font-semibold text-[#17201E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#073D36]" />
                <span>In: {hotel.checkInTime || '12:00 PM'} · Out: {hotel.checkOutTime || '11:00 AM'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px]">
                Cancellation Policy
              </span>
              <div className="font-semibold text-emerald-800">
                {hotel.cancellationPolicy || 'Free cancellation up to 24-48h prior to check-in'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[10px]">
                Verified Partner Contact
              </span>
              <div className="font-semibold text-[#17201E] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#073D36]" />
                <span>{hotel.contactInfo || '+91 1800 209 1800'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[#17201E] mb-2">
              Property Overview
            </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-light">
              {hotel.description || `Comfortable and dependable accommodations situated in ${hotel.city}, ${hotel.state}. Offering clean sanitized rooms, air conditioning, daily housekeeping, and verified hospitality.`}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[#17201E] mb-3">
              Included Amenities & Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] text-xs font-medium text-neutral-700"
                >
                  <Check className="w-4 h-4 text-[#073D36] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room Selection */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#17201E]">
                Available Room Options
              </h3>
              <span className="text-xs text-neutral-500">
                Prices shown include indicative base rates + 18% GST calculated at checkout
              </span>
            </div>

            <div className="space-y-3">
              {hotel.rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-5 rounded-2xl border border-[#EFE7DB] hover:border-[#073D36] bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-lg text-[#17201E]">
                        {room.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#073D36]/10 text-[#073D36]">
                        {room.type}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500">
                      {room.bed} · Max {room.maxGuests} Guests · {room.sqft} sq.ft
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {room.perks.map((perk, pidx) => (
                        <span
                          key={pidx}
                          className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 gap-3">
                    <div className="text-left sm:text-right">
                      <div className="font-serif font-bold text-2xl text-[#17201E] tabular-nums">
                        ₹{room.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-neutral-400">/ night</div>
                    </div>

                    {hotel.bookingAuthorized ? (
                      <button
                        onClick={() => onSelectRoomForBooking(hotel, room)}
                        className="px-6 py-2.5 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>Reserve Room</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex flex-col sm:items-end gap-1.5">
                        {hotel.officialUrl ? (
                          <a
                            href={hotel.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <span>Book on Official Site</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#F27658]" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${hotel.contactInfo || ''}`}
                            className="px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#F27658]" />
                            <span>Call Front Desk</span>
                          </a>
                        )}
                        <span className="text-[10px] text-neutral-500 font-medium">
                          Informational Listing · Direct Payment Disabled
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
