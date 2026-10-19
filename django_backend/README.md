# PlanMyStay.in — Django REST Framework Production Backend

Production-ready, secure Python Django backend with Django REST Framework (DRF), PostgreSQL support, Razorpay payment processing, and strict Role-Based Access Control (RBAC) for the PlanMyStay luxury travel platform.

---

## 1. System Architecture

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS (hosted on Vercel)
- **Backend API**: Python 3.10+ / Django 5.x / Django REST Framework
- **Database**: PostgreSQL (Production) / SQLite (Local testing & CI)
- **Payment Gateway**: Razorpay (RBI Authorized UPI, Cards, NetBanking with HMAC-SHA256 signature verification)
- **Security**: Django PBKDF2 Password Hashing, DRF Token Authentication, CORS headers, Row-level Locks (`select_for_update`) for double-booking prevention, Rate Limiting, Private-by-Default photo album storage.

---

## 2. Directory Structure

```
django_backend/
├── manage.py
├── requirements.txt
├── Dockerfile
├── Procfile
├── render.yaml
├── railway.json
├── gunicorn.conf.py
├── .env.example
├── planmystay/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── accounts/          # User registration, Auth tokens, RBAC roles (USER, OWNER, ADMIN)
│   ├── hotels/            # Multi-tenant hotel management, rooms, admin approval workflow
│   ├── bookings/          # Atomic reservations, double-booking prevention, refund engine
│   ├── payments/          # Razorpay order generation, signature verification, webhooks
│   ├── travel_album/      # Travel streaks, gamified badges, private-by-default photo album
│   ├── travel_services/   # Secure proxy gateway for Amadeus, IRCTC, and Bus aggregator APIs
│   └── analytics/         # Real-time search trend telemetry & booking revenue metrics
└── tests/                 # Comprehensive 14-test verification suite
```

---

## 3. Quickstart & Local Setup

### Step 1: Install Dependencies
```bash
cd django_backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 3: Run Database Migrations
```bash
python manage.py makemigrations accounts hotels bookings payments travel_album analytics
python manage.py migrate
```

### Step 4: Seed Verified Hotels & Initialize Founder Account
```bash
# Seed initial verified Indian luxury hotels (flagged with is_sample_data=True)
python manage.py seed_verified_hotels

# Initialize the founder administrator account securely
python manage.py setup_founder --email "founder@planmystay.in" --name "Alluri Vijaya Priya"
```

### Step 5: Run Automated Tests
```bash
python manage.py test tests -v 2
```

### Step 6: Start Local Django Development Server
```bash
python manage.py runserver 8000
```
API Root: `http://localhost:8000/api/system/status`
Admin Dashboard: `http://localhost:8000/admin/`

---

## 4. Production Deployment Instructions

### A. Deploy Django Backend to Render (Recommended)
1. Fork or push this repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint** and select `django_backend/render.yaml` (or create a **Web Service** manually).
4. Connect a **Render PostgreSQL Database**.
5. Set environment variables in the Render Dashboard:
   - `DEBUG`: `False`
   - `SECRET_KEY`: `<generate-a-strong-secret-key>`
   - `DATABASE_URL`: `<postgres-connection-string>`
   - `ALLOWED_HOSTS`: `your-service.onrender.com,api.planmystay.in`
   - `CORS_ALLOWED_ORIGINS`: `https://planmystay.vercel.app,https://planmystay.in`
   - `RAZORPAY_KEY_ID`: `<your-razorpay-key-id>`
   - `RAZORPAY_KEY_SECRET`: `<your-razorpay-key-secret>`
   - `RAZORPAY_WEBHOOK_SECRET`: `<your-razorpay-webhook-secret>`
6. Deploy! Render will build dependencies, run `collectstatic`, run migrations, and launch Gunicorn.
7. Run the initial setup command from the Render Shell:
   ```bash
   python manage.py setup_founder --email "founder@planmystay.in"
   ```

### B. Deploy Django Backend to Railway
1. Sign in to [Railway](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Add a **PostgreSQL** plugin.
4. Set Root Directory to `django_backend` in Service Settings.
5. Railway automatically detects `railway.json` and `Procfile`.
6. Add the environment variables described above.

### C. Connect Vercel Frontend to Django Backend
1. Go to your Vercel Project Dashboard for PlanMyStay.
2. Navigate to **Settings** > **Environment Variables**.
3. Add or update:
   - `VITE_API_BASE_URL`: `https://your-django-backend.onrender.com` (or your custom domain `https://api.planmystay.in`)
4. Redeploy the frontend. All client requests in `src/` will communicate directly with your production Django REST API!

---

## 5. Environment Variables Reference

| Variable Name | Required | Default / Example | Purpose |
|---------------|----------|-------------------|---------|
| `DEBUG` | No | `False` | Production debug mode flag |
| `SECRET_KEY` | Yes (in Prod) | Generated secret | Django cryptographic signing key |
| `ALLOWED_HOSTS` | Yes (in Prod) | `api.planmystay.in,*.onrender.com` | Allowed Host headers |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://planmystay.vercel.app` | Permitted frontend origins |
| `DATABASE_URL` | Yes (in Prod) | `postgresql://user:pass@host:5432/db` | Production PostgreSQL connection |
| `RAZORPAY_KEY_ID` | Yes (for payments)| `rzp_test_...` or `rzp_live_...` | Public Razorpay key |
| `RAZORPAY_KEY_SECRET` | Yes (for payments)| Backend secret | Kept exclusively on backend |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Webhook signing key | Verifies `X-Razorpay-Signature` |
| `AMADEUS_CLIENT_ID` | Optional | Client ID | GDS Flight availability |
| `AMADEUS_CLIENT_SECRET` | Optional | Client Secret | GDS Flight credentials |
| `TRAIN_API_KEY` | Optional | API Key | IRCTC / Rail gateway |
| `BUS_API_KEY` | Optional | API Key | Bus aggregator gateway |
| `GEMINI_API_KEY` | Optional | API Key | AI Concierge trip synthesis |

---

## 6. Security & Concurrency Highlights

1. **Double-Booking Prevention**:
   Reservations use Django's `@transaction.atomic` combined with `select_for_update()` on the target `Room` record, calculating active reservations overlapping the requested check-in/check-out dates against `room.total_inventory`.
2. **Server-Side Price Validation**:
   Client-submitted booking amounts are never trusted. The server recalculates base room price * nights, adds selected add-ons, applies verified coupon discounts (`STAY2026`, `WELCOME500`), and computes 18% GST.
3. **Razorpay HMAC-SHA256 Signatures**:
   Payments are verified by generating `HMAC-SHA256(order_id + "|" + payment_id, secret)` and validating using constant-time comparison.
4. **Hotel Listing Approval**:
   Hotel owners can add listings which are tagged `PENDING` by default. Only platform administrators can approve and publish listings to public search.
5. **Private-by-Default Travel Album**:
   Uploaded travel photos are scoped strictly to the authenticated user ID and marked `is_private=True` by default to safeguard user privacy.
