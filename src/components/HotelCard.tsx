import React from 'react';
import { Hotel } from '../types/travel';
import { Star, Heart } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-3xl border border-[#EFE7DB] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-100">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* PlanMyStay Pick Badge */}
        {hotel.isPick && (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-[#073D36] shadow-sm">
            PlanMyStay pick
          </div>
        )}

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
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Location & Star Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-medium text-neutral-600 truncate mr-2">
              {hotel.location}
            </span>
            <div className="flex items-center gap-1 font-semibold text-[#17201E] shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{hotel.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Hotel Name */}
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E] tracking-tight mb-1 group-hover:text-[#073D36] transition-colors">
            {hotel.name}
          </h3>

          {/* Category & Distance */}
          <div className="text-xs text-neutral-500 font-light mb-4">
            {hotel.stars} star hotel · {hotel.distanceCentre}
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-neutral-100 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#17201E] tabular-nums">
                ₹{hotel.pricePerNight.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-500 font-normal">/ night</span>
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              {hotel.breakfastIncluded ? 'Breakfast included' : 'Room only'}
            </div>
          </div>

          <button
            onClick={() => onViewStay(hotel)}
            className="px-5 py-2.5 rounded-full bg-[#073D36] hover:bg-[#062F2B] active:scale-95 text-white font-medium text-xs sm:text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            View stay
          </button>
        </div>
      </div>
    </div>
  );
};
