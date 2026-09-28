import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SearchWidget } from './components/SearchWidget';
import { ExperienceSection } from './components/ExperienceSection';
import { HotelDiscovery } from './components/HotelDiscovery';
import { NeighborhoodMap } from './components/NeighborhoodMap';
import { Footer } from './components/Footer';
import { AIPlannerModal } from './components/AIPlannerModal';
import { HotelDetailModal } from './components/HotelDetailModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { MyTripsModal } from './components/MyTripsModal';
import { TravelWalletModal } from './components/TravelWalletModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { SearchResultsModal } from './components/SearchResultsModal';
import { AuthModal } from './components/AuthModal';

import { Hotel, Room, Booking, UserProfile, WalletState } from './types/travel';
import { INITIAL_HOTELS } from './data/hotels';
import { Sparkles, Check, Heart } from 'lucide-react';

export default function App() {
  // Hotels State
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [favorites, setFavorites] = useState<string[]>(['itc-kakatiya', 'taj-krishna']);

  // Active search tab
  const [activeSearchTab, setActiveSearchTab] = useState<'flights' | 'trains' | 'buses' | 'hotels'>('flights');

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'usr_founder_01',
    name: 'Alluri Vijaya Priya',
    email: 'pranaviguntoju13@gmail.com',
    role: 'ADMIN',
    title: 'Founder account',
    avatar: 'AP',
    phone: '+91 98490 12345',
    preferences: {
      mealPref: 'North Indian & Continental',
      seatPref: 'Window / Lower Berth',
      hotelClass: '5-Star Luxury & Heritage',
    },
  });

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    balance: 2500,
    credits: [
      { id: 'cr-1', amount: 1500, desc: 'Welcome bonus credit', date: '2026-09-01', type: 'credit' },
      { id: 'cr-2', amount: 1000, desc: 'Founder referral bonus', date: '2026-09-15', type: 'credit' },
    ],
    coupons: [
      { code: 'STAY2026', discount: '15% OFF', desc: 'Flat 15% off on all handpicked stays up to ₹2,500', expiry: '31 Dec 2026' },
      { code: 'WELCOME500', discount: '₹500 OFF', desc: 'Instant ₹500 discount on your next flight or hotel booking', expiry: '30 Nov 2026' },
      { code: 'LUXURYWAY', discount: '20% OFF', desc: 'Special festive discount for Taj and ITC heritage stays', expiry: '31 Oct 2026' },
    ],
  });

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'PMS-HYD-84920',
      hotelId: 'itc-kakatiya',
      hotelName: 'ITC Kakatiya',
      hotelImage: INITIAL_HOTELS[0].images[0],
      hotelLocation: 'Hyderabad, Telangana',
      roomName: 'Executive Club Room',
      checkIn: '2026-10-15',
      checkOut: '2026-10-18',
      nights: 3,
      guests: 2,
      guestName: 'Alluri Vijaya Priya',
      guestEmail: 'pranaviguntoju13@gmail.com',
      guestPhone: '+91 98490 12345',
      addOns: ['Airport Luxury Pick-up', 'Buffet Breakfast'],
      basePrice: 15600,
      taxPrice: 2808,
      totalPrice: 18408,
      status: 'confirmed',
      bookedAt: '2026-09-20T10:30:00.000Z',
      paymentMethod: 'UPI (Google Pay / PhonePe)',
      paymentId: 'pay_rzp_mock_982341',
    },
  ]);

  // Modals visibility
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [tripsModalOpen, setTripsModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Selected hotel for detail & booking
  const [selectedHotelForDetail, setSelectedHotelForDetail] = useState<Hotel | null>(null);
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  // Search Results Modal for transit
  const [transitModalType, setTransitModalType] = useState<'flights' | 'trains' | 'buses' | null>(null);
  const [transitParams, setTransitParams] = useState<any>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFavorite = (hotelId: string) => {
    if (favorites.includes(hotelId)) {
      setFavorites(favorites.filter((id) => id !== hotelId));
      showToast('Removed from saved stays');
    } else {
      setFavorites([...favorites, hotelId]);
      showToast('Saved to your favorites!');
    }
  };

  const handleSelectRoomForBooking = (hotel: Hotel, room: Room) => {
    setSelectedHotelForDetail(null);
    setBookingHotel(hotel);
    setBookingRoom(room);
  };

  const handleBookingComplete = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
    showToast(`Booking ${newBooking.id} confirmed!`);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    showToast('Booking cancelled successfully.');
  };

  const handleAddHotel = (newHotelData: Partial<Hotel>) => {
    const newH: Hotel = {
      id: `hotel-${Date.now()}`,
      name: newHotelData.name || 'Boutique Heritage Stay',
      location: newHotelData.location || 'Jaipur, Rajasthan',
      city: newHotelData.city || 'Jaipur',
      state: newHotelData.state || 'Rajasthan',
      distanceCentre: newHotelData.distanceCentre || '1.5 km from centre',
      stars: newHotelData.stars || 5,
      rating: 4.8,
      reviewCount: 30,
      pricePerNight: newHotelData.pricePerNight || 9000,
      breakfastIncluded: newHotelData.breakfastIncluded ?? true,
      images: INITIAL_HOTELS[0].images,
      description: newHotelData.description || 'Curated luxury stay in India.',
      amenities: newHotelData.amenities || ['Outdoor Pool', 'Spa', 'Fine Dining', 'Free Wi-Fi'],
      neighborhood: newHotelData.neighborhood || 'Central District',
      rooms: newHotelData.rooms || [
        {
          id: `r-${Date.now()}`,
          name: 'Deluxe Heritage Room',
          type: 'Deluxe',
          price: newHotelData.pricePerNight || 9000,
          bed: '1 King Bed',
          maxGuests: 2,
          sqft: 420,
          perks: ['Free Breakfast', 'Wi-Fi'],
        },
      ],
    };
    setHotels([newH, ...hotels]);
    showToast(`Added ${newH.name} to directory!`);
  };

  const handleDeleteHotel = (id: string) => {
    setHotels(hotels.filter((h) => h.id !== id));
    showToast('Property removed from directory.');
  };

  const scrollToHotels = (cityQuery?: string) => {
    const el = document.getElementById('hotels');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#17201E] flex flex-col font-sans selection:bg-[#F27658]/20 selection:text-[#073D36]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-[#073D36] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-[#F27658]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        user={currentUser}
        onOpenTrips={() => setTripsModalOpen(true)}
        onOpenWallet={() => setWalletModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenAI={() => setAiModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Signed out successfully');
        }}
        onNavigateTab={(tab) => {
          setActiveSearchTab(tab);
          if (tab === 'hotels') {
            scrollToHotels();
          } else {
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }
        }}
      />

      {/* Hero Section */}
      <Hero
        onStartPlanning={() => {
          setActiveSearchTab('hotels');
          scrollToHotels();
        }}
        onPlanWithAI={() => setAiModalOpen(true)}
      />

      {/* Travel Search Module */}
      <SearchWidget
        activeTab={activeSearchTab}
        onTabChange={(tab) => setActiveSearchTab(tab)}
        onSearchFlights={(params) => {
          setTransitParams(params);
          setTransitModalType('flights');
        }}
        onSearchTrains={(params) => {
          setTransitParams(params);
          setTransitModalType('trains');
        }}
        onSearchBuses={(params) => {
          setTransitParams(params);
          setTransitModalType('buses');
        }}
        onSearchHotels={(params) => {
          scrollToHotels(params.destination);
        }}
        onOpenAI={() => setAiModalOpen(true)}
      />

      {/* The PlanMyStay Experience */}
      <ExperienceSection
        onOpenAI={() => setAiModalOpen(true)}
        onExploreHotels={() => scrollToHotels()}
        onOpenTrips={() => setTripsModalOpen(true)}
      />

      {/* Hotel Discovery Section */}
      <HotelDiscovery
        hotels={hotels}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onViewStay={(hotel) => setSelectedHotelForDetail(hotel)}
      />

      {/* Discover Around You / Neighborhood Map */}
      <NeighborhoodMap
        onSelectNeighborhood={(neighborhood) => {
          scrollToHotels(neighborhood);
        }}
      />

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setAdminModalOpen(true)}
        onNavigateTab={(tab) => {
          setActiveSearchTab(tab);
          if (tab === 'hotels') {
            scrollToHotels();
          } else {
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }
        }}
      />

      {/* Floating PlanMyStay AI Button matching the reference video */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiModalOpen(true)}
          className="px-5 py-3 rounded-full bg-[#17201E] hover:bg-[#073D36] text-white shadow-2xl border border-white/20 flex items-center gap-2.5 font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          aria-label="Open PlanMyStay AI Concierge"
        >
          <div className="w-5 h-5 rounded-full bg-[#F27658]/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#F27658] group-hover:rotate-12 transition-transform" />
          </div>
          <span>PlanMyStay AI</span>
        </button>
      </div>

      {/* MODALS */}

      {/* 1. AI Travel Concierge Modal */}
      <AIPlannerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* 2. Hotel Detail Modal */}
      <HotelDetailModal
        hotel={selectedHotelForDetail}
        isOpen={!!selectedHotelForDetail}
        onClose={() => setSelectedHotelForDetail(null)}
        isFavorite={selectedHotelForDetail ? favorites.includes(selectedHotelForDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onSelectRoomForBooking={handleSelectRoomForBooking}
      />

      {/* 3. Multi-Step Booking Flow Modal */}
      <BookingFlowModal
        hotel={bookingHotel}
        room={bookingRoom}
        isOpen={!!bookingHotel && !!bookingRoom}
        onClose={() => {
          setBookingHotel(null);
          setBookingRoom(null);
        }}
        onBookingComplete={handleBookingComplete}
      />

      {/* 4. My Trips Modal */}
      <MyTripsModal
        isOpen={tripsModalOpen}
        onClose={() => setTripsModalOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />

      {/* 5. Travel Wallet Modal */}
      <TravelWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        wallet={wallet}
      />

      {/* 6. Settings Modal */}
      {currentUser && (
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          user={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser({ ...currentUser, ...updated });
            showToast('Profile updated!');
          }}
        />
      )}

      {/* 7. Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        hotels={hotels}
        bookings={bookings}
        onAddHotel={handleAddHotel}
        onDeleteHotel={handleDeleteHotel}
      />

      {/* 8. Transit Search Results Modal */}
      <SearchResultsModal
        type={transitModalType}
        params={transitParams}
        isOpen={!!transitModalType}
        onClose={() => setTransitModalType(null)}
        onSelectOption={(title, price) => {
          showToast(`Selected: ${title} (₹${price.toLocaleString('en-IN')})`);
        }}
      />

      {/* 9. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
