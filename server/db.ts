import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERIFIED_HOTELS_CATALOG } from '../src/data/verifiedHotels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database data file for zero-config persistence
const DB_FILE = path.resolve(__dirname, 'data_store.json');

export type HotelVerificationStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected'
  | 'Temporarily Unavailable'
  | 'Inactive';

export type BookingAuthorizationStatus =
  | 'Direct Booking Authorized'
  | 'Verified Informational Listing'
  | 'External Official Channel';

export interface DBHotel {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  distanceCentre: string;
  stars: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  breakfastIncluded: boolean;
  isPick?: boolean;
  isFeatured?: boolean;
  brand?: string;
  fullAddress?: string;
  contactInfo?: string;
  officialUrl?: string;
  verificationStatus: HotelVerificationStatus;
  verificationSource: string;
  lastVerifiedDate: string;
  bookingAuthorized: boolean;
  bookingStatus: BookingAuthorizationStatus;
  rejectionReason?: string;
  verificationEvidence?: {
    sourceUrl?: string;
    sourceType?: string;
    businessRegistrationOrGST?: string;
    verifiedContact?: string;
    verifiedAddress?: string;
    officialWebsite?: string;
    reviewedBy?: string;
    reviewNotes?: string;
    verifiedDate?: string;
  };
  auditHistory?: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    previousStatus?: string;
    newStatus?: string;
    notes?: string;
  }>;
  images: string[];
  description: string;
  amenities: string[];
  neighborhood: string;
  rooms: any[];
}

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  title?: string;
  avatar?: string;
  phone?: string;
  emailStatus?: string;
  preferences?: {
    mealPref: string;
    seatPref: string;
    hotelClass: string;
  };
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt: string;
}

export interface DBTravelStats {
  userId: string;
  totalTrips: number;
  currentStreak: number;
  longestStreak: number;
  lastTripDate?: string;
}

export interface DBTravelAchievement {
  id: string;
  userId: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  unlockedAt: string;
}

export interface DBTravelMemory {
  id: string;
  userId: string;
  bookingId?: string;
  destination: string;
  travelDate: string;
  caption: string;
  photoUrl: string;
  tags?: string[];
  createdAt: string;
}

export interface DBBooking {
  id: string;
  userId: string;
  serviceType: 'HOTEL' | 'FLIGHT' | 'TRAIN' | 'BUS';
  title: string;
  subtitle: string;
  referenceCode: string; // PNR or Reservation #
  isDemo?: boolean;
  bookingType?: 'DEMO' | 'LIVE';
  details: any;
  passengers: Array<{
    name: string;
    age?: number;
    gender?: string;
    idNumber?: string;
    seatBerth?: string;
  }>;
  checkInOrDeparture: string;
  checkOutOrArrival?: string;
  amount: number;
  tax: number;
  totalPaid: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  bookedAt: string;
  paymentMethod: string;
  paymentId?: string;
}

export interface DBSearchLog {
  id: string;
  service: 'HOTEL' | 'FLIGHT' | 'TRAIN' | 'BUS';
  from?: string;
  to?: string;
  date?: string;
  query?: string;
  timestamp: string;
}

interface DBSchema {
  users: DBUser[];
  bookings: DBBooking[];
  searches: DBSearchLog[];
  travelStats: Record<string, DBTravelStats>;
  achievements: DBTravelAchievement[];
  travelAlbum: DBTravelMemory[];
  hotels: DBHotel[];
}

function loadDB(): DBSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.travelStats) parsed.travelStats = {};
      if (!parsed.achievements) parsed.achievements = [];
      if (!parsed.travelAlbum) parsed.travelAlbum = [];
      if (!parsed.hotels || !Array.isArray(parsed.hotels) || parsed.hotels.length === 0) {
        parsed.hotels = JSON.parse(JSON.stringify(VERIFIED_HOTELS_CATALOG));
      }
      if (Array.isArray(parsed.users)) {
        parsed.users.forEach((u: any) => {
          if (u.id === 'usr_founder_01') {
            u.name = 'Alluri Vijaya Priya';
            if (u.email === 'pranaviguntoju13@gmail.com') {
              u.email = 'founder@planmystay.in';
              u.emailStatus = 'AWAITING_FOUNDER_CONFIRMATION';
            }
          }
          if (!u.avatar) {
            u.avatar = u.name ? u.name.slice(0, 2).toUpperCase() : 'AP';
          }
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading DB_FILE, initializing fresh:', err);
  }

  // Initial seed with Founder Account
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultHash = crypto.pbkdf2Sync('PlanMyStay@2026', defaultSalt, 10000, 64, 'sha512').toString('hex');

  const initial: DBSchema = {
    users: [
      {
        id: 'usr_founder_01',
        name: 'Alluri Vijaya Priya',
        email: 'founder@planmystay.in',
        emailStatus: 'AWAITING_FOUNDER_CONFIRMATION',
        passwordHash: defaultHash,
        salt: defaultSalt,
        role: 'ADMIN',
        title: 'Founder & Managing Director',
        avatar: 'AP',
        phone: '+91 98490 12345',
        preferences: {
          mealPref: 'North Indian & Continental',
          seatPref: 'Window / Lower Berth',
          hotelClass: '5-Star Luxury & Heritage',
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_dev_01',
        name: 'Lead Developer',
        email: 'pranaviguntoju13@gmail.com',
        passwordHash: defaultHash,
        salt: defaultSalt,
        role: 'ADMIN',
        title: 'Authorized Technical Staff',
        avatar: 'LD',
        createdAt: new Date().toISOString(),
      },
    ],
    bookings: [
      {
        id: 'PMS-HYD-84920',
        userId: 'usr_founder_01',
        serviceType: 'HOTEL',
        title: 'ITC Kakatiya',
        subtitle: 'Executive Club Room · Hyderabad, Telangana',
        referenceCode: 'PMS-HTL-KAK-84920',
        isDemo: false,
        bookingType: 'LIVE',
        details: {
          hotelId: 'itc-kakatiya',
          hotelName: 'ITC Kakatiya',
          location: 'Hyderabad, Telangana',
          roomName: 'Executive Club Room',
          nights: 3,
          guests: 2,
        },
        passengers: [
          { name: 'Alluri Vijaya Priya', age: 28, gender: 'Female', idNumber: 'GOVT-ID-7849' },
          { name: 'Guest Companion', age: 29, gender: 'Male' },
        ],
        checkInOrDeparture: '2026-10-15',
        checkOutOrArrival: '2026-10-18',
        amount: 15600,
        tax: 2808,
        totalPaid: 18408,
        status: 'CONFIRMED',
        bookedAt: '2026-09-20T10:30:00.000Z',
        paymentMethod: 'Razorpay UPI (Verified)',
        paymentId: 'pay_PmsVerified_982341',
      },
    ],
    searches: [
      { id: 'srch_1', service: 'FLIGHT', from: 'Hyderabad (HYD)', to: 'Mumbai (BOM)', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'srch_2', service: 'HOTEL', query: 'Udaipur', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'srch_3', service: 'TRAIN', from: 'Secunderabad (SC)', to: 'Tirupati (TPTY)', timestamp: new Date(Date.now() - 10800000).toISOString() },
    ],
    travelStats: {
      usr_founder_01: {
        userId: 'usr_founder_01',
        totalTrips: 4,
        currentStreak: 3,
        longestStreak: 4,
        lastTripDate: '2026-09-20',
      },
    },
    achievements: [
      {
        id: 'ach_1',
        userId: 'usr_founder_01',
        code: 'FIRST_TRIP',
        title: 'First Voyage',
        description: 'Completed your first authentic journey with PlanMyStay',
        badgeIcon: '🌟',
        unlockedAt: '2026-06-12T10:00:00.000Z',
      },
      {
        id: 'ach_2',
        userId: 'usr_founder_01',
        code: '3_TRIPS',
        title: 'Explorer',
        description: 'Completed 3 memorable journeys across India',
        badgeIcon: '🚀',
        unlockedAt: '2026-08-15T14:30:00.000Z',
      },
      {
        id: 'ach_3',
        userId: 'usr_founder_01',
        code: 'FREQUENT_TRAVELLER',
        title: 'Frequent Traveller',
        description: 'Maintained 3+ consecutive trip streaks',
        badgeIcon: '🔥',
        unlockedAt: '2026-09-20T11:00:00.000Z',
      },
    ],
    travelAlbum: [
      {
        id: 'mem_1',
        userId: 'usr_founder_01',
        bookingId: 'PMS-HYD-84920',
        destination: 'Hyderabad, Telangana',
        travelDate: '2026-09-20',
        caption: 'Basking in the royal Nizami heritage and architecture at ITC Kakatiya.',
        photoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        tags: ['Heritage', 'Hyderabad', 'Architecture'],
        createdAt: '2026-09-21T08:00:00.000Z',
      },
      {
        id: 'mem_2',
        userId: 'usr_founder_01',
        destination: 'Udaipur, Rajasthan',
        travelDate: '2026-08-14',
        caption: 'Sunset across Lake Pichola watching the white marble palaces shimmer.',
        photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        tags: ['Lakes', 'Udaipur', 'Sunset'],
        createdAt: '2026-08-15T18:00:00.000Z',
      },
    ],
    hotels: JSON.parse(JSON.stringify(VERIFIED_HOTELS_CATALOG)),
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial DB file:', err);
  }

  return initial;
}

function saveDB(data: DBSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to DB_FILE:', err);
  }
}

// Database Helpers
export const db = {
  getUsers: () => loadDB().users,
  getUserById: (id: string) => loadDB().users.find((u) => u.id === id),
  getUserByEmail: (email: string) => loadDB().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (userData: Omit<DBUser, 'id' | 'createdAt'>) => {
    const data = loadDB();
    const newUser: DBUser = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveDB(data);
    return newUser;
  },
  updateUser: (id: string, updates: Partial<DBUser>) => {
    const data = loadDB();
    const idx = data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    data.users[idx] = { ...data.users[idx], ...updates };
    saveDB(data);
    return data.users[idx];
  },

  // ------------------- HOTELS & VERIFICATION CATALOG -------------------
  getPublicHotels: (filter?: {
    city?: string;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const data = loadDB();
    // STRICT REQUIREMENT: Only hotels with verificationStatus === 'Verified' appear in public catalog!
    let publicHotels = (data.hotels || []).filter((h) => h.verificationStatus === 'Verified');

    if (filter?.city && filter.city.trim() !== '' && filter.city.toLowerCase() !== 'all') {
      const c = filter.city.trim().toLowerCase();
      publicHotels = publicHotels.filter(
        (h) =>
          h.city.toLowerCase().includes(c) ||
          h.location.toLowerCase().includes(c) ||
          h.state.toLowerCase().includes(c)
      );
    }

    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.trim().toLowerCase();
      publicHotels = publicHotels.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.neighborhood.toLowerCase().includes(q) ||
          (h.brand && h.brand.toLowerCase().includes(q))
      );
    }

    if (filter?.brand && filter.brand.trim() !== '' && filter.brand.toLowerCase() !== 'all') {
      const b = filter.brand.trim().toLowerCase();
      publicHotels = publicHotels.filter((h) => h.brand && h.brand.toLowerCase() === b);
    }

    if (filter?.minPrice !== undefined) {
      publicHotels = publicHotels.filter((h) => h.pricePerNight >= (filter.minPrice || 0));
    }
    if (filter?.maxPrice !== undefined) {
      publicHotels = publicHotels.filter((h) => h.pricePerNight <= filter.maxPrice!);
    }

    return publicHotels;
  },

  getAllAdminHotels: () => {
    const data = loadDB();
    const hotels = data.hotels || [];
    const stats = {
      total: hotels.length,
      verifiedCount: hotels.filter((h) => h.verificationStatus === 'Verified').length,
      pendingCount: hotels.filter((h) => h.verificationStatus === 'Pending Verification').length,
      rejectedCount: hotels.filter((h) => h.verificationStatus === 'Rejected').length,
      temporarilyUnavailableCount: hotels.filter((h) => h.verificationStatus === 'Temporarily Unavailable').length,
      inactiveCount: hotels.filter((h) => h.verificationStatus === 'Inactive').length,
      directBookingAuthorizedCount: hotels.filter((h) => h.verificationStatus === 'Verified' && h.bookingAuthorized).length,
      informationalOnlyCount: hotels.filter((h) => h.verificationStatus === 'Verified' && !h.bookingAuthorized).length,
    };
    return { hotels, stats };
  },

  getHotelById: (id: string) => {
    const data = loadDB();
    return (data.hotels || []).find((h) => h.id === id) || null;
  },

  verifyHotel: (
    id: string,
    newStatus: HotelVerificationStatus,
    actor: string = 'Founder: Alluri Vijaya Priya',
    notes?: string,
    rejectionReason?: string
  ) => {
    const data = loadDB();
    const idx = (data.hotels || []).findIndex((h) => h.id === id);
    if (idx === -1) return null;

    const current = data.hotels[idx];
    const prevStatus = current.verificationStatus;
    current.verificationStatus = newStatus;
    current.lastVerifiedDate = new Date().toISOString().split('T')[0];

    if (newStatus === 'Rejected') {
      current.rejectionReason = rejectionReason || 'Property verification failed during administrative review.';
      current.bookingAuthorized = false;
    } else if (newStatus === 'Verified') {
      current.rejectionReason = undefined;
    } else if (newStatus === 'Temporarily Unavailable' || newStatus === 'Inactive') {
      current.bookingAuthorized = false;
    }

    if (!current.auditHistory) current.auditHistory = [];
    current.auditHistory.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      action: `STATUS_CHANGED_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      previousStatus: prevStatus,
      newStatus,
      notes: notes || `Verification status updated to ${newStatus} by ${actor}`,
    });

    saveDB(data);
    return current;
  },

  setBookingAuthorization: (
    id: string,
    authorized: boolean,
    actor: string = 'Founder: Alluri Vijaya Priya',
    notes?: string
  ) => {
    const data = loadDB();
    const idx = (data.hotels || []).findIndex((h) => h.id === id);
    if (idx === -1) return null;

    const current = data.hotels[idx];
    current.bookingAuthorized = authorized;
    current.bookingStatus = authorized ? 'Direct Booking Authorized' : 'Verified Informational Listing';

    if (!current.auditHistory) current.auditHistory = [];
    current.auditHistory.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      action: authorized ? 'DIRECT_BOOKING_AUTHORIZED' : 'RESTRICTED_TO_INFORMATIONAL',
      notes: notes || `Booking authorization toggled to ${authorized ? 'ENABLED' : 'DISABLED'} by ${actor}`,
    });

    saveDB(data);
    return current;
  },

  createHotel: (hotelData: Partial<DBHotel>, actor: string = 'Founder: Alluri Vijaya Priya') => {
    const data = loadDB();
    if (!data.hotels) data.hotels = [];

    // Check duplicate listing
    const duplicate = data.hotels.find(
      (h) =>
        (h.name.toLowerCase().trim() === hotelData.name?.toLowerCase().trim() &&
          h.city.toLowerCase().trim() === hotelData.city?.toLowerCase().trim()) ||
        (hotelData.id && h.id === hotelData.id)
    );

    if (duplicate) {
      throw new Error(`A hotel record for "${hotelData.name}" in ${hotelData.city} already exists (ID: ${duplicate.id}). Duplicate listings are prevented.`);
    }

    const defaultImages = [
      '/src/assets/images/hotel_modern_luxury_1790355051422.jpg',
      '/src/assets/images/hotel_pool_resort_1790355038564.jpg',
    ];

    const newId = hotelData.id || `htl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newHotel: DBHotel = {
      id: newId,
      name: hotelData.name || 'New Property',
      location: hotelData.location || `${hotelData.city || 'Hyderabad'}, India`,
      city: hotelData.city || 'Hyderabad',
      state: hotelData.state || 'Telangana',
      distanceCentre: hotelData.distanceCentre || '1.0 km from centre',
      stars: hotelData.stars || 4,
      rating: hotelData.rating || 4.3,
      reviewCount: hotelData.reviewCount || 10,
      pricePerNight: Number(hotelData.pricePerNight) || 3500,
      breakfastIncluded: hotelData.breakfastIncluded ?? true,
      brand: hotelData.brand || 'Independent',
      fullAddress: hotelData.fullAddress || '',
      contactInfo: hotelData.contactInfo || '',
      officialUrl: hotelData.officialUrl || '',
      verificationStatus: hotelData.verificationStatus || 'Pending Verification',
      verificationSource: hotelData.verificationSource || 'Administrative Submission',
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      bookingAuthorized: Boolean(hotelData.bookingAuthorized),
      bookingStatus: hotelData.bookingAuthorized
        ? 'Direct Booking Authorized'
        : 'Verified Informational Listing',
      images: hotelData.images && hotelData.images.length > 0 ? hotelData.images : defaultImages,
      description: hotelData.description || 'Verified accommodation listing.',
      amenities: hotelData.amenities || ['Free Wi-Fi', 'Complimentary Breakfast', 'Air Conditioning'],
      neighborhood: hotelData.neighborhood || `${hotelData.city || 'Central'} District`,
      rooms:
        hotelData.rooms && hotelData.rooms.length > 0
          ? hotelData.rooms
          : [
              {
                id: `r_${newId}_1`,
                name: 'Standard Room',
                type: 'Standard',
                price: Number(hotelData.pricePerNight) || 3500,
                bed: '1 Queen Bed',
                maxGuests: 2,
                sqft: 250,
                perks: ['Complimentary Breakfast', 'Wi-Fi'],
              },
            ],
      verificationEvidence: hotelData.verificationEvidence || {
        sourceType: 'Administrative Submission',
        reviewedBy: actor,
        reviewNotes: 'Newly cataloged property pending inspection.',
        verifiedDate: new Date().toISOString().split('T')[0],
      },
      auditHistory: [
        {
          id: `aud_${Date.now()}_1`,
          timestamp: new Date().toISOString(),
          actor,
          action: 'HOTEL_CREATED',
          notes: `Listing created with status: ${hotelData.verificationStatus || 'Pending Verification'} by ${actor}`,
        },
      ],
    };

    data.hotels.unshift(newHotel);
    saveDB(data);
    return newHotel;
  },

  updateHotel: (id: string, updates: Partial<DBHotel>, actor: string = 'Founder: Alluri Vijaya Priya') => {
    const data = loadDB();
    const idx = (data.hotels || []).findIndex((h) => h.id === id);
    if (idx === -1) return null;

    const current = data.hotels[idx];
    data.hotels[idx] = {
      ...current,
      ...updates,
      id: current.id, // Immutable ID
    };

    if (!data.hotels[idx].auditHistory) data.hotels[idx].auditHistory = [];
    data.hotels[idx].auditHistory!.unshift({
      id: `aud_${Date.now()}_upd`,
      timestamp: new Date().toISOString(),
      actor,
      action: 'DETAILS_UPDATED',
      notes: `Details modified by ${actor}`,
    });

    saveDB(data);
    return data.hotels[idx];
  },

  deleteHotel: (id: string, actor: string = 'Founder: Alluri Vijaya Priya') => {
    const data = loadDB();
    const idx = (data.hotels || []).findIndex((h) => h.id === id);
    if (idx === -1) return null;

    // Preserve records and audit history; do not permanently delete. Set status Inactive.
    const current = data.hotels[idx];
    const prevStatus = current.verificationStatus;
    current.verificationStatus = 'Inactive';
    current.bookingAuthorized = false;

    if (!current.auditHistory) current.auditHistory = [];
    current.auditHistory.unshift({
      id: `aud_${Date.now()}_del`,
      timestamp: new Date().toISOString(),
      actor,
      action: 'SOFT_EXCLUSION_INACTIVE',
      previousStatus: prevStatus,
      newStatus: 'Inactive',
      notes: `Soft de-listed by ${actor}; record and historic bookings preserved.`,
    });

    saveDB(data);
    return current;
  },

  // Bookings
  getBookings: (userId?: string) => {
    const all = loadDB().bookings;
    if (userId) return all.filter((b) => b.userId === userId);
    return all;
  },
  getBookingById: (id: string) => {
    const b = loadDB().bookings.find((b) => b.id === id);
    return b || null;
  },
  createBooking: (bookingData: Omit<DBBooking, 'id' | 'bookedAt'>) => {
    const data = loadDB();
    const isDemo = bookingData.isDemo === true;
    const refCode = bookingData.referenceCode || `PMS-${bookingData.serviceType.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: DBBooking = {
      ...bookingData,
      isDemo,
      bookingType: isDemo ? 'DEMO' : 'LIVE',
      referenceCode: refCode,
      id: `PMS-${bookingData.serviceType.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
      bookedAt: new Date().toISOString(),
    };
    data.bookings.unshift(newBooking);
    saveDB(data);
    return newBooking;
  },
  updateBookingStatus: (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING') => {
    const data = loadDB();
    const booking = data.bookings.find((b) => b.id === id);
    if (!booking) return null;
    booking.status = status;
    saveDB(data);
    return booking;
  },
  cancelBooking: (id: string) => {
    const data = loadDB();
    const booking = data.bookings.find((b) => b.id === id);
    if (!booking) return null;
    booking.status = 'CANCELLED';
    saveDB(data);
    return booking;
  },

  // Travel Streaks, Achievements & Stats
  getTravelStats: (userId: string) => {
    const data = loadDB();
    const stats = data.travelStats[userId] || {
      userId,
      totalTrips: 0,
      currentStreak: 0,
      longestStreak: 0,
    };

    // Calculate next milestone
    let nextMilestone = { target: 1, name: 'First Voyage (1 Trip)', remaining: 1 };
    if (stats.totalTrips >= 10) {
      nextMilestone = { target: 20, name: 'Legendary Voyager (20 Trips)', remaining: Math.max(0, 20 - stats.totalTrips) };
    } else if (stats.totalTrips >= 5) {
      nextMilestone = { target: 10, name: 'Centurion Traveler (10 Trips)', remaining: 10 - stats.totalTrips };
    } else if (stats.totalTrips >= 3) {
      nextMilestone = { target: 5, name: 'Heritage Connoisseur (5 Trips)', remaining: 5 - stats.totalTrips };
    } else if (stats.totalTrips >= 1) {
      nextMilestone = { target: 3, name: 'Explorer (3 Trips)', remaining: 3 - stats.totalTrips };
    }

    return {
      ...stats,
      nextMilestone,
    };
  },

  updateTravelStreakOnBooking: (userId: string) => {
    const data = loadDB();
    const current = data.travelStats[userId] || {
      userId,
      totalTrips: 0,
      currentStreak: 0,
      longestStreak: 0,
    };

    const newTotal = current.totalTrips + 1;
    const today = new Date().toISOString().split('T')[0];

    // Check if within 90 days
    let newStreak = 1;
    if (current.lastTripDate) {
      const diffDays = Math.round((new Date(today).getTime() - new Date(current.lastTripDate).getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 90) {
        newStreak = current.currentStreak + 1;
      }
    } else {
      newStreak = current.currentStreak > 0 ? current.currentStreak + 1 : 1;
    }

    const newLongest = Math.max(current.longestStreak, newStreak);

    data.travelStats[userId] = {
      userId,
      totalTrips: newTotal,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastTripDate: today,
    };

    // Check achievements
    const userAchs = data.achievements.filter((a) => a.userId === userId);
    const hasAch = (code: string) => userAchs.some((a) => a.code === code);

    if (newTotal >= 1 && !hasAch('FIRST_TRIP')) {
      data.achievements.push({
        id: `ach_${Date.now()}_1`,
        userId,
        code: 'FIRST_TRIP',
        title: 'First Voyage',
        description: 'Completed your first authentic journey with PlanMyStay',
        badgeIcon: '🌟',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (newTotal >= 3 && !hasAch('3_TRIPS')) {
      data.achievements.push({
        id: `ach_${Date.now()}_2`,
        userId,
        code: '3_TRIPS',
        title: 'Explorer',
        description: 'Completed 3 memorable journeys across India',
        badgeIcon: '🚀',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (newTotal >= 5 && !hasAch('5_TRIPS')) {
      data.achievements.push({
        id: `ach_${Date.now()}_3`,
        userId,
        code: '5_TRIPS',
        title: 'Heritage Connoisseur',
        description: 'Completed 5 luxury & cultural journeys',
        badgeIcon: '👑',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (newTotal >= 10 && !hasAch('10_TRIPS')) {
      data.achievements.push({
        id: `ach_${Date.now()}_4`,
        userId,
        code: '10_TRIPS',
        title: 'Centurion Traveler',
        description: 'Completed 10 comprehensive trips',
        badgeIcon: '🏆',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (newStreak >= 3 && !hasAch('FREQUENT_TRAVELLER')) {
      data.achievements.push({
        id: `ach_${Date.now()}_5`,
        userId,
        code: 'FREQUENT_TRAVELLER',
        title: 'Frequent Traveller',
        description: 'Maintained 3+ consecutive trip streaks',
        badgeIcon: '🔥',
        unlockedAt: new Date().toISOString(),
      });
    }

    saveDB(data);
    return data.travelStats[userId];
  },

  getAchievements: (userId: string) => {
    return loadDB().achievements.filter((a) => a.userId === userId);
  },

  // Travel Album (Memories)
  getTravelAlbum: (userId: string) => {
    return loadDB().travelAlbum.filter((m) => m.userId === userId);
  },

  createTravelMemory: (memory: Omit<DBTravelMemory, 'id' | 'createdAt'>) => {
    const data = loadDB();
    const newMemory: DBTravelMemory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.travelAlbum.unshift(newMemory);
    saveDB(data);
    return newMemory;
  },

  updateTravelMemory: (id: string, userId: string, updates: Partial<DBTravelMemory>) => {
    const data = loadDB();
    const idx = data.travelAlbum.findIndex((m) => m.id === id && m.userId === userId);
    if (idx === -1) return null;
    data.travelAlbum[idx] = { ...data.travelAlbum[idx], ...updates };
    saveDB(data);
    return data.travelAlbum[idx];
  },

  deleteTravelMemory: (id: string, userId: string) => {
    const data = loadDB();
    const initialLen = data.travelAlbum.length;
    data.travelAlbum = data.travelAlbum.filter((m) => !(m.id === id && m.userId === userId));
    saveDB(data);
    return data.travelAlbum.length < initialLen;
  },

  // Searches & Analytics
  logSearch: (search: Omit<DBSearchLog, 'id' | 'timestamp'>) => {
    const data = loadDB();
    const log: DBSearchLog = {
      ...search,
      id: `srch_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    data.searches.unshift(log);
    if (data.searches.length > 500) data.searches = data.searches.slice(0, 500);
    saveDB(data);
    return log;
  },
  getSearches: () => loadDB().searches,
};

// Password Utilities
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}
