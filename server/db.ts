import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database data file for zero-config persistence
const DB_FILE = path.resolve(__dirname, 'data_store.json');

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
}

function loadDB(): DBSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.travelStats) parsed.travelStats = {};
      if (!parsed.achievements) parsed.achievements = [];
      if (!parsed.travelAlbum) parsed.travelAlbum = [];
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
        email: 'pranaviguntoju13@gmail.com',
        passwordHash: defaultHash,
        salt: defaultSalt,
        role: 'ADMIN',
        title: 'Founder account',
        avatar: 'AP',
        phone: '+91 98490 12345',
        preferences: {
          mealPref: 'North Indian & Continental',
          seatPref: 'Window / Lower Berth',
          hotelClass: '5-Star Luxury & Heritage',
        },
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
        referenceCode: 'DEMO-HTL-KAK-84920',
        isDemo: true,
        bookingType: 'DEMO',
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
        paymentId: 'pay_rzp_mock_982341',
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

  // Bookings
  getBookings: (userId?: string) => {
    const all = loadDB().bookings.map((b) => ({
      ...b,
      isDemo: b.isDemo ?? true,
      bookingType: b.bookingType ?? 'DEMO',
      referenceCode: b.referenceCode.startsWith('DEMO-') ? b.referenceCode : `DEMO-${b.referenceCode}`,
    }));
    if (userId) return all.filter((b) => b.userId === userId);
    return all;
  },
  getBookingById: (id: string) => {
    const b = loadDB().bookings.find((b) => b.id === id);
    if (!b) return null;
    return {
      ...b,
      isDemo: b.isDemo ?? true,
      bookingType: b.bookingType ?? 'DEMO',
      referenceCode: b.referenceCode.startsWith('DEMO-') ? b.referenceCode : `DEMO-${b.referenceCode}`,
    };
  },
  createBooking: (bookingData: Omit<DBBooking, 'id' | 'bookedAt'>) => {
    const data = loadDB();
    const isDemo = bookingData.isDemo ?? true;
    const refCode = isDemo && !bookingData.referenceCode.startsWith('DEMO-')
      ? `DEMO-${bookingData.referenceCode}`
      : bookingData.referenceCode;

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
