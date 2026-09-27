import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory data storage for stateful mock persistence
let bookingsStore: any[] = [
  {
    id: 'PMS-HYD-84920',
    hotelId: 'itc-kakatiya',
    hotelName: 'ITC Kakatiya',
    hotelImage: '/src/assets/images/hotel_pool_resort_1790355038564.jpg',
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
    paymentId: 'pay_rzp_mock_982341'
  }
];

let currentUser = {
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
    hotelClass: '5-Star Luxury & Heritage'
  }
};

let userWallet = {
  balance: 2500,
  credits: [
    { id: 'cr-1', amount: 1500, desc: 'Welcome bonus credit', date: '2026-09-01', type: 'credit' },
    { id: 'cr-2', amount: 1000, desc: 'Founder referral bonus', date: '2026-09-15', type: 'credit' }
  ],
  coupons: [
    { code: 'STAY2026', discount: '15% OFF', desc: 'Flat 15% off on all handpicked stays up to ₹2,500', expiry: '31 Dec 2026' },
    { code: 'WELCOME500', discount: '₹500 OFF', desc: 'Instant ₹500 discount on your next flight or hotel booking', expiry: '30 Nov 2026' },
    { code: 'LUXURYWAY', discount: '20% OFF', desc: 'Special festive discount for Taj and ITC heritage stays', expiry: '31 Oct 2026' }
  ]
};

// Gemini Client initialization
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ------------------- API ROUTES -------------------

// Current user profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({ user: currentUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (email) {
    currentUser = {
      ...currentUser,
      email,
      name: name || currentUser.name,
      avatar: (name || email).slice(0, 2).toUpperCase()
    };
  }
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const { name, phone, preferences } = req.body;
  currentUser = {
    ...currentUser,
    name: name || currentUser.name,
    phone: phone || currentUser.phone,
    preferences: preferences || currentUser.preferences
  };
  res.json({ success: true, user: currentUser });
});

// Wallet
app.get('/api/wallet', (req: Request, res: Response) => {
  res.json(userWallet);
});

app.post('/api/wallet/apply-coupon', (req: Request, res: Response) => {
  const { code } = req.body;
  const coupon = userWallet.coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase());
  if (coupon) {
    res.json({ valid: true, coupon });
  } else {
    res.status(400).json({ valid: false, message: 'Invalid or expired coupon code' });
  }
});

// Bookings
app.get('/api/bookings', (req: Request, res: Response) => {
  res.json({ bookings: bookingsStore });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const newBooking = {
    id: `PMS-${Date.now().toString().slice(-6)}`,
    ...req.body,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
  };
  bookingsStore.unshift(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

app.patch('/api/bookings/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = bookingsStore.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  booking.status = 'cancelled';
  res.json({ success: true, booking });
});

// Payment simulation
app.post('/api/payments/create-order', (req: Request, res: Response) => {
  const { amount, currency = 'INR', hotelName } = req.body;
  const orderId = `order_rzp_${Date.now()}`;
  res.json({
    orderId,
    amount,
    currency,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_planmystay2026',
    hotelName
  });
});

app.post('/api/payments/verify', (req: Request, res: Response) => {
  const { orderId, paymentId } = req.body;
  res.json({
    success: true,
    verified: true,
    paymentId: paymentId || `pay_${Date.now()}`,
    orderId
  });
});

// AI Trip Planner endpoint
app.post('/api/ai/trip-plan', async (req: Request, res: Response) => {
  const { destination, days = 4, travellers = 2, budget = '₹40,000', travelStyle = 'Luxury & Heritage', interests = ['Culture', 'Local Food'] } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  // Attempt using Gemini API if key is set
  if (aiClient) {
    try {
      const prompt = `You are PlanMyStay AI, an expert luxury and heritage Indian travel concierge for "PlanMyStay.in" (India, Your Way).
Generate a highly structured, realistic and inspiring travel itinerary for:
- Destination: ${destination}
- Duration: ${days} Days
- Travellers: ${travellers}
- Total Target Budget: ${budget}
- Travel Style: ${travelStyle}
- Preferred Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}

Return a valid JSON object matching this schema:
{
  "destination": "${destination}",
  "duration": "${days} Days",
  "budgetSummary": "Detailed budget note in INR ₹",
  "travelStyle": "${travelStyle}",
  "overview": "2-3 sentences evoking the sights, sounds, and spirit of the destination",
  "recommendedTransport": "How to get there and best local transit",
  "days": [
    {
      "day": 1,
      "title": "Short poetic day title",
      "theme": "Theme of the day",
      "morning": "Morning activity & spot",
      "afternoon": "Afternoon exploration & lunch spot",
      "evening": "Sunset/evening experience & dinner",
      "recommendedStays": ["2 authentic hotel names in ${destination}"],
      "diningSpots": ["2 iconic restaurants or cafes"],
      "estimatedCost": "₹X,XXX for day"
    }
  ],
  "localInsiderTips": ["3 practical tips regarding weather, dress code, booking, local transport"]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      const parsedPlan = JSON.parse(responseText);
      return res.json({ success: true, plan: parsedPlan, source: 'gemini' });
    } catch (err: any) {
      console.warn('Gemini API call warning, falling back to curated itinerary:', err?.message || err);
      // Fallback gracefully below
    }
  }

  // Curated high-fidelity fallback generator if offline or rate-limited
  const fallbackPlan = {
    destination,
    duration: `${days} Days`,
    budgetSummary: `Estimated ₹${budget.toString().replace(/[^0-9]/g, '') || '35,000'} covering premium stays, curated private transfers, and gastronomic dining.`,
    travelStyle,
    overview: `Experience the soulful majesty of ${destination}. From sunlit courtyards and heritage avenues to world-class hospitality, this personalized itinerary balances unhurried leisure with authentic local discovery.`,
    recommendedTransport: `Fly into the nearest airport or take the Vande Bharat Express. Book chauffeur-driven prepaid sedans for effortless inter-city sightseeing.`,
    days: Array.from({ length: Math.min(Number(days) || 3, 5) }).map((_, i) => ({
      day: i + 1,
      title: i === 0 ? `Arrival & Sunset Reflections` : i === 1 ? `Palace Walks & Royal Cuisine` : i === 2 ? `Artisan Quarters & Hidden Cafes` : `Panoramic Overlooks & Farewell Flavors`,
      theme: i === 0 ? `Unwinding into the rhythm of the city` : i === 1 ? `Living heritage and royal banquets` : `Handicrafts and twilight serenity`,
      morning: `Begin with a leisurely breakfast at the hotel, followed by a private guided walk through historic landmarks and tranquil courtyards.`,
      afternoon: `Savor an authentic thali lunch highlighting regional spices, followed by an afternoon artisan workshop and silk / spice bazaars.`,
      evening: `Watch the sunset over water or historic ramparts, followed by an alfresco candlelit dinner with regional live instrumental sitar music.`,
      recommendedStays: [`Taj Heritage Retreat ${destination}`, `ITC Luxury Suites ${destination}`],
      diningSpots: [`The Royal Pavilion Kitchen`, `Chai & Spice Veranda`],
      estimatedCost: `₹${(6500 + i * 800).toLocaleString('en-IN')}`,
    })),
    localInsiderTips: [
      `Pre-book heritage monument tickets online through ASI portal to skip daytime queues.`,
      `Carry light cotton attire for daytime and a light pashmina for cooler heritage evenings.`,
      `Ask your hotel concierge to arrange verified prepaid taxis for early morning excursions.`
    ]
  };

  res.json({ success: true, plan: fallbackPlan, source: 'curated' });
});

// Start server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlanMyStay.in server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
