import React, { useState, useEffect } from 'react';
import { UserProfile, Booking, TravelStats, TravelAchievement, TravelMemory } from '../types/travel';
import {
  X,
  User,
  Flame,
  Award,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Plane,
  Train,
  Bus,
  Hotel as HotelIcon,
  Sparkles,
  Camera,
  Upload,
  AlertCircle
} from 'lucide-react';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  bookings: Booking[];
  onLogout: () => void;
  onOpenOwnerPortal?: () => void;
  onOpenAdminPortal?: () => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  bookings,
  onLogout,
  onOpenOwnerPortal,
  onOpenAdminPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'streaks' | 'album' | 'bookings'>('overview');
  const [stats, setStats] = useState<TravelStats>({
    userId: user?.id || 'usr_founder_01',
    totalTrips: 0,
    currentStreak: 0,
    longestStreak: 0,
    nextMilestone: { target: 1, name: 'First Voyage', remaining: 1 },
  });
  const [achievements, setAchievements] = useState<TravelAchievement[]>([]);
  const [memories, setMemories] = useState<TravelMemory[]>([]);
  const [loading, setLoading] = useState(false);

  // New Memory Modal / Form State
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [editingMemory, setEditingMemory] = useState<TravelMemory | null>(null);
  const [memoryDestination, setMemoryDestination] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState('');
  const [memoryTagInput, setMemoryTagInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [statsRes, achsRes, albumRes] = await Promise.all([
        fetch(`/api/user/travel-stats?userId=${user.id}`),
        fetch(`/api/user/achievements?userId=${user.id}`),
        fetch(`/api/user/album?userId=${user.id}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
      }
      if (achsRes.ok) {
        const data = await achsRes.json();
        if (data.achievements) setAchievements(data.achievements);
      }
      if (albumRes.ok) {
        const data = await albumRes.json();
        if (data.album) setMemories(data.album);
      }
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Handle Photo File Upload to Base64/Storage preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setMemoryPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryDestination || !memoryCaption) return;

    const tags = memoryTagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const photoToUse =
      memoryPhotoUrl ||
      photoPreview ||
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

    try {
      if (editingMemory) {
        // Update
        const res = await fetch(`/api/user/album/${editingMemory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            destination: memoryDestination,
            travelDate: memoryDate,
            caption: memoryCaption,
            photoUrl: photoToUse,
            tags,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMemories(memories.map((m) => (m.id === editingMemory.id ? data.memory : m)));
        }
      } else {
        // Create
        const res = await fetch('/api/user/album', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            destination: memoryDestination,
            travelDate: memoryDate,
            caption: memoryCaption,
            photoUrl: photoToUse,
            tags,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMemories([data.memory, ...memories]);
        }
      }

      // Reset Form
      setShowAddMemory(false);
      setEditingMemory(null);
      setMemoryDestination('');
      setMemoryCaption('');
      setMemoryPhotoUrl('');
      setMemoryTagInput('');
      setPhotoPreview(null);
    } catch (err) {
      console.error('Error saving memory:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this travel memory?')) return;
    try {
      const res = await fetch(`/api/user/album/${id}?userId=${user.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMemories(memories.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting memory:', err);
    }
  };

  const openEditModal = (mem: TravelMemory) => {
    setEditingMemory(mem);
    setMemoryDestination(mem.destination);
    setMemoryDate(mem.travelDate);
    setMemoryCaption(mem.caption);
    setMemoryPhotoUrl(mem.photoUrl);
    setPhotoPreview(mem.photoUrl);
    setMemoryTagInput(mem.tags?.join(', ') || '');
    setShowAddMemory(true);
  };

  const startMemoryFromBooking = (booking: Booking) => {
    const dest = booking.details?.hotelLocation || booking.subtitle?.split('·')[0] || 'Incredible India';
    setEditingMemory(null);
    setMemoryDestination(dest.trim());
    setMemoryDate(booking.checkInOrDeparture || booking.checkIn || new Date().toISOString().split('T')[0]);
    setMemoryCaption(`Unforgettable journey with PlanMyStay: ${booking.title || booking.hotelName}.`);
    setMemoryPhotoUrl(booking.hotelImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80');
    setPhotoPreview(booking.hotelImage || null);
    setMemoryTagInput(booking.serviceType || 'STAY');
    setActiveTab('album');
    setShowAddMemory(true);
  };

  const userBookings = bookings;
  const upcomingBookings = userBookings.filter((b) => (b.status || '').toLowerCase() !== 'cancelled');
  const cancelledBookings = userBookings.filter((b) => (b.status || '').toLowerCase() === 'cancelled');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#073D36] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-[#F27658]">
              {user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : 'AP')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">
                  {user.name || user.email || 'Traveler'}
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-[#F27658] text-white'
                    : user.role === 'OWNER'
                    ? 'bg-amber-400 text-[#073D36]'
                    : 'bg-white/20 text-white'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[#EFE7DB]/80 font-light">
                {user.email} · {user.title || 'PlanMyStay Member'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'OWNER' && onOpenOwnerPortal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOwnerPortal();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-semibold cursor-pointer border border-amber-300/30"
              >
                <HotelIcon className="w-3.5 h-3.5" />
                <span>Owner Portal</span>
              </button>
            )}

            {user.role === 'ADMIN' && onOpenAdminPortal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminPortal();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F27658]/20 hover:bg-[#F27658]/30 text-[#F27658] text-xs font-semibold cursor-pointer border border-[#F27658]/30"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EFE7DB] bg-white px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('streaks')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'streaks'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#F27658]" />
            <span>Travel Streaks ({stats.currentStreak} 🔥)</span>
          </button>

          <button
            onClick={() => setActiveTab('album')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'album'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#073D36]" />
            <span>Travel Album ({memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#073D36]" />
            <span>Trips & History ({userBookings.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* STREAK HERO CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#073D36] to-[#042621] text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#F27658]/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F27658]/20 text-[#F27658] border border-[#F27658]/30 text-xs font-bold uppercase tracking-wider">
                      <Flame className="w-4 h-4 fill-[#F27658]" />
                      <span>Live Travel Streak</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                      Keep the Indian Journey Alive
                    </h2>
                    <p className="text-xs sm:text-sm text-[#EFE7DB]/80 max-w-lg">
                      Each completed stay, flight, train, or bus journey across India advances your travel streak and unlocks milestone privileges.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <div className="text-center px-2">
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F27658] flex items-center justify-center gap-1">
                        <span>{stats.currentStreak}</span>
                        <span className="text-sm">🔥</span>
                      </div>
                      <div className="text-[10px] text-[#EFE7DB]/80 uppercase tracking-wider font-semibold mt-1">
                        Current Streak
                      </div>
                    </div>
                    <div className="text-center px-2 border-x border-white/10">
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                        {stats.longestStreak}
                      </div>
                      <div className="text-[10px] text-[#EFE7DB]/80 uppercase tracking-wider font-semibold mt-1">
                        Longest Streak
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                        {stats.totalTrips}
                      </div>
                      <div className="text-[10px] text-[#EFE7DB]/80 uppercase tracking-wider font-semibold mt-1">
                        Total Trips
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Progress bar */}
                <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#EFE7DB]/90">
                    <Award className="w-4 h-4 text-[#F27658]" />
                    <span>
                      Next Milestone: <strong className="text-white">{stats.nextMilestone.name}</strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-[#F27658] font-semibold">
                    {stats.nextMilestone.remaining === 0 ? 'Milestone achieved!' : `${stats.nextMilestone.remaining} more trip(s) needed`}
                  </div>
                </div>
              </div>

              {/* Profile Details & Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-base text-[#17201E] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#073D36]" />
                    <span>Profile Information</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Name</span>
                      <span className="font-semibold text-neutral-800">{user.name || user.email || 'Traveler'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Email</span>
                      <span className="font-semibold text-neutral-800">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Phone</span>
                      <span className="font-semibold text-neutral-800">{user.phone || '+91 98490 12345'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Role & Access</span>
                      <span className="font-semibold text-[#073D36]">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-base text-[#17201E] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F27658]" />
                    <span>Traveler Preferences</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Meal Choice</span>
                      <span className="font-semibold text-neutral-800">{user.preferences?.mealPref || 'Continental / Regional Indian'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Seat Preference</span>
                      <span className="font-semibold text-neutral-800">{user.preferences?.seatPref || 'Window / Lower Berth'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Accommodation Class</span>
                      <span className="font-semibold text-neutral-800">{user.preferences?.hotelClass || '5-Star Luxury & Heritage'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#17201E] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#073D36]" />
                    <span>Recent Activity</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-semibold text-[#F27658] hover:underline cursor-pointer"
                  >
                    View All Trips
                  </button>
                </div>

                {upcomingBookings.length > 0 ? (
                  <div className="divide-y divide-neutral-100 text-xs">
                    {upcomingBookings.slice(0, 3).map((b) => (
                      <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-[#FAF6F0] text-[#073D36]">
                            {b.serviceType === 'FLIGHT' && <Plane className="w-3.5 h-3.5 text-[#F27658]" />}
                            {b.serviceType === 'TRAIN' && <Train className="w-3.5 h-3.5 text-[#F27658]" />}
                            {b.serviceType === 'BUS' && <Bus className="w-3.5 h-3.5 text-[#F27658]" />}
                            {(!b.serviceType || b.serviceType === 'HOTEL') && <HotelIcon className="w-3.5 h-3.5 text-[#073D36]" />}
                          </span>
                          <div>
                            <div className="font-semibold text-neutral-800">{b.title || b.hotelName}</div>
                            <div className="text-[10px] text-neutral-400">{b.checkInOrDeparture || b.checkIn} · Ref: {b.referenceCode || b.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#073D36]">₹{(b.totalPaid || b.totalPrice || 0).toLocaleString('en-IN')}</div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 py-3">No recent bookings found. Plan your next adventure across India!</p>
                )}
              </div>

              {/* Logout Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TRAVEL STREAKS & BADGES */}
          {activeTab === 'streaks' && (
            <div className="space-y-6">
              {/* STREAK SUMMARY CARD */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE7DB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-[#F27658] uppercase tracking-wider">
                    🔥 Travel Streak Status
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#17201E]">
                    {stats.currentStreak} Consecutive Journeys
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md">
                    Keep traveling within 90 days of each trip to expand your streak. Completing eligible bookings across flights, trains, buses, and stays increments your total count.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[100px]">
                    <div className="font-serif font-bold text-2xl text-amber-900">
                      {stats.longestStreak}
                    </div>
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Best Streak
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[100px]">
                    <div className="font-serif font-bold text-2xl text-emerald-900">
                      {stats.totalTrips}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Total Trips
                    </div>
                  </div>
                </div>
              </div>

              {/* UNLOCKED ACHIEVEMENTS & MILESTONES */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-lg text-[#17201E] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#F27658]" />
                  <span>Travel Milestones & Privileges</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    {
                      code: 'FIRST_TRIP',
                      title: 'First Voyage',
                      desc: 'Completed your first authentic journey with PlanMyStay',
                      icon: '🌟',
                      unlocked: stats.totalTrips >= 1,
                    },
                    {
                      code: '3_TRIPS',
                      title: 'Explorer',
                      desc: 'Completed 3 memorable journeys across India',
                      icon: '🚀',
                      unlocked: stats.totalTrips >= 3,
                    },
                    {
                      code: '5_TRIPS',
                      title: 'Heritage Connoisseur',
                      desc: 'Completed 5 luxury & cultural journeys',
                      icon: '👑',
                      unlocked: stats.totalTrips >= 5,
                    },
                    {
                      code: '10_TRIPS',
                      title: 'Centurion Traveler',
                      desc: 'Completed 10 comprehensive trips',
                      icon: '🏆',
                      unlocked: stats.totalTrips >= 10,
                    },
                    {
                      code: 'FREQUENT_TRAVELLER',
                      title: 'Frequent Traveller',
                      desc: 'Maintained 3+ consecutive trip streaks',
                      icon: '🔥',
                      unlocked: stats.currentStreak >= 3,
                    },
                  ].map((m) => (
                    <div
                      key={m.code}
                      className={`p-4 rounded-2xl border transition-all ${
                        m.unlocked
                          ? 'bg-white border-emerald-300 shadow-sm'
                          : 'bg-neutral-50/70 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{m.icon}</span>
                        {m.unlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                            Locked
                          </span>
                        )}
                      </div>
                      <div className="font-serif font-bold text-sm text-[#17201E]">
                        {m.title}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                        {m.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAVEL ALBUM (PHOTO MEMORIES) */}
          {activeTab === 'album' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-xl text-[#17201E]">
                    Personal Travel Album
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Chronicle your treasured memories, heritage snapshots, and journeys across India.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMemory(null);
                    setMemoryDestination('');
                    setMemoryCaption('');
                    setMemoryPhotoUrl('');
                    setMemoryTagInput('');
                    setPhotoPreview(null);
                    setShowAddMemory(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Travel Memory</span>
                </button>
              </div>

              {/* Add / Edit Memory Form Modal / Inline */}
              {showAddMemory && (
                <div className="p-5 rounded-3xl bg-white border border-[#073D36]/20 shadow-md animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h5 className="font-serif font-bold text-base text-[#17201E]">
                      {editingMemory ? 'Edit Travel Memory' : 'New Travel Memory'}
                    </h5>
                    <button
                      onClick={() => setShowAddMemory(false)}
                      className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMemory} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Destination
                        </label>
                        <div className="flex items-center gap-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-neutral-200">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            value={memoryDestination}
                            onChange={(e) => setMemoryDestination(e.target.value)}
                            placeholder="e.g. Udaipur, Rajasthan"
                            className="w-full text-xs font-medium focus:outline-none bg-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Travel Date
                        </label>
                        <div className="flex items-center gap-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-neutral-200">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <input
                            type="date"
                            value={memoryDate}
                            onChange={(e) => setMemoryDate(e.target.value)}
                            className="w-full text-xs font-medium focus:outline-none bg-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Caption / Personal Reflection
                      </label>
                      <textarea
                        value={memoryCaption}
                        onChange={(e) => setMemoryCaption(e.target.value)}
                        placeholder="Describe the experience, sunset, heritage architecture, or special moments..."
                        rows={3}
                        className="w-full text-xs font-medium p-3 rounded-xl border border-neutral-200 bg-[#FAF6F0] focus:outline-none"
                        required
                      />
                    </div>

                    {/* Photo input with file upload or URL */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                        Travel Photo
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <label className="px-3.5 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-2 cursor-pointer shadow-sm">
                          <Upload className="w-4 h-4 text-[#F27658]" />
                          <span>Upload from device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>

                        <div className="flex-1 w-full flex items-center gap-2 bg-[#FAF6F0] p-2 rounded-xl border border-neutral-200">
                          <ImageIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                          <input
                            type="url"
                            value={memoryPhotoUrl}
                            onChange={(e) => {
                              setMemoryPhotoUrl(e.target.value);
                              setPhotoPreview(e.target.value);
                            }}
                            placeholder="or paste image URL (Unsplash, Supabase Storage, etc.)"
                            className="w-full text-xs font-medium focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      {photoPreview && (
                        <div className="mt-2 relative w-32 h-24 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={memoryTagInput}
                        onChange={(e) => setMemoryTagInput(e.target.value)}
                        placeholder="Heritage, Sunset, Forts, Luxury"
                        className="w-full text-xs font-medium p-2.5 rounded-xl border border-neutral-200 bg-[#FAF6F0] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMemory(false)}
                        className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        {editingMemory ? 'Update Memory' : 'Save to Album'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* MEMORIES GRID */}
              {memories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="bg-white rounded-2xl border border-[#EFE7DB] shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md"
                    >
                      <div className="relative h-44 overflow-hidden bg-neutral-100">
                        <img
                          src={mem.photoUrl}
                          alt={mem.destination}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F27658]" />
                          <span>{mem.destination}</span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{mem.travelDate}</span>
                          </div>
                          <p className="text-xs text-neutral-700 font-serif leading-relaxed line-clamp-3">
                            "{mem.caption}"
                          </p>
                        </div>

                        {mem.tags && mem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {mem.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#073D36] border border-[#EFE7DB]"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => openEditModal(mem)}
                            className="text-neutral-500 hover:text-[#073D36] flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-[#EFE7DB]">
                  <Camera className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <h5 className="font-serif font-bold text-base text-neutral-700">
                    Your Travel Album is Empty
                  </h5>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    Upload your first travel photograph or import from completed bookings to begin building your personal album.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRIPS & HISTORY */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-xl text-[#17201E]">
                    My Bookings & Reservations
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Live PNRs, stay vouchers, and completed journeys.
                  </p>
                </div>
              </div>

              {userBookings.length > 0 ? (
                <div className="space-y-3">
                  {userBookings.map((b) => {
                    const isCancelled = (b.status || '').toLowerCase() === 'cancelled';
                    return (
                      <div
                        key={b.id}
                        className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-[#FAF6F0] text-[#073D36]">
                              {b.serviceType === 'FLIGHT' && <Plane className="w-4 h-4 text-[#F27658]" />}
                              {b.serviceType === 'TRAIN' && <Train className="w-4 h-4 text-[#F27658]" />}
                              {b.serviceType === 'BUS' && <Bus className="w-4 h-4 text-[#F27658]" />}
                              {(!b.serviceType || b.serviceType === 'HOTEL') && <HotelIcon className="w-4 h-4 text-[#073D36]" />}
                            </span>

                            <span className="font-serif font-bold text-base text-[#17201E]">
                              {b.title || b.hotelName}
                            </span>

                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isCancelled ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="text-xs text-neutral-600">
                            {b.subtitle || `${b.roomName} · ${b.hotelLocation}`}
                          </div>

                          <div className="text-xs text-neutral-400 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{b.checkInOrDeparture || b.checkIn}</span>
                            <span>·</span>
                            <span>Ref: <strong className="font-mono text-neutral-700">{b.referenceCode || b.id}</strong></span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-0 pt-3 sm:pt-0 border-neutral-100">
                          <div className="text-left sm:text-right">
                            <div className="font-serif font-bold text-lg text-[#073D36]">
                              ₹{(b.totalPaid || b.totalPrice || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-neutral-400">Total Paid</div>
                          </div>

                          {!isCancelled && (
                            <button
                              onClick={() => startMemoryFromBooking(b)}
                              className="px-3 py-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#EFE7DB] text-[11px] font-semibold text-[#073D36] border border-[#073D36]/20 flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3 h-3 text-[#F27658]" />
                              <span>Add to Travel Album</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-3xl border border-[#EFE7DB]">
                  <p className="text-xs text-neutral-500">No bookings yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
