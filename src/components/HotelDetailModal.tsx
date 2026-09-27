import React, { useState } from 'react';
import { Hotel, Room } from '../types/travel';
import { X, Star, MapPin, Check, Wifi, Sparkles, Coffee, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

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

  if (!isOpen || !hotel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-[#FAF6F0]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F27658]" />
            <span className="font-semibold text-xs tracking-wider uppercase text-[#073D36]">
              {hotel.stars} Star Luxury Stay · {hotel.city}
            </span>
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
        <div className="p-6 overflow-y-auto space-y-8">
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
            </div>

            {/* Thumbnail switcher */}
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
          </div>

          {/* Hotel Title & Key Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#F27658]" />
                <span>{hotel.location}</span>
                <span>·</span>
                <span>{hotel.distanceCentre}</span>
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#17201E]">
                {hotel.name}
              </h1>

              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 font-semibold text-[#17201E] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="tabular-nums">{hotel.rating.toFixed(1)} / 5.0</span>
                </div>
                <span className="text-neutral-500">
                  Based on {hotel.reviewCount.toLocaleString('en-IN')} verified guest reviews
                </span>
              </div>
            </div>

            {/* Price Preview */}
            <div className="text-right sm:self-center bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE7DB]">
              <div className="text-[11px] font-bold uppercase text-neutral-500">Starting from</div>
              <div className="font-serif font-bold text-3xl text-[#17201E] tabular-nums">
                ₹{hotel.pricePerNight.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-neutral-500">per night + taxes</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[#17201E] mb-2">
              The Experience
            </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-light">
              {hotel.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[#17201E] mb-3">
              Curated Amenities & Privileges
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
            <h3 className="font-serif font-bold text-xl text-[#17201E]">
              Choose Your Room
            </h3>

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

                    <button
                      onClick={() => onSelectRoomForBooking(hotel, room)}
                      className="px-6 py-2.5 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Reserve Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
