-- =============================================================================
-- PlanMyStay.in (India, Your Way) - Production Supabase / PostgreSQL Migration
-- =============================================================================
-- Safe, idempotent schema setup for Authentication, Profiles, Roles,
-- Bookings, Travel Streaks, Achievements, Travel Album, and Property Owners.
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_service_type AS ENUM ('HOTEL', 'FLIGHT', 'TRAIN', 'BUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_type AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    phone TEXT,
    avatar_url TEXT,
    title TEXT DEFAULT 'Member account',
    meal_pref TEXT,
    seat_pref TEXT,
    hotel_class TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure public registration CANNOT create admin or owner directly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        'user', -- strictly defaults to user role
        COALESCE(new.raw_user_meta_data->>'avatar_url', upper(substring(COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 1, 2)))
    );
    
    -- Initialize travel statistics for the new user
    INSERT INTO public.travel_stats (user_id, total_trips, current_streak, longest_streak)
    VALUES (new.id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. TRAVEL STATS TABLE
CREATE TABLE IF NOT EXISTS public.travel_stats (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_trips INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_trip_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TRAVEL ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.travel_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_achievement UNIQUE(user_id, code)
);

-- 6. TRAVEL ALBUM TABLE (User Memories)
CREATE TABLE IF NOT EXISTS public.travel_album (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id TEXT,
    destination TEXT NOT NULL,
    travel_date DATE NOT NULL,
    caption TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. HOTELS & PROPERTIES TABLE (Supports Hotel Owner Role)
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    distance_centre TEXT,
    stars INTEGER NOT NULL DEFAULT 5,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 4.8,
    review_count INTEGER NOT NULL DEFAULT 0,
    price_per_night INTEGER NOT NULL,
    breakfast_included BOOLEAN NOT NULL DEFAULT true,
    description TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Deluxe',
    price INTEGER NOT NULL,
    bed TEXT NOT NULL DEFAULT '1 King Bed',
    max_guests INTEGER NOT NULL DEFAULT 2,
    sqft INTEGER NOT NULL DEFAULT 400,
    perks TEXT[] DEFAULT ARRAY['Free Breakfast', 'Wi-Fi']::TEXT[],
    is_available BOOLEAN NOT NULL DEFAULT true
);

-- 9. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_type booking_service_type NOT NULL DEFAULT 'HOTEL',
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    reference_code TEXT NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    booking_type TEXT NOT NULL DEFAULT 'LIVE',
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    check_in_or_departure TEXT NOT NULL,
    check_out_or_arrival TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    total_paid NUMERIC(10, 2) NOT NULL,
    status booking_status_type NOT NULL DEFAULT 'CONFIRMED',
    passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_method TEXT NOT NULL,
    payment_id TEXT,
    booked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. STREAK CALCULATION & ACHIEVEMENT TRIGGER
CREATE OR REPLACE FUNCTION public.on_booking_completed_update_streaks()
RETURNS trigger AS $$
DECLARE
    v_total_trips INTEGER;
    v_last_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_trip_date DATE;
BEGIN
    -- Only trigger on confirmed or completed bookings
    IF (NEW.status IN ('CONFIRMED', 'COMPLETED')) AND (NEW.user_id IS NOT NULL) THEN
        -- Get current stats
        SELECT total_trips, current_streak, longest_streak, last_trip_date
        INTO v_total_trips, v_current_streak, v_longest_streak, v_last_date
        FROM public.travel_stats
        WHERE user_id = NEW.user_id;

        IF NOT FOUND THEN
            v_total_trips := 0;
            v_current_streak := 0;
            v_longest_streak := 0;
        END IF;

        v_total_trips := v_total_trips + 1;
        v_trip_date := CURRENT_DATE;

        -- Streak logic: if previous trip was within last 90 days, increase streak; else reset to 1
        IF v_last_date IS NOT NULL AND (v_trip_date - v_last_date) <= 90 THEN
            v_current_streak := v_current_streak + 1;
        ELSE
            v_current_streak := 1;
        END IF;

        IF v_current_streak > v_longest_streak THEN
            v_longest_streak := v_current_streak;
        END IF;

        -- Update travel_stats
        INSERT INTO public.travel_stats (user_id, total_trips, current_streak, longest_streak, last_trip_date, updated_at)
        VALUES (NEW.user_id, v_total_trips, v_current_streak, v_longest_streak, v_trip_date, now())
        ON CONFLICT (user_id) DO UPDATE SET
            total_trips = EXCLUDED.total_trips,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak,
            last_trip_date = EXCLUDED.last_trip_date,
            updated_at = now();

        -- Check milestones
        -- 1. First Trip
        IF v_total_trips >= 1 THEN
            INSERT INTO public.travel_achievements (user_id, code, title, description, badge_icon)
            VALUES (NEW.user_id, 'FIRST_TRIP', 'First Voyage', 'Completed your first authentic journey with PlanMyStay', '🌟')
            ON CONFLICT (user_id, code) DO NOTHING;
        END IF;

        -- 2. 3 Trips
        IF v_total_trips >= 3 THEN
            INSERT INTO public.travel_achievements (user_id, code, title, description, badge_icon)
            VALUES (NEW.user_id, '3_TRIPS', 'Explorer', 'Completed 3 memorable journeys across India', '🚀')
            ON CONFLICT (user_id, code) DO NOTHING;
        END IF;

        -- 3. 5 Trips
        IF v_total_trips >= 5 THEN
            INSERT INTO public.travel_achievements (user_id, code, title, description, badge_icon)
            VALUES (NEW.user_id, '5_TRIPS', 'Heritage Connoisseur', 'Completed 5 luxury & cultural journeys', '👑')
            ON CONFLICT (user_id, code) DO NOTHING;
        END IF;

        -- 4. 10 Trips
        IF v_total_trips >= 10 THEN
            INSERT INTO public.travel_achievements (user_id, code, title, description, badge_icon)
            VALUES (NEW.user_id, '10_TRIPS', 'Centurion Traveler', 'Completed 10 comprehensive trips', '🏆')
            ON CONFLICT (user_id, code) DO NOTHING;
        END IF;

        -- 5. Frequent Traveller (Streak >= 3)
        IF v_current_streak >= 3 THEN
            INSERT INTO public.travel_achievements (user_id, code, title, description, badge_icon)
            VALUES (NEW.user_id, 'FREQUENT_TRAVELLER', 'Frequent Traveller', 'Kept an active 3+ consecutive trip streak', '🔥')
            ON CONFLICT (user_id, code) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_created_streak_trigger ON public.bookings;
CREATE TRIGGER on_booking_created_streak_trigger
    AFTER INSERT OR UPDATE ON public.bookings
    FOR EACH ROW EXECUTE PROCEDURE public.on_booking_completed_update_streaks();

-- =============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_album ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read/update their own; Admins can read all
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Travel Stats: Users can view own; Admins can view all
CREATE POLICY "Users can view own travel stats"
    ON public.travel_stats FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Achievements: Users can view own
CREATE POLICY "Users can view own achievements"
    ON public.travel_achievements FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Travel Album: Users only manage their own album memories
CREATE POLICY "Users can view own album"
    ON public.travel_album FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own album"
    ON public.travel_album FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own album"
    ON public.travel_album FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own album"
    ON public.travel_album FOR DELETE
    USING (auth.uid() = user_id);

-- Hotels: Public can view verified hotels; Owners can view & manage their own hotels; Admins can manage all
CREATE POLICY "Public can view verified hotels"
    ON public.hotels FOR SELECT
    USING (is_verified = true OR auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Owners can insert their own hotels"
    ON public.hotels FOR INSERT
    WITH CHECK (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Owners can update their own hotels"
    ON public.hotels FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Admins or owners can delete hotels"
    ON public.hotels FOR DELETE
    USING (auth.uid() = owner_id OR public.is_admin());

-- Bookings: Users view their own bookings; Hotel owners view bookings for their hotels; Admins view all
CREATE POLICY "Users can view own bookings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = user_id OR
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.hotels
            WHERE public.hotels.id = public.bookings.hotel_id
            AND public.hotels.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =============================================================================
-- 12. STORAGE BUCKET FOR TRAVEL ALBUM
-- =============================================================================
-- In Supabase dashboard: Create a public or authenticated bucket named 'travel-album'
-- with RLS rule: (bucket_id = 'travel-album' AND auth.uid() = (storage.foldername(name))[1])
