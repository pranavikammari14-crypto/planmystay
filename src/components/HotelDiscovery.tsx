import React, { useState, useMemo } from 'react';
import { Hotel } from '../types/travel';
import { HotelCard } from './HotelCard';
import { Search, SlidersHorizontal, X, Check, Building2, CheckCircle2, Sparkles, Filter, LayoutGrid, List, Star, Heart, MapPin } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters state
  const [maxPrice, setMaxPrice] = useState(35000);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('All');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'under3k' | 'treebo' | 'ibis' | 'ginger' | 'luxury'>('all');

  // Extract unique cities & brands from strictly verified hotels
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    hotels
      .filter((h) => h.verificationStatus === 'Verified')
      .forEach((h) => {
        if (h.city) set.add(h.city.trim());
      });
    return Array.from(set).sort();
  }, [hotels]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    hotels
      .filter((h) => h.verificationStatus === 'Verified')
      .forEach((h) => {
        if (h.brand) set.add(h.brand.trim());
      });
    return Array.from(set).sort();
  }, [hotels]);

  const popularAmenities = ['Free High-Speed Wi-Fi', 'Complimentary Breakfast', 'Air Conditioning', 'Outdoor Pool', 'Spa', 'Fine Dining'];

  // Filter & sort logic
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // STRICT COMPLIANCE: Pending, unverified, rejected, temporarily unavailable, and inactive hotels are excluded from public search
        if (hotel.verificationStatus !== 'Verified') {
          return false;
        }

        // Quick Filters
        if (quickFilter === 'under3k' && hotel.pricePerNight > 3000) return false;
        if (quickFilter === 'treebo' && !hotel.brand?.toLowerCase().includes('treebo') && !hotel.name.toLowerCase().includes('treebo')) return false;
        if (quickFilter === 'ibis' && !hotel.brand?.toLowerCase().includes('ibis') && !hotel.name.toLowerCase().includes('ibis')) return false;
        if (quickFilter === 'ginger' && !hotel.brand?.toLowerCase().includes('ginger') && !hotel.name.toLowerCase().includes('ginger')) return false;
        if (quickFilter === 'luxury' && hotel.pricePerNight < 5000) return false;

        // Search term (name, city, state, brand, neighborhood)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            hotel.name.toLowerCase().includes(q) ||
            hotel.city.toLowerCase().includes(q) ||
            hotel.state.toLowerCase().includes(q) ||
            hotel.location.toLowerCase().includes(q) ||
            (hotel.brand && hotel.brand.toLowerCase().includes(q)) ||
            hotel.neighborhood.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // City
        if (selectedCity !== 'All' && hotel.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }

        // Brand
        if (selectedBrand !== 'All') {
          if (!hotel.brand || !hotel.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
            return false;
          }
        }

        // Verified inventory only
        if (onlyVerified && hotel.isVerifiedInventory === false) {
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
          const hasAmenity = hotel.amenities?.some((a) =>
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
        // Recommended: verified inventory and picks first
        if (a.isPick && !b.isPick) return -1;
        if (!a.isPick && b.isPick) return 1;
        return b.rating - a.rating;
      });
  }, [
    hotels,
    searchQuery,
    quickFilter,
    selectedCity,
    selectedBrand,
    onlyVerified,
    maxPrice,
    selectedStars,
    onlyBreakfast,
    selectedAmenity,
    selectedSort,
  ]);

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
    setSelectedBrand('All');
    setSelectedAmenity('All');
    setOnlyVerified(false);
    setQuickFilter('all');
    setSearchQuery('');
  };

  const lowestPrice = useMemo(() => {
    if (hotels.length === 0) return 1400;
    return Math.min(...hotels.map((h) => h.pricePerNight));
  }, [hotels]);

  return (
    <section id="hotels" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="max-w-3xl mb-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <div className="flex items-center gap-2 text-[#17201E]/60 text-xs uppercase font-semibold tracking-widest">
              <span className="w-5 h-[2px] bg-[#F27658] inline-block" />
              <span>AFFORDABLE & CURATED STAYS ACROSS INDIA</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-[11px] font-semibold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Directory</span>
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#17201E] tracking-tight leading-[1.12] mb-4">
            Sleep well. <br />
            <span className="italic font-normal text-[#F27658]">Wake inspired.</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed mb-6">
            From budget-friendly city stays starting at ₹{lowestPrice.toLocaleString('en-IN')}/night across Hyderabad, Bengaluru, Mumbai, Pune, and Chennai, to heritage retreats in Rajasthan and tranquil backwaters in Kerala.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-8 sm:gap-12 pt-2 pb-6 border-b border-neutral-100">
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-emerald-800 tabular-nums flex items-center gap-1.5">
                <span>{hotels.filter((h) => h.verificationStatus === 'Verified').length}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-light mt-0.5">
                Verified properties
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#073D36] tabular-nums">
                ₹{lowestPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-light mt-0.5">
                Starting indicative rate
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17201E] tabular-nums">
                {availableCities.length}+
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-light mt-0.5">
                Destinations covered
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {[
            { id: 'all', label: 'All Stays' },
            { id: 'under3k', label: '⚡ Under ₹3,000 / night' },
            { id: 'treebo', label: 'Treebo Hotels' },
            { id: 'ibis', label: 'ibis Accor' },
            { id: 'ginger', label: 'Ginger (Tata IHCL)' },
            { id: 'luxury', label: 'Luxury & Heritage' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setQuickFilter(chip.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                quickFilter === chip.id
                  ? 'bg-[#073D36] text-white shadow-sm'
                  : 'bg-[#FAF6F0] text-neutral-700 hover:bg-neutral-200/70 border border-[#EFE7DB]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hotel name, city (e.g. Hyderabad, Mumbai, Bengaluru), state, or brand..."
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

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="px-6 py-3.5 rounded-2xl bg-[#073D36] hover:bg-[#062F2B] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>More Filters</span>
              {(selectedStars.length > 0 ||
                onlyBreakfast ||
                selectedCity !== 'All' ||
                selectedBrand !== 'All' ||
                onlyVerified ||
                maxPrice < 35000) && <span className="w-2 h-2 rounded-full bg-[#F27658]" />}
            </button>
          </div>

          {/* Sub bar: Count and Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-neutral-500 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Showing{' '}
                <span className="font-semibold text-[#17201E] tabular-nums">
                  {filteredHotels.length}
                </span>{' '}
                of <span className="tabular-nums">{hotels.length}</span> properties
                {selectedCity !== 'All' && <span> in <strong>{selectedCity}</strong></span>}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Stays</span>
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* View Toggle */}
              <div className="flex items-center bg-[#FAF6F0] p-1 rounded-xl border border-[#EFE7DB]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-2xs text-[#073D36] font-semibold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  aria-label="Grid View"
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white shadow-2xs text-[#073D36] font-semibold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  aria-label="List View"
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Sort by</span>
                <select
                  value={selectedSort}
                  onChange={(e: any) => setSelectedSort(e.target.value)}
                  className="bg-transparent font-semibold text-[#17201E] focus:outline-none border-b border-neutral-300 pb-0.5 cursor-pointer text-xs sm:text-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Grid / List */}
        {filteredHotels.length > 0 ? (
          viewMode === 'grid' ? (
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
            <div className="space-y-4">
              {filteredHotels.map((hotel) => {
                const isFavorite = favorites.includes(hotel.id);
                return (
                  <div
                    key={hotel.id}
                    onClick={() => onViewStay(hotel)}
                    className="bg-white rounded-3xl border border-[#EFE7DB] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-stretch cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-64 md:h-44 shrink-0 rounded-2xl overflow-hidden bg-neutral-100">
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(hotel.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            isFavorite ? 'fill-[#F27658] text-[#F27658]' : 'text-neutral-600 hover:text-[#F27658]'
                          }`}
                        />
                      </button>
                      {hotel.brand && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#073D36]/90 backdrop-blur-sm text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{hotel.brand}</span>
                        </span>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Title and Visual Verified Badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-serif font-bold text-xl text-[#17201E] group-hover:text-[#073D36] transition-colors">
                            {hotel.name}
                          </h3>
                          {hotel.verificationStatus === 'Verified' && (
                            <span
                              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold shadow-2xs"
                              title="Verified by PlanMyStay - Authentic Indian Hospitality"
                            >
                              <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>

                        {/* Location & Star */}
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#F27658]" />
                            <span>{hotel.city}, {hotel.state}</span>
                          </span>
                          <span>•</span>
                          <span>{hotel.distanceCentre}</span>
                          <span>•</span>
                          <span>{hotel.stars} Star</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 text-xs mb-3">
                          <div className="flex items-center gap-1 font-semibold text-[#17201E]">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{hotel.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-neutral-400">({hotel.reviewCount} verified reviews)</span>
                        </div>

                        {/* Amenities pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {hotel.amenities.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              className="px-2 py-0.5 rounded-md bg-[#FAF6F0] border border-[#EFE7DB] text-neutral-600 text-[10px] font-medium"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-3">
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          <span>Guaranteed Genuine Listing</span>
                        </span>
                        {hotel.bookingAuthorized ? (
                          <span className="text-[11px] font-bold text-[#073D36]">Direct Booking Authorized</span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-600">Informational Listing</span>
                        )}
                      </div>
                    </div>

                    {/* Right Price & CTA */}
                    <div className="md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-neutral-100 pt-3 md:pt-0 md:pl-5">
                      <div>
                        <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Per Night</div>
                        <div className="font-serif font-bold text-2xl text-[#073D36] tabular-nums">
                          ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-neutral-400">+ taxes & fees</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewStay(hotel);
                        }}
                        className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold transition-all mt-3 cursor-pointer shadow-xs"
                      >
                        {hotel.bookingAuthorized ? 'Book Stay' : 'View Details'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="py-20 text-center rounded-3xl bg-[#FAF6F0] border border-[#EFE7DB] p-8">
            <h3 className="font-serif font-bold text-2xl text-[#17201E] mb-2">
              No stays match your filters
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
              Try broadening your budget range, clearing search keywords, or selecting "All Cities".
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
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#073D36]" />
                <h3 className="font-serif font-bold text-xl text-[#17201E]">
                  Filter Accommodations
                </h3>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Destination Filter */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Destination / City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36] cursor-pointer"
                >
                  <option value="All">All Cities Across India ({availableCities.length} destinations)</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Hotel Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36] cursor-pointer"
                >
                  <option value="All">All Brands & Independent Hotels</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Max Price Per Night
                  </label>
                  <span className="font-semibold text-sm text-[#073D36] tabular-nums">
                    Up to ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={1200}
                  max={35000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#073D36] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                  <span>₹1,200</span>
                  <span>₹15,000</span>
                  <span>₹35,000+</span>
                </div>
              </div>

              {/* Verified Inventory Only Toggle */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#17201E]">
                    Verified Properties Only
                  </div>
                  <div className="text-xs text-neutral-500">
                    Show only hotels with confirmed inventory
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#073D36]"></div>
                </label>
              </div>

              {/* Breakfast Included Toggle */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#17201E]">
                    Breakfast Included
                  </div>
                  <div className="text-xs text-neutral-500">
                    Properties with complimentary morning dining
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
                          ? 'border-[#073D36] bg-[#073D36]/10 text-[#073D36] font-semibold'
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
