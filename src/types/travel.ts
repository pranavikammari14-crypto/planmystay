export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  bed: string;
  maxGuests: number;
  sqft: number;
  perks: string[];
}

export type HotelVerificationStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected'
  | 'Temporarily Unavailable'
  | 'Inactive';

export type BookingAuthorizationStatus =
  | 'Direct Booking Authorized'
  | 'Verified Informational Listing'
  | 'External Official Channel'
  | 'Verified Indicative Rate'
  | 'Pending Property Verification'
  | 'Instant Confirmation'
  | (string & {});

export interface HotelVerificationEvidence {
  sourceUrl?: string;
  sourceType?: string;
  businessRegistrationOrGST?: string;
  verifiedContact?: string;
  verifiedAddress?: string;
  officialWebsite?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  verifiedDate?: string;
}

export interface HotelAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
}

export interface Hotel {
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
  images: string[];
  description: string;
  amenities: string[];
  neighborhood: string;
  rooms: Room[];

  // Strict Verification & Governance Fields
  verificationStatus?: HotelVerificationStatus;
  verificationSource?: string;
  lastVerifiedDate?: string;
  bookingAuthorized?: boolean;
  bookingStatus?: BookingAuthorizationStatus;
  rejectionReason?: string;
  verificationEvidence?: HotelVerificationEvidence;
  auditHistory?: HotelAuditEntry[];

  // Property Details & Contact
  brand?: string;
  fullAddress?: string;
  roomTypes?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  officialUrl?: string;
  imageUrl?: string;
  contactInfo?: string;
  ownerVerificationStatus?: string;
  isIndicativePrice?: boolean;
  isVerifiedInventory?: boolean;
  isOwnerSubmitted?: boolean;
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface Booking {
  id: string;
  serviceType?: 'HOTEL' | 'FLIGHT' | 'TRAIN' | 'BUS';
  title?: string;
  subtitle?: string;
  referenceCode?: string;
  hotelId?: string;
  hotelName?: string;
  hotelImage?: string;
  hotelLocation?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  checkInOrDeparture?: string;
  checkOutOrArrival?: string;
  nights?: number;
  guests?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  addOns?: string[];
  basePrice?: number;
  taxPrice?: number;
  totalPrice?: number;
  totalPaid?: number;
  status: 'confirmed' | 'cancelled' | 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  bookedAt: string;
  paymentMethod: string;
  paymentId?: string;
  isDemo?: boolean;
  bookingType?: 'DEMO' | 'LIVE';
  passengers?: any[];
  details?: any;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  cabin: string;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: {
    code: string;
    name: string;
    price: number;
    available: boolean;
  }[];
}

export interface Bus {
  id: string;
  operator: string;
  busType: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  rating: number;
  seatsLeft: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  title: string;
  avatar: string;
  phone?: string;
  preferences?: {
    mealPref: string;
    seatPref: string;
    hotelClass: string;
  };
}

export interface TravelStats {
  userId: string;
  totalTrips: number;
  currentStreak: number;
  longestStreak: number;
  lastTripDate?: string;
  nextMilestone: {
    target: number;
    name: string;
    remaining: number;
  };
}

export interface TravelAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  unlockedAt: string;
}

export interface TravelMemory {
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

export interface WalletState {
  balance: number;
  credits: {
    id: string;
    amount: number;
    desc: string;
    date: string;
    type: 'credit' | 'debit';
  }[];
  coupons: {
    code: string;
    discount: string;
    desc: string;
    expiry: string;
  }[];
}

export interface AITripDay {
  day: number;
  title: string;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  recommendedStays: string[];
  diningSpots: string[];
  estimatedCost: string;
}

export interface AITripPlan {
  destination: string;
  duration: string;
  budgetSummary: string;
  travelStyle: string;
  overview: string;
  days: AITripDay[];
  localInsiderTips: string[];
  recommendedTransport: string;
}
