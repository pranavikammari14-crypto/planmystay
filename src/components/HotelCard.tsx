import React from 'react';
import { Hotel } from '../types/travel';
import { Star, Heart, CheckCircle2, Check, AlertCircle, Building2 } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  isFavorite: boolean;
  onToggleFavorite: (hotelId: string) => void;
  onViewStay: (hotel: Hotel) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  isFavorite,
  onToggleFavorite,
  onViewStay,
}) => {
  const isPendingVerification = hotel.isVerifiedInventory === false;
  const isIndicative = hotel.isIndicativePrice ?? true;

  return (
    <div className="bg-white rounded-3xl border border-[#EFE7DB] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
            {hotel.isPick && (
              <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] sm:text-[11px] font-bold text-[#073D36] shadow-sm">
                PlanMyStay Pick
              </span>
            )}
            {hotel.brand && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#073D36]/90 backdrop-blur-sm text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{hotel.brand}</span>
              </span>
            )}
          </div>

          {/* Verification Status Pill & Booking Authorization */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {hotel.verificationStatus === 'Verified' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/95 text-white text-[10px] font-bold backdrop-blur-sm shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified</span>
              </span>
            )}

            {hotel.bookingAuthorized ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#073D36]/90 text-white text-[10px] font-bold backdrop-blur-sm shadow flex items-center gap-1">
                <span>Direct Booking</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/90 text-white text-[10px] font-bold backdrop-blur-sm shadow flex items-center gap-1">
                <span>Informational Listing</span>
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(hotel.id);
            }}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'fill-[#F27658] text-[#F27658]'
                  : 'text-neutral-600 hover:text-[#F27658]'
              }`}
            />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-6 pb-2">
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-semibold text-neutral-700 truncate mr-2">
              {hotel.city}, {hotel.state}
            </span>
            <div className="flex items-center gap-1 font-semibold text-[#17201E] shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{hotel.rating.toFixed(1)}</span>
              <span className="text-[11px] text-neutral-400 font-normal">({hotel.reviewCount})</span>
            </div>
          </div>

          {/* Hotel Name & Visual Verified Badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E] tracking-tight group-hover:text-[#073D36] transition-colors leading-snug">
              {hotel.name}
            </h3>
            {hotel.verificationStatus === 'Verified' && (
              <span
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold mt-0.5 shadow-2xs"
                title="Verified by PlanMyStay - Authentic Indian Hospitality"
              >
                <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Category & Distance */}
          <div className="text-xs text-neutral-500 font-light mb-3">
            {hotel.stars} Star · {hotel.distanceCentre}
          </div>
        </div>
      </div>

      {/* Price & Action Button Footer */}
      <div className="p-5 sm:p-6 pt-3 border-t border-neutral-100 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#17201E] tabular-nums">
              ₹{hotel.pricePerNight.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-neutral-500 font-normal">/ night</span>
          </div>

          <div className="text-[10px] sm:text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {isIndicative ? 'Indicative reference price' : 'Confirmed live rate'}
          </div>

          <div className="text-xs font-medium text-neutral-500 mt-0.5">
            {hotel.breakfastIncluded ? 'Breakfast included' : 'Room only'}
          </div>
        </div>

        <button
          onClick={() => onViewStay(hotel)}
          className={`px-4 sm:px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap ${
            isPendingVerification
              ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
              : 'bg-[#073D36] hover:bg-[#062F2B] active:scale-95 text-white'
          }`}
        >
          {isPendingVerification ? 'View Details' : 'View Stay'}
        </button>
      </div>
    </div>
  );
};
