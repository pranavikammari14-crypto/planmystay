import React, { useState } from 'react';
import { Hotel, Booking } from '../types/travel';
import { ShieldCheck, X, Plus, Edit2, Trash2, CheckCircle, TrendingUp, Users, Hotel as HotelIcon, Sparkles } from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotels: Hotel[];
  bookings: Booking[];
  onAddHotel: (hotel: Partial<Hotel>) => void;
  onDeleteHotel: (id: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  hotels,
  bookings,
  onAddHotel,
  onDeleteHotel,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'hotels' | 'bookings' | 'ai'>('analytics');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Hotel Form State
  const [newHotelName, setNewHotelName] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newState, setNewState] = useState('Telangana');
  const [newPrice, setNewPrice] = useState(8500);
  const [newStars, setNewStars] = useState(5);
  const [newBreakfast, setNewBreakfast] = useState(true);
  const [newDescription, setNewDescription] = useState('');

  if (!isOpen) return null;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? b.totalPrice : 0), 0);

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim()) return;

    onAddHotel({
      name: newHotelName,
      city: newCity,
      state: newState,
      location: `${newCity}, ${newState}`,
      pricePerNight: Number(newPrice),
      stars: Number(newStars),
      rating: 4.8,
      reviewCount: 42,
      breakfastIncluded: newBreakfast,
      description: newDescription || 'Curated luxury stay in the heart of ' + newCity,
      distanceCentre: '1.2 km from centre',
      neighborhood: 'Central ' + newCity,
      amenities: ['Outdoor Pool', 'Gourmet Restaurant', 'Wellness Spa', 'Free High-speed Wi-Fi', 'Valet Parking'],
      rooms: [
        { id: `r-${Date.now()}-1`, name: 'Deluxe Heritage Room', type: 'Deluxe', price: Number(newPrice), bed: '1 King Bed', maxGuests: 2, sqft: 420, perks: ['Free Breakfast', 'Wi-Fi'] },
      ],
    });

    setShowAddForm(false);
    setNewHotelName('');
    setNewDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#073D36] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F27658]" />
            <div>
              <h3 className="font-serif font-bold text-xl text-white">
                PlanMyStay Administration Hub
              </h3>
              <p className="text-[11px] text-[#EFE7DB]/80 font-light">
                Founder & Executive Dashboard · Alluri Vijaya Priya (ADMIN)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EFE7DB] bg-white px-6">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'hotels'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Manage Stays ({hotels.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Guest Reservations ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            AI Concierge Logs
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm">
                  <div className="text-xs text-neutral-500 font-medium">Gross Bookings</div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-[#073D36] mt-1 tabular-nums">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">↑ 18.4% this month</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm">
                  <div className="text-xs text-neutral-500 font-medium">Curated Stays</div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-1 tabular-nums">
                    {hotels.length}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">Across 12 Indian states</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm">
                  <div className="text-xs text-neutral-500 font-medium">Active Bookings</div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-[#17201E] mt-1 tabular-nums">
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">100% verified guests</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm">
                  <div className="text-xs text-neutral-500 font-medium">AI Trip Queries</div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-[#F27658] mt-1 tabular-nums">
                    142
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">Gemini 3.8 Flash active</div>
                </div>
              </div>

              {/* Recent Bookings in Analytics */}
              <div className="bg-white p-5 rounded-2xl border border-[#EFE7DB]">
                <h4 className="font-serif font-bold text-base text-[#17201E] mb-3">
                  Recent Guest Bookings
                </h4>
                <div className="divide-y divide-neutral-100 text-xs">
                  {bookings.map((b) => (
                    <div key={b.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#17201E]">{b.guestName}</div>
                        <div className="text-neutral-500">{b.hotelName} · {b.roomName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#073D36]">₹{b.totalPrice.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-neutral-400">{b.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HOTELS MANAGEMENT */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-serif font-bold text-lg text-[#17201E]">
                  Curated Inventory ({hotels.length} Properties)
                </h4>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Stay</span>
                </button>
              </div>

              {/* Add Hotel Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateHotel}
                  className="p-5 rounded-2xl bg-white border border-[#073D36]/30 shadow-md space-y-3"
                >
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#073D36]">
                    New Hotel Details
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Hotel Name (e.g. The Leela Palace Bengaluru)"
                      value={newHotelName}
                      onChange={(e) => setNewHotelName(e.target.value)}
                      className="p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none"
                      required
                    />

                    <input
                      type="text"
                      placeholder="City (e.g. Bengaluru)"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none"
                      required
                    />

                    <input
                      type="number"
                      placeholder="Price per night (₹)"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none"
                      required
                    />

                    <select
                      value={newStars}
                      onChange={(e) => setNewStars(Number(e.target.value))}
                      className="p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value={5}>5 Star Luxury</option>
                      <option value={4}>4 Star Boutique</option>
                      <option value={3}>3 Star Heritage</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Short description of the property experience..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#F27658] text-white text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      Save to Directory
                    </button>
                  </div>
                </form>
              )}

              {/* Hotel List */}
              <div className="space-y-2">
                {hotels.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#17201E]">{h.name}</div>
                      <div className="text-neutral-500">
                        {h.location} · {h.stars} Stars · ₹{h.pricePerNight.toLocaleString('en-IN')}/night
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteHotel(h.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete stay"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESERVATIONS */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-lg text-[#17201E]">
                All Guest Reservations
              </h4>
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-[#EFE7DB] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#17201E]">
                        {b.guestName} ({b.id})
                      </div>
                      <div className="text-neutral-600">
                        {b.hotelName} — {b.roomName}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {b.checkIn} to {b.checkOut} ({b.nights} nights) · {b.guestEmail} · {b.guestPhone}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-[#073D36] text-sm">
                        ₹{b.totalPrice.toLocaleString('en-IN')}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI LOGS */}
          {activeTab === 'ai' && (
            <div className="bg-white p-5 rounded-2xl border border-[#EFE7DB] space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#073D36] font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#F27658]" />
                <span>Gemini API Integration Status: Healthy</span>
              </div>
              <p className="text-neutral-500 font-light">
                Model: <strong>gemini-3.8-flash</strong> · User-Agent: <strong className="font-mono">aistudio-build</strong> · Latency: ~820ms
              </p>
              <div className="p-3 rounded-xl bg-[#FAF6F0] font-mono text-[11px] text-neutral-700 space-y-1">
                <div>[POST /api/ai/trip-plan] Destination: Kerala · Travellers: 2 · Status: 200 OK</div>
                <div>[POST /api/ai/trip-plan] Destination: Udaipur · Travellers: 2 · Status: 200 OK</div>
                <div>[POST /api/ai/trip-plan] Destination: Hyderabad · Travellers: 1 · Status: 200 OK</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
