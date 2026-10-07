import React, { useState } from 'react';
import { Hotel, Room, Booking, UserProfile } from '../types/travel';
import {
  X,
  Hotel as HotelIcon,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Bed,
  MapPin,
  Calendar,
  Users,
  ShieldAlert,
  IndianRupee,
  Layers,
  Sparkles
} from 'lucide-react';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  hotels: Hotel[];
  bookings: Booking[];
  onAddHotel: (hotel: Partial<Hotel>) => void;
  onDeleteHotel: (id: string) => void;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  hotels,
  bookings,
  onAddHotel,
  onDeleteHotel,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'rooms' | 'bookings'>('properties');
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotels[0]?.id || '');

  // Add Room form state
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('Deluxe');
  const [roomPrice, setRoomPrice] = useState(7500);
  const [roomBed, setRoomBed] = useState('1 King Bed');
  const [roomMaxGuests, setRoomMaxGuests] = useState(2);
  const [roomSqft, setRoomSqft] = useState(420);

  // New Hotel Form State
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newCity, setNewCity] = useState('Jaipur');
  const [newState, setNewState] = useState('Rajasthan');
  const [newPrice, setNewPrice] = useState(8500);
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen || !user) return null;

  // Authorization check
  const isAuthorizedOwner = user.role === 'OWNER' || user.role === 'ADMIN';

  if (!isAuthorizedOwner) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="font-serif font-bold text-xl text-neutral-800">
            Access Restricted: Owner Portal
          </h3>
          <p className="text-xs text-neutral-500">
            This dashboard is reserved for verified Hotel Property Owners. Your current account role is <strong>{user.role}</strong>.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#073D36] text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter hotels owned by this owner (or all for Admin)
  const ownerHotels = hotels;
  const currentHotel = ownerHotels.find((h) => h.id === selectedHotelId) || ownerHotels[0];

  // Filter bookings for this property
  const propertyBookings = bookings.filter((b) => b.hotelId === currentHotel?.id || b.hotelName === currentHotel?.name);

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim()) return;

    onAddHotel({
      name: newHotelName,
      city: newCity,
      state: newState,
      location: `${newCity}, ${newState}`,
      pricePerNight: Number(newPrice),
      stars: 5,
      rating: 4.8,
      reviewCount: 12,
      breakfastIncluded: true,
      description: newDesc || `Luxury boutique stay in ${newCity}.`,
      distanceCentre: '1.5 km from centre',
      neighborhood: 'Central ' + newCity,
      amenities: ['Fine Dining', 'Pool', 'High-speed Wi-Fi', 'Heritage Courtyard', 'Chauffeur Pick-up'],
      rooms: [
        {
          id: `r-${Date.now()}`,
          name: 'Executive Deluxe Suite',
          type: 'Deluxe',
          price: Number(newPrice),
          bed: '1 King Bed',
          maxGuests: 2,
          sqft: 450,
          perks: ['Free Gourmet Breakfast', 'Express Check-in'],
        },
      ],
    });

    setShowAddHotel(false);
    setNewHotelName('');
    setNewDesc('');
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHotel || !roomName) return;

    const newRoom: Room = {
      id: `r-${Date.now()}`,
      name: roomName,
      type: roomType,
      price: Number(roomPrice),
      bed: roomBed,
      maxGuests: Number(roomMaxGuests),
      sqft: Number(roomSqft),
      perks: ['Free Breakfast', 'Wi-Fi'],
    };

    currentHotel.rooms.push(newRoom);
    setShowAddRoom(false);
    setRoomName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HotelIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">
                  Hotel Owner Portal
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase">
                  Verified Property Partner
                </span>
              </div>
              <p className="text-xs text-amber-200/70 font-light">
                Manage your stays, room inventory, availability & guest reservations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EFE7DB] bg-white px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'properties'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <HotelIcon className="w-3.5 h-3.5" />
            <span>My Properties ({ownerHotels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rooms'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Room Inventory & Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Guest Reservations ({propertyBookings.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-lg text-[#17201E]">
                  Your Listed Stays
                </h4>
                <button
                  onClick={() => setShowAddHotel(true)}
                  className="px-4 py-2 rounded-full bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>List New Property</span>
                </button>
              </div>

              {/* Add Hotel Form */}
              {showAddHotel && (
                <form onSubmit={handleCreateHotel} className="p-5 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-3">
                  <h5 className="font-serif font-bold text-sm text-neutral-800">
                    Register New Hotel or Heritage Haveli
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">Property Name</label>
                      <input
                        type="text"
                        value={newHotelName}
                        onChange={(e) => setNewHotelName(e.target.value)}
                        placeholder="e.g. Royal Haveli Suites"
                        className="w-full text-xs p-2 rounded-lg border border-neutral-200 mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">City</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-200 mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">Base Price / Night (₹)</label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-200 mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase">Description</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Detailed property highlights..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-neutral-200 mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddHotel(false)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-semibold"
                    >
                      Save Property
                    </button>
                  </div>
                </form>
              )}

              {/* Property cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownerHotels.map((h) => (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      h.id === currentHotel?.id ? 'bg-amber-50/50 border-amber-300 shadow-sm' : 'bg-white border-[#EFE7DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-serif font-bold text-base text-[#17201E]">{h.name}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{h.location}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                        ₹{h.pricePerNight.toLocaleString('en-IN')}/night
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-neutral-100">
                      <span className="text-neutral-500">
                        {h.rooms?.length || 0} Room Categories Listed
                      </span>
                      <button
                        onClick={() => {
                          setSelectedHotelId(h.id);
                          setActiveTab('rooms');
                        }}
                        className="font-semibold text-amber-900 hover:underline cursor-pointer"
                      >
                        Manage Rooms →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EFE7DB]">
                <div>
                  <div className="text-xs text-neutral-400 font-semibold uppercase">Selected Property</div>
                  <div className="font-serif font-bold text-lg text-[#17201E]">{currentHotel?.name}</div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={currentHotel?.id}
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-neutral-200 bg-[#FAF6F0]"
                  >
                    {ownerHotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowAddRoom(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-900 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room Category</span>
                  </button>
                </div>
              </div>

              {/* Add room form */}
              {showAddRoom && (
                <form onSubmit={handleAddRoom} className="p-4 rounded-2xl bg-white border border-amber-300 space-y-3">
                  <h5 className="font-serif font-bold text-sm text-neutral-800">Add Room Category</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Room Title</label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="e.g. Royal Palace Suite"
                        className="w-full text-xs p-2 rounded border mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Type</label>
                      <input
                        type="text"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full text-xs p-2 rounded border mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Nightly Rate (₹)</label>
                      <input
                        type="number"
                        value={roomPrice}
                        onChange={(e) => setRoomPrice(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded border mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Bed</label>
                      <input
                        type="text"
                        value={roomBed}
                        onChange={(e) => setRoomBed(e.target.value)}
                        className="w-full text-xs p-2 rounded border mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRoom(false)}
                      className="px-3 py-1 rounded border text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-amber-900 text-white text-xs font-semibold rounded"
                    >
                      Save Room
                    </button>
                  </div>
                </form>
              )}

              {/* Listed rooms */}
              <div className="space-y-3">
                {currentHotel?.rooms?.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-serif font-bold text-sm text-[#17201E]">{r.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {r.type} · {r.bed} · {r.maxGuests} Guests · {r.sqft} sqft
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {r.perks.map((p, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif font-bold text-lg text-amber-950">
                        ₹{r.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-neutral-400">per night</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#17201E]">
                Reservations for {currentHotel?.name}
              </h4>

              {propertyBookings.length > 0 ? (
                <div className="space-y-3">
                  {propertyBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="font-serif font-bold text-sm text-neutral-800">
                          {b.subtitle || b.roomName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Guest: <strong>{b.passengers?.[0]?.name || b.guestName || 'Valued Guest'}</strong>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Dates: {b.checkInOrDeparture || b.checkIn} → {b.checkOutOrArrival || b.checkOut}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-amber-950">₹{(b.totalPaid || b.totalPrice || 0).toLocaleString('en-IN')}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EFE7DB] text-xs text-neutral-500">
                  No guest bookings currently logged for this property.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
