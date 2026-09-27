# PlanMyStay.in — India, Your Way

A full-stack luxury and heritage Indian travel platform closely matching the official visual specification. Includes real-time hotel discovery, multi-modal transport search (Flights, Trains, Buses), AI-powered travel concierge powered by Gemini 3.8 Flash, instant booking flow with simulated Razorpay payment gateway, travel wallet, and admin dashboard.

---

## 1. Visual Design & Branding

- **Brand Name**: PlanMyStay.in
- **Positioning**: *India, Your Way*
- **Hero Title**: *Your journey Starts Here.* (Editorial serif italic styling)
- **Palette**:
  - Deep Forest Green: `#073D36`
  - Dark Green: `#062F2B`
  - Warm Cream Canvas: `#F7F1E8`
  - Soft Beige / Surface: `#EFE7DB`
  - Coral / Orange Accent: `#F27658`
  - Charcoal Text: `#17201E`
- **Typography**: Playfair Display (Editorial Display Serif) + Plus Jakarta Sans (Geometric Interface Sans)

---

## 2. Core Features

1. **Header Navigation**:
   - Clean top bar with PlanMyStay.in wordmark and brand insignia.
   - Profile avatar with dropdown for founder account (`Alluri Vijaya Priya, Founder account`).
   - Quick navigation to Stays, Flights, Trains, Buses, and Experience.

2. **Hero & Stats**:
   - Atmospheric twilight Indian palace resort background with dark green scrim overlay.
   - Prominent CTAs: *Start planning →* and *Plan with AI*.
   - Key stats: 50+ handpicked hotels, 4 ways to travel, 24/7 trip support.

3. **Multi-Modal Travel Search Module**:
   - **Flights**: One way, Round trip, Multi-city, direct routes toggle, traveller and class selection.
   - **Trains**: Vande Bharat, Rajdhani, and Shatabdi routes with verified classes (1A, 2A, 3A, CC).
   - **Buses**: Volvo Multi-Axle, BharatBenz sleepers, and luxury express coaches across Indian cities.
   - **Hotels**: Live search across 50 Indian stays with date pickers and guest counters.

4. **PlanMyStay AI Concierge (Floating Button & Drawer)**:
   - Sticky bottom-right floating pill button (`PlanMyStay AI`).
   - Tailored itinerary generation powered by **Gemini 3.8 Flash** (`gemini-3.8-flash`).
   - Generates structured day-by-day itineraries, morning/afternoon/evening schedules, recommended heritage stays, iconic local food spots, transit advice, and budget breakdowns in INR (₹).

5. **Curated Places Worth Staying**:
   - 50 featured Indian luxury and heritage stays (ITC Kakatiya, Taj Krishna, Taj Deccan, Le Méridien Hyderabad, Hyatt Hyderabad Gachibowli, The Westin Mindspace, Oberoi Bengaluru, ITC Gardenia, ITC Windsor, JW Marriott Bengaluru, Oberoi Mumbai, Taj Mahal Palace Mumbai, ITC Maratha, ITC Grand Central, Courtyard Kochi, ITC Narmada, Hyatt Regency Ahmedabad, Taj Lake Palace Udaipur, Oberoi Amarvilas Agra, Le Méridien New Delhi, Oberoi Grand Kolkata, and more).
   - Filter drawer with Price Slider, Star categories, Breakfast inclusion, and City selection.
   - Sorting by Recommended, Price Low to High, Price High to Low, and Highest Rating.

6. **Interactive Neighborhood Map ("Good Stays Know The Neighbourhood")**:
   - Dark forest green banner with interactive hotspot pins (Airport, Bandra West, Juhu Beach).
   - Instant filtering based on neighborhood choice.

7. **End-to-End Booking Flow**:
   - Room selection with sq.ft, bed type, and amenities.
   - Primary guest information & special requests.
   - Curated stay add-ons (Airport transfer, Buffet dinner, Late checkout).
   - Price breakdown with GST (18%) and promo code validation (`STAY2026`, `WELCOME500`).
   - Razorpay test checkout simulation with UPI, Card, and NetBanking.
   - Instant confirmed booking voucher with printable layout and automatic sync to "My trips".

8. **User Account Ecosystem**:
   - **My Trips**: Real-time management of upcoming and cancelled trips.
   - **Travel Wallet**: Available credit balance (₹2,500), referral bonuses, and one-click coupon copying.
   - **Settings**: Profile information, dining preferences, seat preferences, and hotel class selection.
   - **Admin Hub**: Property management, gross booking metrics, reservation logs, and AI query monitoring.

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Google Fonts
- **Backend**: Express server running on Node.js (via `tsx server.ts`)
- **AI Engine**: `@google/genai` TypeScript SDK utilizing `gemini-3.8-flash`
- **Database Schema**: Prisma ORM with PostgreSQL models (`prisma/schema.prisma`)
- **Payment Architecture**: Razorpay integration readiness

---

## 4. Local Development

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   DATABASE_URL="postgresql://user:password@localhost:5432/planmystay"
   RAZORPAY_KEY_ID="rzp_test_xxxx"
   RAZORPAY_KEY_SECRET="xxxx"
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`.

---

## 5. Deployment Instructions

### Deploy to Vercel
1. Push this repository to GitHub or GitLab.
2. In Vercel, click **New Project** and import the repository.
3. In **Build and Output Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel project settings:
   - `GEMINI_API_KEY`
   - `DATABASE_URL` (from Supabase or Neon PostgreSQL)
   - `RAZORPAY_KEY_ID`
5. Click **Deploy**.

### PostgreSQL Setup (Supabase / Neon)
1. Create a project at [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the Connection Pooling URL.
3. Run Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   npx tsx prisma/seed.ts
   ```
