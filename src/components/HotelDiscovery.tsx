import React, { useState, useMemo } from 'react';
import { Hotel } from '../types/travel';
import { HotelCard } from './HotelCard';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { INDIAN_CITIES } from '../data/travelOptions';

interface HotelDiscoveryProps {
  hotels: Hotel[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewStay: (hotel: Hotel) => void;
  initialSearchQuery?: string;
}

export const HotelDiscovery: React.FC<HotelDiscoveryProps> = ({
  hotels,
  favorites,
  onToggleFavorite,
  onViewStay,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Filters state
  const [maxPrice, setMaxPrice] = useState(35000);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('All');

  const popularAmenities = ['Outdoor Pool', 'Spa', 'Fine Dining', 'Free High-speed Wi-Fi', 'Valet Parking'];

  // Filter & sort logic
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // Search term
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            hotel.name.toLowerCase().includes(q) ||
            hotel.city.toLowerCase().includes(q) ||
            hotel.location.toLowerCase().includes(q) ||
            hotel.neighborhood.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // City
        if (selectedCity !== 'All' && hotel.city !== selectedCity) {
          return false;
        }

        // Max price
        if (hotel.pricePerNight > maxPrice) {
          return false;
        }

        // Stars
        if (selectedStars.length > 0 && !selectedStars.includes(hotel.stars)) {
          return false;
        }

        // Breakfast
        if (onlyBreakfast && !hotel.breakfastIncluded) {
          return false;
        }

        // Amenity
        if (selectedAmenity !== 'All') {
          const hasAmenity = hotel.amenities.some((a) =>
            a.toLowerCase().includes(selectedAmenity.toLowerCase())
          );
          if (!hasAmenity) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'price-asc') return a.pricePerNight - b.pricePerNight;
        if (selectedSort === 'price-desc') return b.pricePerNight - a.pricePerNight;
        if (selectedSort === 'rating') return b.rating - a.rating;
        // Recommended: picks first, then rating
        if (a.isPick && !b.isPick) return -1;
        if (!a.isPick && b.isPick) return 1;
        return b.rating - a.rating;
      });
  }, [hotels, searchQuery, selectedCity, maxPrice, selectedStars, onlyBreakfast, selectedAmenity, selectedSort]);

  const toggleStarFilter = (star: number) => {
    if (selectedStars.includes(star)) {
      setSelectedStars(selectedStars.filter((s) => s !== star));
    } else {
      setSelectedStars([...selectedStars, star]);
    }
  };

  const resetFilters = () => {
    setMaxPrice(35000);
    setSelectedStars([]);
    setOnlyBreakfast(false);
    setSelectedCity('All');
    setSelectedAmenity('All');
    setSearchQuery('');
  };

  return (
    <section id="hotels" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block matching video */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3 text-[#17201E]/60 text-xs uppercase font-semibold tracking-widest">
            <span className="w-5 h-[2px] bg-[#F27658] inline-block" />
            <span>PLACES WORTH STAYING</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#17201E] tracking-tight leading-[1.12] mb-4">
            Sleep well. <br />
            <span className="italic font-normal text-[#F27658]">Wake inspired.</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed mb-8">
            From rooftop mornings in Mumbai to quiet palaces in Udaipur — every stay is chosen for how it makes you feel.
          </p>

          {/* Stats matching video */}
          <div className="flex items-center gap-12 pt-2 pb-6 border-b border-neutral-100">
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17201E] tabular-nums">
                50
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-light mt-0.5">
                featured Indian stays
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17201E] tabular-nums">
                4.7
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-light mt-0.5">
                average guest rating
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar matching reference video */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a hotel, city or landmark"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#EFE7DB] bg-[#FAF6F0]/40 text-sm font-medium text-[#17201E] placeholder:text-neutral-400 focus:outline-none focus:border-[#073D36] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button matching video */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="px-6 py-3.5 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {(selectedStars.length > 0 || onlyBreakfast || selectedCity !== 'All' || maxPrice < 35000) && (
                <span className="w-2 h-2 rounded-full bg-[#F27658]" />
              )}
            </button>
          </div>

          {/* Sub bar: Count and Sort Dropdown matching the video */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-neutral-500 pt-2">
            <div>
              <span className="font-semibold text-[#17201E] tabular-nums">
                {filteredHotels.length}
              </span>{' '}
              of{' '}
              <span className="tabular-nums">{hotels.length}</span> featured stays
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span>Sort by</span>
              <select
                value={selectedSort}
                onChange={(e: any) => setSelectedSort(e.target.value)}
                className="bg-transparent font-semibold text-[#17201E] focus:outline-none border-b border-neutral-300 pb-0.5 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hotel Grid */}
        {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isFavorite={favorites.includes(hotel.id)}
                onToggleFavorite={onToggleFavorite}
                onViewStay={onViewStay}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-[#FAF6F0] border border-[#EFE7DB] p-8">
            <h3 className="font-serif font-bold text-2xl text-[#17201E] mb-2">
              No stays match your filters
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
              Try adjusting your price range, clearing city criteria, or searching for broader destinations.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal / Drawer */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#073D36]" />
                <h3 className="font-serif font-bold text-xl text-[#17201E]">
                  Filter Stays
                </h3>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Destination Filter */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Destination / City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                >
                  <option value="All">All Cities across India</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Max Price Per Night
                  </label>
                  <span className="font-semibold text-sm text-[#17201E] tabular-nums">
                    Up to ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={35000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#F27658] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                  <span>₹5,000</span>
                  <span>₹35,000+</span>
                </div>
              </div>

              {/* Hotel Stars */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Hotel Category
                </label>
                <div className="flex gap-3">
                  {[5, 4, 3].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => toggleStarFilter(star)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedStars.includes(star)
                          ? 'border-[#073D36] bg-[#073D36] text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {star} Star
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakfast Included Toggle */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#17201E]">
                    Breakfast Included
                  </div>
                  <div className="text-xs text-neutral-500">
                    Show only properties with complimentary morning dining
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyBreakfast}
                    onChange={(e) => setOnlyBreakfast(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#073D36]"></div>
                </label>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Key Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...popularAmenities].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => setSelectedAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        selectedAmenity === amenity
                          ? 'border-[#073D36] bg-[#073D36]/10 text-[#073D36]'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100 bg-[#FAF6F0] flex items-center justify-between gap-3">
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
              >
                Reset filters
              </button>

              <button
                onClick={() => setShowFilterDrawer(false)}
                className="px-6 py-2.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors cursor-pointer"
              >
                Show {filteredHotels.length} Stays
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
