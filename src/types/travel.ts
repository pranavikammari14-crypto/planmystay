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
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  hotelLocation: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  addOns?: string[];
  basePrice: number;
  taxPrice: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  bookedAt: string;
  paymentMethod: string;
  paymentId?: string;
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
  role: 'USER' | 'ADMIN';
  title: string;
  avatar: string;
  phone?: string;
  preferences?: {
    mealPref: string;
    seatPref: string;
    hotelClass: string;
  };
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
