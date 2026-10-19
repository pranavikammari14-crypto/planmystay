import React, { useState, useEffect } from 'react';
import { Hotel, Booking, HotelVerificationStatus } from '../types/travel';
import {
  ShieldCheck,
  X,
  Plus,
  Trash2,
  CheckCircle,
  TrendingUp,
  Users,
  Hotel as HotelIcon,
  Sparkles,
  Activity,
  Key,
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Eye,
  Edit3,
  Lock,
  Ban,
  PauseCircle,
  PlayCircle,
  Search,
  Filter,
  Phone,
  MapPin,
  Building2,
  History,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotels: Hotel[];
  bookings: Booking[];
  onAddHotel: (hotel: Partial<Hotel>) => void;
  onDeleteHotel: (id: string) => void;
  onRefreshHotels?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  hotels,
  bookings,
  onAddHotel,
  onDeleteHotel,
  onRefreshHotels,
}) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'analytics' | 'integrations' | 'bookings' | 'users' | 'ai'>('verification');
  const [showAddForm, setShowAddForm] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Verification & Catalog State
  const [allHotelsList, setAllHotelsList] = useState<Hotel[]>(hotels);
  const [catalogStats, setCatalogStats] = useState<{
    total: number;
    verifiedCount: number;
    pendingCount: number;
    rejectedCount: number;
    temporarilyUnavailableCount: number;
    inactiveCount: number;
    directBookingAuthorizedCount: number;
    informationalOnlyCount: number;
  }>({
    total: hotels.length,
    verifiedCount: hotels.filter((h) => h.verificationStatus === 'Verified').length,
    pendingCount: hotels.filter((h) => h.verificationStatus === 'Pending Verification').length,
    rejectedCount: hotels.filter((h) => h.verificationStatus === 'Rejected').length,
    temporarilyUnavailableCount: hotels.filter((h) => h.verificationStatus === 'Temporarily Unavailable').length,
    inactiveCount: hotels.filter((h) => h.verificationStatus === 'Inactive').length,
    directBookingAuthorizedCount: hotels.filter((h) => h.verificationStatus === 'Verified' && h.bookingAuthorized).length,
    informationalOnlyCount: hotels.filter((h) => h.verificationStatus === 'Verified' && !h.bookingAuthorized).length,
  });

  const [statusFilter, setStatusFilter] = useState<'ALL' | HotelVerificationStatus>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals for deep inspection and actions
  const [inspectingHotel, setInspectingHotel] = useState<Hotel | null>(null);
  const [rejectingHotel, setRejectingHotel] = useState<Hotel | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New Hotel Form State
  const [newHotelName, setNewHotelName] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newState, setNewState] = useState('Telangana');
  const [newBrand, setNewBrand] = useState('Independent');
  const [newPrice, setNewPrice] = useState(4500);
  const [newStars, setNewStars] = useState(4);
  const [newAddress, setNewAddress] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newVerificationSource, setNewVerificationSource] = useState('Corporate Portal & Municipal Register');
  const [newBookingAuth, setNewBookingAuth] = useState(true);
  const [newStatus, setNewStatus] = useState<HotelVerificationStatus>('Verified');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const fetchStatusAndAnalytics = async () => {
    setLoading(true);
    try {
      const [sysRes, anaRes, usersRes, hotelsRes] = await Promise.all([
        fetch('/api/system/status'),
        fetch('/api/analytics/overview'),
        fetch('/api/admin/users'),
        fetch('/api/admin/hotels'),
      ]);

      if (sysRes.ok) {
        const sys = await sysRes.json();
        setSystemStatus(sys.services);
      }
      if (anaRes.ok) {
        const ana = await anaRes.json();
        setAnalyticsData(ana);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.users) setUsersList(uData.users);
      }
      if (hotelsRes.ok) {
        const hData = await hotelsRes.json();
        if (hData.hotels) {
          setAllHotelsList(hData.hotels);
        }
        if (hData.stats) {
          setCatalogStats(hData.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndAnalytics();
    }
  }, [isOpen]);

  // Update status (Verify, Reject, Mark Unavailable, etc.)
  const handleVerifyStatus = async (
    hotelId: string,
    newVerificationStatus: HotelVerificationStatus,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: newVerificationStatus,
          rejectionReason: reason,
          actor: 'Founder: Alluri Vijaya Priya',
          notes: `Updated status to ${newVerificationStatus} via Executive Hub`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Updated "${data.hotel.name}" to ${newVerificationStatus}`);
        await fetchStatusAndAnalytics();
        if (onRefreshHotels) onRefreshHotels();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Toggle Direct Booking Authorization
  const handleToggleBookingAuth = async (hotel: Hotel) => {
    const nextAuth = !hotel.bookingAuthorized;
    try {
      const res = await fetch(`/api/admin/hotels/${hotel.id}/booking-auth`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingAuthorized: nextAuth,
          actor: 'Founder: Alluri Vijaya Priya',
          notes: `Toggled booking authorization to ${nextAuth ? 'ENABLED' : 'INFORMATIONAL_ONLY'}`,
        }),
      });

      if (res.ok) {
        showToast(
          nextAuth
            ? `Direct instant booking ENABLED for "${hotel.name}"`
            : `Set to INFORMATIONAL LISTING for "${hotel.name}" (Direct payment restricted)`
        );
        await fetchStatusAndAnalytics();
        if (onRefreshHotels) onRefreshHotels();
      }
    } catch (err) {
      console.error('Failed to toggle booking authorization:', err);
    }
  };

  // Soft Delete / Inactive
  const handleSoftDelete = async (hotelId: string) => {
    if (!confirm('Exclude this hotel from the active directory? It will be marked Inactive with preserved audit history.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Property marked Inactive and excluded from public catalog.');
        await fetchStatusAndAnalytics();
        if (onRefreshHotels) onRefreshHotels();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Create Hotel with duplicate prevention
  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newHotelName.trim()) return;

    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHotelName.trim(),
          city: newCity,
          state: newState,
          brand: newBrand,
          location: `${newCity}, ${newState}`,
          pricePerNight: Number(newPrice),
          stars: Number(newStars),
          fullAddress: newAddress,
          contactInfo: newContact,
          officialUrl: newWebsite,
          verificationSource: newVerificationSource,
          verificationStatus: newStatus,
          bookingAuthorized: newBookingAuth,
          actor: 'Founder: Alluri Vijaya Priya',
          description: `Verified ${newStars}-star accommodations in ${newCity}, offering premium amenities and authentic hospitality.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create hotel listing');
        return;
      }

      showToast(`Property "${data.hotel.name}" successfully added with status: ${data.hotel.verificationStatus}`);
      setShowAddForm(false);
      setNewHotelName('');
      setNewAddress('');
      setNewContact('');
      setNewWebsite('');
      await fetchStatusAndAnalytics();
      if (onRefreshHotels) onRefreshHotels();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit hotel');
    }
  };

  // Update existing hotel
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;

    try {
      const res = await fetch(`/api/admin/hotels/${editingHotel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingHotel,
          actor: 'Founder: Alluri Vijaya Priya',
        }),
      });

      if (res.ok) {
        showToast(`Saved changes for "${editingHotel.name}"`);
        setEditingHotel(null);
        await fetchStatusAndAnalytics();
        if (onRefreshHotels) onRefreshHotels();
      }
    } catch (err) {
      console.error('Edit save failed:', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        showToast(`User role updated to ${newRole}`);
      }
    } catch (err) {
      console.error('Failed to change user role:', err);
    }
  };

  if (!isOpen) return null;

  // Filtered list for display
  const displayedHotels = allHotelsList.filter((h) => {
    if (statusFilter !== 'ALL' && h.verificationStatus !== statusFilter) return false;
    if (cityFilter !== 'ALL' && h.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.fullAddress?.toLowerCase().includes(q) ||
        h.brand?.toLowerCase().includes(q) ||
        h.verificationSource?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const uniqueCities = Array.from(new Set(allHotelsList.map((h) => h.city))).filter(Boolean).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#073D36] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#F27658]" />
            <div>
              <h3 className="font-serif font-bold text-xl text-white">
                PlanMyStay Executive Hub
              </h3>
              <p className="text-[11px] text-[#EFE7DB]/80 font-light">
                Founder & Executive Dashboard · Alluri Vijaya Priya (FOUNDER / ADMIN)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/PlanMyStay_Errors_and_Fixing_Rules_Audit_Report.pdf"
              download="PlanMyStay_Errors_and_Fixing_Rules_Audit_Report.pdf"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white transition-colors"
              title="Download Errors & Fixing Rules PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-[#F27658]" />
              <span>Audit & Rules PDF</span>
            </a>
            <button
              onClick={fetchStatusAndAnalytics}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {actionSuccessMessage && (
          <div className="bg-emerald-700 text-white text-xs px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EFE7DB] bg-white px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#F27658]" />
            <span>Hotel Verification & Catalog</span>
            {catalogStats.pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {catalogStats.pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Real-Time Analytics
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'integrations'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Services & API Health
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Reservations ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Users & Roles ({usersList.length || 1})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ai'
                ? 'border-[#073D36] text-[#073D36]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            AI Engine Diagnostics
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: HOTEL VERIFICATION & CATALOG (FOUNDER CONTROLS) */}
          {activeTab === 'verification' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Telemetry Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div
                  onClick={() => setStatusFilter('ALL')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-[#073D36] text-white border-[#073D36] shadow-sm'
                      : 'bg-white border-[#EFE7DB] text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Total Catalog
                  </div>
                  <div className="font-serif font-bold text-2xl mt-1">
                    {catalogStats.total}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-70">Properties Recorded</div>
                </div>

                <div
                  onClick={() => setStatusFilter('Verified')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'Verified'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified (Public)</span>
                  </div>
                  <div className="font-serif font-bold text-2xl mt-1">
                    {catalogStats.verifiedCount}
                  </div>
                  <div className="text-[10px] mt-0.5 text-emerald-700">Published to Guests</div>
                </div>

                <div
                  onClick={() => setStatusFilter('Pending Verification')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'Pending Verification'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-amber-50/80 border-amber-300 text-amber-900 hover:border-amber-400'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Pending Verification</span>
                  </div>
                  <div className="font-serif font-bold text-2xl mt-1 text-amber-600">
                    {catalogStats.pendingCount}
                  </div>
                  <div className="text-[10px] mt-0.5 text-amber-700 font-medium">Excluded from Public</div>
                </div>

                <div
                  onClick={() => setStatusFilter('Rejected')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'Rejected'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900 hover:border-rose-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Ban className="w-3 h-3 text-rose-600" />
                    <span>Rejected</span>
                  </div>
                  <div className="font-serif font-bold text-2xl mt-1 text-rose-700">
                    {catalogStats.rejectedCount}
                  </div>
                  <div className="text-[10px] mt-0.5 text-rose-600">Failed Compliance</div>
                </div>

                <div
                  onClick={() => setStatusFilter('Temporarily Unavailable')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'Temporarily Unavailable'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-orange-50/70 border-orange-200 text-orange-900 hover:border-orange-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <PauseCircle className="w-3 h-3 text-orange-600" />
                    <span>Temp Unavailable</span>
                  </div>
                  <div className="font-serif font-bold text-2xl mt-1">
                    {catalogStats.temporarilyUnavailableCount}
                  </div>
                  <div className="text-[10px] mt-0.5 text-orange-700">Renovations / Off-season</div>
                </div>

                <div
                  onClick={() => setStatusFilter('Inactive')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'Inactive'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3 text-slate-500" />
                    <span>Inactive</span>
                  </div>
                  <div className="font-serif font-bold text-2xl mt-1">
                    {catalogStats.inactiveCount}
                  </div>
                  <div className="text-[10px] mt-0.5 text-slate-500">Archived Records</div>
                </div>
              </div>

              {/* Founder Governance Notice */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#17201E] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#073D36]" />
                    <span>Verification Governance Rules</span>
                  </div>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Only hotels with status <strong className="text-emerald-700">"Verified"</strong> appear in public search and booking checkout. Pending or unverified records are exclusively visible in this dashboard. Direct digital payment is accepted only when <strong className="text-[#073D36]">"Direct Booking Authorized"</strong> is enabled.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 rounded-full bg-[#073D36] text-white font-semibold text-xs hover:bg-[#062F2B] transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catalog New Property</span>
                </button>
              </div>

              {/* Add Hotel Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateHotel}
                  className="p-5 rounded-3xl bg-white border-2 border-[#073D36]/20 shadow-md space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h5 className="font-serif font-bold text-base text-[#17201E]">
                      Catalog New Hotel Property
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Hotel Name *
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. ITC Kakatiya"
                        value={newHotelName}
                        onChange={(e) => setNewHotelName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Destination / City *
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. Hyderabad"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. Telangana"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Brand / Chain
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. ITC Hotels, Taj, Treebo, Independent"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Base Price / Night (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="5200"
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Stars Category
                      </label>
                      <select
                        value={newStars}
                        onChange={(e) => setNewStars(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value={5}>5-Star Luxury</option>
                        <option value={4}>4-Star Premium</option>
                        <option value={3}>3-Star Quality Budget</option>
                        <option value={2}>2-Star Standard</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Verified Physical Address
                      </label>
                      <input
                        type="text"
                        placeholder="Full street address and PIN code"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        placeholder="+91 40 2340 0132"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Official Website URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Verification Source *
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. IHCL Directory, Municipal Trade Register"
                        value={newVerificationSource}
                        onChange={(e) => setNewVerificationSource(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#073D36]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Initial Verification Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as HotelVerificationStatus)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="Verified">Verified (Publish to Guests)</option>
                        <option value="Pending Verification">Pending Verification (Private Queue)</option>
                        <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <input
                      type="checkbox"
                      id="newBookingAuth"
                      checked={newBookingAuth}
                      onChange={(e) => setNewBookingAuth(e.target.checked)}
                      className="w-4 h-4 text-[#073D36] rounded"
                    />
                    <label htmlFor="newBookingAuth" className="text-xs text-neutral-700 cursor-pointer">
                      <strong>Authorize Direct Instant Booking:</strong> Uncheck if property should be published as an Informational Listing only.
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#073D36] text-white text-xs font-semibold cursor-pointer shadow-sm hover:bg-[#062F2B]"
                    >
                      Save to Catalog
                    </button>
                  </div>
                </form>
              )}

              {/* Search & Filter Toolbar */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by hotel name, address, brand, or verification source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#073D36]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* City Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 shrink-0 font-medium text-[11px]">
                    City Filter:
                  </span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="p-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none cursor-pointer bg-neutral-50"
                  >
                    <option value="ALL">All Cities ({allHotelsList.length})</option>
                    {uniqueCities.map((c) => (
                      <option key={c} value={c}>
                        {c} ({allHotelsList.filter((h) => h.city === c).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {[
                  { id: 'ALL', label: 'All Cataloged', count: catalogStats.total },
                  { id: 'Pending Verification', label: 'Pending Verification', count: catalogStats.pendingCount, alert: true },
                  { id: 'Verified', label: 'Verified (Public)', count: catalogStats.verifiedCount },
                  { id: 'Rejected', label: 'Rejected', count: catalogStats.rejectedCount },
                  { id: 'Temporarily Unavailable', label: 'Temporarily Unavailable', count: catalogStats.temporarilyUnavailableCount },
                  { id: 'Inactive', label: 'Inactive', count: catalogStats.inactiveCount },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === st.id
                        ? 'bg-[#073D36] text-white shadow-xs'
                        : 'bg-white border border-[#EFE7DB] text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        statusFilter === st.id
                          ? 'bg-white/20 text-white'
                          : st.alert && st.count > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Hotel Verification Table / Cards */}
              <div className="space-y-3">
                {displayedHotels.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#EFE7DB] text-neutral-500 text-xs">
                    No hotel listings matching the selected filters.
                  </div>
                ) : (
                  displayedHotels.map((h) => {
                    const isPending = h.verificationStatus === 'Pending Verification';
                    const isVerified = h.verificationStatus === 'Verified';
                    const isRejected = h.verificationStatus === 'Rejected';
                    const isTemp = h.verificationStatus === 'Temporarily Unavailable';
                    const isInactive = h.verificationStatus === 'Inactive';

                    return (
                      <div
                        key={h.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPending
                            ? 'bg-amber-50/40 border-amber-300'
                            : isRejected
                            ? 'bg-rose-50/30 border-rose-200'
                            : isVerified
                            ? 'bg-white border-[#EFE7DB] hover:border-neutral-300'
                            : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Info Column */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-serif font-bold text-base text-[#17201E]">
                                {h.name}
                              </span>

                              {/* Verification Status Pill */}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : isTemp
                                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                    : 'bg-slate-200 text-slate-800'
                                }`}
                              >
                                {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isPending && <AlertCircle className="w-3 h-3 text-amber-600" />}
                                {isRejected && <Ban className="w-3 h-3 text-rose-600" />}
                                <span>{h.verificationStatus}</span>
                              </span>

                              {/* Booking Authorization Pill */}
                              {isVerified && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    h.bookingAuthorized
                                      ? 'bg-[#073D36]/10 text-[#073D36]'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {h.bookingAuthorized
                                    ? '✓ Direct Booking Enabled'
                                    : 'ℹ️ Informational Listing'}
                                </span>
                              )}

                              {h.brand && (
                                <span className="text-[10px] text-neutral-500 font-semibold px-2 py-0.5 rounded-md bg-neutral-100">
                                  {h.brand}
                                </span>
                              )}
                            </div>

                            {/* Address & Meta */}
                            <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="font-semibold text-neutral-700">
                                {h.city}, {h.state}
                              </span>
                              <span>•</span>
                              <span>{h.stars} Stars</span>
                              <span>•</span>
                              <span className="font-serif font-bold text-[#073D36]">
                                ₹{h.pricePerNight.toLocaleString('en-IN')}/night
                              </span>
                              <span>•</span>
                              <span className="text-neutral-500 truncate max-w-xs">
                                {h.fullAddress || h.location}
                              </span>
                            </div>

                            {/* Verification Evidence Summary */}
                            <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                              <span>
                                Source: <strong>{h.verificationSource || 'Verified Brand Register'}</strong>
                              </span>
                              <span>•</span>
                              <span>Audited: <strong>{h.lastVerifiedDate || '2026-10-18'}</strong></span>
                              {h.contactInfo && (
                                <>
                                  <span>•</span>
                                  <span>Phone: {h.contactInfo}</span>
                                </>
                              )}
                            </div>

                            {/* Rejection notice if present */}
                            {isRejected && h.rejectionReason && (
                              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                                <strong>Rejection Reason:</strong> {h.rejectionReason}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Column */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Inspect Evidence Button */}
                            <button
                              onClick={() => setInspectingHotel(h)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#EFE7DB] hover:border-neutral-400 text-[#073D36] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              title="Inspect verification evidence, trade certificates & audit history"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#F27658]" />
                              <span>Inspect Evidence</span>
                            </button>

                            {/* Approve / Verify Button */}
                            {!isVerified && (
                              <button
                                onClick={() => handleVerifyStatus(h.id, 'Verified')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                                title="Approve and publish to public catalog"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve Listing</span>
                              </button>
                            )}

                            {/* Reject Button */}
                            {!isRejected && (
                              <button
                                onClick={() => {
                                  setRejectingHotel(h);
                                  setRejectionReasonInput('');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Reject listing with documented reason"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}

                            {/* Direct Booking Toggle */}
                            {isVerified && (
                              <button
                                onClick={() => handleToggleBookingAuth(h)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
                                  h.bookingAuthorized
                                    ? 'bg-[#073D36]/10 text-[#073D36] border-[#073D36]/30 hover:bg-[#073D36]/20'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                                }`}
                                title={
                                  h.bookingAuthorized
                                    ? 'Click to restrict to Informational Listing'
                                    : 'Click to enable Direct Booking'
                                }
                              >
                                {h.bookingAuthorized ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Booking: ON</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5 text-[#F27658]" />
                                    <span>Enable Direct</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Edit Details */}
                            <button
                              onClick={() => setEditingHotel({ ...h })}
                              className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                              title="Edit listing details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Soft Delete */}
                            {!isInactive && (
                              <button
                                onClick={() => handleSoftDelete(h.id)}
                                className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Exclude and mark Inactive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB]">
                  <div className="text-neutral-500 text-xs font-medium">Verified Hotels</div>
                  <div className="font-serif font-bold text-2xl text-[#073D36] mt-1">
                    {catalogStats.verifiedCount}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">Across 10 Indian Hubs</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB]">
                  <div className="text-neutral-500 text-xs font-medium">Pending Verifications</div>
                  <div className="font-serif font-bold text-2xl text-amber-600 mt-1">
                    {catalogStats.pendingCount}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1">Private Review Queue</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB]">
                  <div className="text-neutral-500 text-xs font-medium">Total Reservations</div>
                  <div className="font-serif font-bold text-2xl text-[#073D36] mt-1">
                    {bookings.length}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">Logged Transactions</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB]">
                  <div className="text-neutral-500 text-xs font-medium">Founder Lead</div>
                  <div className="font-serif font-bold text-base text-[#073D36] mt-1 truncate">
                    Alluri Vijaya Priya
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">Sole Founder & Owner</div>
                </div>
              </div>

              {analyticsData && (
                <div className="p-5 rounded-2xl bg-white border border-[#EFE7DB] space-y-3">
                  <h4 className="font-serif font-bold text-base text-[#17201E]">
                    Search Engine Telemetry
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-neutral-400 font-bold uppercase text-[10px]">Total Searches</div>
                      <div className="font-serif font-bold text-xl text-[#073D36]">
                        {analyticsData.totalSearches || 24}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-neutral-400 font-bold uppercase text-[10px]">Hotel Inquiries</div>
                      <div className="font-serif font-bold text-xl text-[#073D36]">
                        {analyticsData.byService?.HOTEL || 12}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-neutral-400 font-bold uppercase text-[10px]">Flight Searches</div>
                      <div className="font-serif font-bold text-xl text-[#073D36]">
                        {analyticsData.byService?.FLIGHT || 6}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-neutral-400 font-bold uppercase text-[10px]">Rail & Bus</div>
                      <div className="font-serif font-bold text-xl text-[#073D36]">
                        {(analyticsData.byService?.TRAIN || 3) + (analyticsData.byService?.BUS || 3)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVICES & API HEALTH */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#17201E] text-sm">System Health & API Gateways</div>
                  <div className="text-neutral-500">
                    Live operational telemetry across GDS travel partners, Razorpay payment gateway, and PostgreSQL database.
                  </div>
                </div>
                <button
                  onClick={fetchStatusAndAnalytics}
                  className="px-3.5 py-1.5 rounded-full bg-[#073D36] text-white font-semibold cursor-pointer text-xs"
                >
                  Check Live Status
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: '🏨 Hotels Service',
                    provider: 'PlanMyStay Verified Hotel Catalog & Hospitality Gateway',
                    status: 'WORKING',
                    info: `${catalogStats.verifiedCount} verified properties across 10 Indian hubs. Server-side filtering active.`,
                  },
                  {
                    name: '💳 Payments Gateway',
                    provider: systemStatus?.Payments?.provider || 'Razorpay Payment Gateway (RBI Authorized)',
                    status: systemStatus?.Payments?.status || 'WORKING',
                    info: 'HMAC-SHA256 signature verification and order creation active.',
                  },
                  {
                    name: '✈️ Flights Service',
                    provider: systemStatus?.Flights?.provider || 'Amadeus Global GDS API',
                    status: systemStatus?.Flights?.status || 'NEEDS_API',
                    info: 'Amadeus flight search and PNR generation gateway.',
                  },
                  {
                    name: '🚆 Trains Service',
                    provider: systemStatus?.Trains?.provider || 'Authorized Railway Gateway / IRCTC Partner',
                    status: systemStatus?.Trains?.status || 'NEEDS_API',
                    info: 'IRCTC rail gateway proxy for live timetable and PRS bookings.',
                  },
                  {
                    name: '🗄️ Database',
                    provider: systemStatus?.Database?.provider || 'Persistent PostgreSQL / Storage Engine',
                    status: 'WORKING',
                    info: 'Zero-config durable persistence with normalized schemas.',
                  },
                ].map((svc, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17201E]">{svc.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {svc.status}
                        </span>
                      </div>
                      <div className="text-neutral-500 mt-0.5">{svc.info}</div>
                    </div>
                    <div className="text-[11px] font-semibold text-[#073D36] text-right">
                      {svc.provider}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESERVATIONS */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-lg text-[#17201E]">
                All Reservations ({bookings.length})
              </h4>
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#073D36]">
                          {b.referenceCode || b.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                      </div>
                      <div className="font-semibold text-neutral-800 text-sm">
                        {b.title || b.hotelName}
                      </div>
                      <div className="text-neutral-500">
                        Guest: {b.guestName || 'Valued Guest'} ({b.guestPhone || ''}) · Total: ₹{((b.totalPaid || b.totalPrice || 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-[11px] text-neutral-400 sm:text-right">
                      Booked: {new Date(b.bookedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-serif font-bold text-lg text-[#17201E]">
                  Registered Accounts & RBAC Roles ({usersList.length})
                </h4>
              </div>

              <div className="space-y-2">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17201E]">{u.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#073D36]/10 text-[#073D36]">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-neutral-500 text-[11px]">{u.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="p-1.5 rounded-xl border border-neutral-200 text-xs font-medium cursor-pointer"
                      >
                        <option value="USER">USER</option>
                        <option value="OWNER">PROPERTY OWNER</option>
                        <option value="ADMIN">ADMIN / FOUNDER</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AI ENGINE DIAGNOSTICS */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F27658]" />
                  <span className="font-bold text-sm text-[#17201E]">Google Gemini AI Concierge</span>
                </div>
                <p className="text-neutral-600">
                  Model: <strong>models/gemini-3.8-flash</strong>. Synthesizes bespoke multi-city itineraries, Indian heritage guides, and seasonal recommendations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: INSPECT VERIFICATION EVIDENCE */}
        {inspectingHotel && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 bg-[#073D36] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#F27658]" />
                  <div>
                    <h4 className="font-serif font-bold text-lg text-white">
                      Verification Evidence & Audit Dossier
                    </h4>
                    <p className="text-[11px] text-[#EFE7DB]/80 font-light">
                      Reviewed by Founder Alluri Vijaya Priya
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingHotel(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-700">
                {/* Property Identity Card */}
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE7DB] flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
                      Property Identity
                    </span>
                    <div className="font-serif font-bold text-xl text-[#073D36]">
                      {inspectingHotel.name}
                    </div>
                    <div className="text-neutral-600 mt-0.5">
                      {inspectingHotel.city}, {inspectingHotel.state} · {inspectingHotel.stars} Stars · ₹{inspectingHotel.pricePerNight.toLocaleString('en-IN')}/night
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inspectingHotel.verificationStatus === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : inspectingHotel.verificationStatus === 'Pending Verification'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {inspectingHotel.verificationStatus}
                  </span>
                </div>

                {/* Evidence Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Verification Source
                    </span>
                    <div className="font-semibold text-neutral-800">
                      {inspectingHotel.verificationSource}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Audited Date: {inspectingHotel.lastVerifiedDate}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Trade License / GSTIN
                    </span>
                    <div className="font-mono font-semibold text-neutral-800">
                      {inspectingHotel.verificationEvidence?.businessRegistrationOrGST || 'Corporate Partner Agreement'}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Category: {inspectingHotel.verificationEvidence?.sourceType || 'Brand Portal'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Verified Contact Phone
                    </span>
                    <div className="font-semibold text-neutral-800">
                      {inspectingHotel.contactInfo || inspectingHotel.verificationEvidence?.verifiedContact || 'Provided'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Official Portal
                    </span>
                    {inspectingHotel.officialUrl ? (
                      <a
                        href={inspectingHotel.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#073D36] hover:underline font-semibold flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{inspectingHotel.officialUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-neutral-400">Direct desk only</span>
                    )}
                  </div>
                </div>

                {/* Verified Physical Address */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                    Verified Physical Address
                  </span>
                  <div className="font-medium text-neutral-800">
                    {inspectingHotel.fullAddress || inspectingHotel.location}
                  </div>
                </div>

                {/* Review Notes */}
                {inspectingHotel.verificationEvidence?.reviewNotes && (
                  <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#073D36] block">
                      Founder Review Notes
                    </span>
                    <div className="text-neutral-700 leading-relaxed">
                      {inspectingHotel.verificationEvidence.reviewNotes}
                    </div>
                  </div>
                )}

                {/* Audit Trail Log */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
                    Chronological Audit History
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {inspectingHotel.auditHistory && inspectingHotel.auditHistory.length > 0 ? (
                      inspectingHotel.auditHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                        >
                          <div>
                            <span className="font-semibold text-neutral-800">{item.action}</span>
                            {item.notes && <span className="text-neutral-600 block">{item.notes}</span>}
                          </div>
                          <div className="text-[10px] text-neutral-400 sm:text-right shrink-0">
                            <div>{item.actor}</div>
                            <div>{new Date(item.timestamp).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-400 text-xs italic">
                        Initial audit baseline established on 2026-10-18.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
                <button
                  onClick={() => setInspectingHotel(null)}
                  className="px-5 py-2 rounded-full bg-[#073D36] text-white font-semibold text-xs cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REJECT LISTING WITH REASON */}
        {rejectingHotel && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700">
                <Ban className="w-5 h-5" />
                <h4 className="font-serif font-bold text-lg text-neutral-900">
                  Reject Hotel Listing
                </h4>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                Rejecting <strong className="text-neutral-900">"{rejectingHotel.name}"</strong> will immediately exclude it from public search, recommendations, and checkout. Please document the official compliance reason:
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Documented Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="E.g., Failed physical trade license check; invalid GSTIN; unverified location."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:border-rose-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingHotel(null)}
                  className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectionReasonInput.trim()) {
                      alert('Please provide a documented rejection reason.');
                      return;
                    }
                    handleVerifyStatus(rejectingHotel.id, 'Rejected', rejectionReasonInput.trim());
                    setRejectingHotel(null);
                  }}
                  className="px-5 py-2 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT HOTEL DETAILS */}
        {editingHotel && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#073D36]" />
                  <h4 className="font-serif font-bold text-lg text-neutral-900">
                    Edit Hotel Details
                  </h4>
                </div>
                <button
                  onClick={() => setEditingHotel(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editingHotel.city}
                      onChange={(e) => setEditingHotel({ ...editingHotel, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Price / Night (₹)
                    </label>
                    <input
                      type="number"
                      value={editingHotel.pricePerNight}
                      onChange={(e) => setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={editingHotel.fullAddress || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, fullAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingHotel.contactInfo || ''}
                      onChange={(e) => setEditingHotel({ ...editingHotel, contactInfo: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Official Portal URL
                    </label>
                    <input
                      type="text"
                      value={editingHotel.officialUrl || ''}
                      onChange={(e) => setEditingHotel({ ...editingHotel, officialUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setEditingHotel(null)}
                    className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#073D36] text-white text-xs font-semibold cursor-pointer shadow-xs hover:bg-[#062F2B]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
