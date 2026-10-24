-- ============================================================
-- INLO ONEPASS - COMPLETE MASTER SUPABASE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Inlo — Production Database Schema & Seed Data (Supabase / Postgres)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ACTIVITIES TAXONOMY
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    icon VARCHAR(64) NOT NULL DEFAULT 'Activity',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_active_sort ON activities (is_active, sort_order);

-- ============================================================
-- 2. PARTNER ORGANIZATIONS (Venue Operators)
-- ============================================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. VENUES (Physical Facilities)
-- ============================================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
    slug VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    locality VARCHAR(128) NOT NULL,
    city VARCHAR(128) NOT NULL,
    postal_code VARCHAR(16) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(32) NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'pending_approval', 'approved', 'suspended')),
    featured BOOLEAN NOT NULL DEFAULT false,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    rules TEXT[] NOT NULL DEFAULT '{}',
    opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    phone VARCHAR(32),
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_status_locality ON venues (status, locality);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues (slug);

-- ============================================================
-- 4. VENUE OFFERINGS (Activities at Venues with Credit Pricing)
-- ============================================================
CREATE TABLE IF NOT EXISTS venue_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    credit_cost INTEGER NOT NULL CHECK (credit_cost > 0),
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    equipment_provided TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_venue_offering UNIQUE (venue_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_offerings_venue ON venue_offerings (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_offerings_activity ON venue_offerings (activity_id);

-- ============================================================
-- 5. PARTNER STAFF MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'partner_staff' CHECK (role IN ('partner_admin', 'partner_staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_partner_member UNIQUE (user_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_members_user ON partner_members (user_id);
CREATE INDEX IF NOT EXISTS idx_partner_members_partner ON partner_members (partner_id);

-- ============================================================
-- 6. AVAILABILITY SLOTS (Bookable Inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0 AND reserved_count <= capacity),
    credit_cost INTEGER NOT NULL CHECK (credit_cost > 0),
    booking_cutoff_minutes INTEGER NOT NULL DEFAULT 60 CHECK (booking_cutoff_minutes >= 0),
    status VARCHAR(32) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_slot_time_order CHECK (ends_at > starts_at),
    CONSTRAINT uq_venue_activity_slot_time UNIQUE (venue_id, activity_id, starts_at)
);

CREATE INDEX IF NOT EXISTS idx_slots_venue_starts ON availability_slots (venue_id, starts_at, status);
CREATE INDEX IF NOT EXISTS idx_slots_activity_starts ON availability_slots (activity_id, starts_at, status);

-- ============================================================
-- 7. INVENTORY BLACKOUTS (Closures & Rainouts)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_blackouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_blackout_time_order CHECK (ends_at > starts_at)
);

-- ============================================================
-- 8. IMMUTABLE CREDIT LEDGER
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    delta INTEGER NOT NULL,
    entry_type VARCHAR(32) NOT NULL CHECK (entry_type IN ('grant', 'debit', 'refund', 'expiry', 'adjustment')),
    source_type VARCHAR(32) NOT NULL CHECK (source_type IN ('seed_pack', 'order', 'booking', 'cancellation', 'admin')),
    source_id VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_idempotency ON credit_ledger (idempotency_key);

-- ============================================================
-- 9. CREDIT ACCOUNTS (Reconciled Balance Cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_accounts (
    user_id UUID PRIMARY KEY,
    cached_balance INTEGER NOT NULL DEFAULT 0 CHECK (cached_balance >= 0),
    last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. BOOKINGS & PASS TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    slot_id UUID NOT NULL REFERENCES availability_slots(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    credits_debited INTEGER NOT NULL CHECK (credits_debited > 0),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    venue_name_snapshot VARCHAR(255) NOT NULL,
    venue_locality_snapshot VARCHAR(128) NOT NULL,
    venue_address_snapshot VARCHAR(255) NOT NULL,
    activity_name_snapshot VARCHAR(128) NOT NULL,
    slot_starts_at_snapshot TIMESTAMPTZ NOT NULL,
    slot_ends_at_snapshot TIMESTAMPTZ NOT NULL,
    policy_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    checkin_token VARCHAR(64) UNIQUE NOT NULL,
    checkin_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (checkin_status IN ('pending', 'checked_in', 'expired')),
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings (user_id, status, slot_starts_at_snapshot);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_token ON bookings (checkin_token);

-- ============================================================
-- 11. MEMBERSHIP PRODUCTS (Credit Packs)
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    validity_days INTEGER NOT NULL DEFAULT 30 CHECK (validity_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. PAYMENT ORDERS & WEBHOOK EVENT INBOX
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES membership_products(id) ON DELETE RESTRICT,
    provider_order_id VARCHAR(128) UNIQUE,
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'captured', 'failed', 'refunded')),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    credits_to_grant INTEGER NOT NULL CHECK (credits_to_grant > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id VARCHAR(128) UNIQUE NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'razorpay',
    event_type VARCHAR(64) NOT NULL,
    payload_digest VARCHAR(64) NOT NULL,
    order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'ignored', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- ============================================================
-- 13. SEED DATA (Bengaluru Pilot Cluster)
-- ============================================================

-- Activities
INSERT INTO activities (id, slug, name, description, icon, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'badminton', 'Badminton', 'Synthetic & wooden indoor courts with professional lighting', 'Activity', 1),
('a0000000-0000-0000-0000-000000000002', 'swimming', 'Swimming', 'Temperature-controlled lap and leisure pools with certified lifeguards', 'Waves', 2),
('a0000000-0000-0000-0000-000000000003', 'gym', 'Gym & Strength', 'Premium fitness spaces, free weights, Olympic barbells and cardio', 'Dumbbell', 3),
('a0000000-0000-0000-0000-000000000004', 'yoga', 'Yoga & Meditation', 'Traditional hatha, vinyasa, and restorative sessions with certified gurus', 'Sparkles', 4)
ON CONFLICT (slug) DO NOTHING;

-- Membership Products
INSERT INTO membership_products (id, slug, name, credits, price_paise, validity_days, sort_order, description) VALUES
('b0000000-0000-0000-0000-000000000001', 'starter-20', 'Starter Pack', 20, 219900, 30, 1, 'Ideal for 2 sessions a week across badminton courts and gyms.'),
('b0000000-0000-0000-0000-000000000002', 'active-50', 'Active Pack', 50, 499900, 45, 2, 'Our most popular pack for multi-sport athletes: pools, courts, and functional training.'),
('b0000000-0000-0000-0000-000000000003', 'pro-100', 'Pro Pack', 100, 899900, 60, 3, 'Best value for dedicated daily athletes and prime-time court reservations.')
ON CONFLICT (slug) DO NOTHING;

-- Partner 1
INSERT INTO partners (id, name, business_name, contact_email, contact_phone, status) VALUES
('10000000-0000-0000-0000-000000000001', 'The Hub Sports LLP', 'The Hub Sports LLP', 'partners@thehubsports.in', '+91 80 4120 4400', 'active')
ON CONFLICT (id) DO NOTHING;

-- Venue 1
INSERT INTO venues (id, partner_id, slug, name, description, address_line1, locality, city, postal_code, status, featured, amenities) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'the-hub-sports-arena-domlur', 'The Hub Sports Arena', 'Premier 6-court indoor badminton facility with international standard synthetic mats, LED glare-free lighting, and showers.', '42, 1st Cross, Domlur Layout', 'Domlur', 'Bengaluru', '560071', 'approved', true, ARRAY['Synthetic courts', 'Showers', 'Locker rooms', 'Parking', 'Equipment rental'])
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 14. USAGE METERING & RATE CARDS (005 MIGRATION)
-- ============================================================

-- Migration: 005_metered_usage_sessions.sql
-- Description: Entry/Exit Usage Metering & Hybrid Pricing Sub-system
-- Follows architecture (3).md §7, rules (4).md §5A, and phases (3).md Additional Gate

-- 1. Rate Cards (Server-authoritative pricing rules per venue and activity)
CREATE TABLE IF NOT EXISTS rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    activity_slug VARCHAR(64) NOT NULL REFERENCES activities(slug) ON DELETE RESTRICT,
    rate_unit_minutes INTEGER NOT NULL CHECK (rate_unit_minutes > 0),    -- e.g. 30 minutes
    credits_per_unit INTEGER NOT NULL CHECK (credits_per_unit > 0),      -- e.g. 4 credits per 30 mins
    min_duration_minutes INTEGER NOT NULL CHECK (min_duration_minutes > 0), -- e.g. 30 mins
    min_credits INTEGER NOT NULL CHECK (min_credits > 0),                -- minimum debit
    max_duration_minutes INTEGER NOT NULL CHECK (max_duration_minutes >= min_duration_minutes), -- e.g. 180 mins
    max_credits_cap INTEGER NOT NULL CHECK (max_credits_cap >= min_credits), -- STRICT HARD CAP (e.g. 16 credits)
    rounding_policy VARCHAR(32) NOT NULL DEFAULT 'CEIL_INTERVAL' CHECK (rounding_policy IN ('CEIL_INTERVAL', 'FLOOR_INTERVAL', 'STANDARD')),
    version VARCHAR(16) NOT NULL DEFAULT 'v1.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rate_card_version UNIQUE (venue_id, activity_slug, version)
);

CREATE INDEX IF NOT EXISTS idx_rate_cards_venue ON rate_cards (venue_id, activity_slug, is_active);

-- 2. Pricing Policy Acceptances (Auditable member pre-entry agreement to rates & hard cap)
CREATE TABLE IF NOT EXISTS pricing_policy_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE RESTRICT,
    rate_card_version VARCHAR(16) NOT NULL,
    accepted_cap_credits INTEGER NOT NULL CHECK (accepted_cap_credits > 0),
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_acceptances_user ON pricing_policy_acceptances (user_id, venue_id);

-- 3. Usage Sessions (Server-authoritative entry/exit lifecycle)
CREATE TABLE IF NOT EXISTS usage_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    activity_slug VARCHAR(64) NOT NULL,
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE RESTRICT,
    rate_card_version VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'capped_expired', 'disputed')),
    quote_max_credits INTEGER NOT NULL CHECK (quote_max_credits > 0),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Authoritative server timestamp (client clocks ignored)
    ended_at TIMESTAMPTZ,                          -- Authoritative server timestamp at exit
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    billable_units INTEGER CHECK (billable_units >= 0),
    credits_debited INTEGER CHECK (credits_debited >= 0),
    entry_idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    exit_idempotency_key VARCHAR(128) UNIQUE,
    exception_code VARCHAR(64), -- e.g. MISSING_EXIT_AUTO_CAPPED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_sessions_user_status ON usage_sessions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_usage_sessions_venue_status ON usage_sessions (venue_id, status);

-- 4. Scan Events (Append-only physical attendance audit log)
CREATE TABLE IF NOT EXISTS scan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES usage_sessions(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL,
    action VARCHAR(32) NOT NULL CHECK (action IN ('ENTRY', 'EXIT', 'STAFF_OVERRIDE')),
    actor_id VARCHAR(128) NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    validation_outcome VARCHAR(32) NOT NULL DEFAULT 'APPROVED' CHECK (validation_outcome IN ('APPROVED', 'REJECTED')),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_scan_events_session ON scan_events (session_id, action);
CREATE INDEX IF NOT EXISTS idx_scan_events_idempotency ON scan_events (idempotency_key);

-- 5. Usage Adjustments (Audited compensating corrections — never alters historical ledger rows)
CREATE TABLE IF NOT EXISTS usage_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES usage_sessions(id) ON DELETE RESTRICT,
    original_credits INTEGER NOT NULL CHECK (original_credits >= 0),
    adjusted_credits INTEGER NOT NULL CHECK (adjusted_credits >= 0),
    compensating_ledger_id UUID,
    reason TEXT NOT NULL,
    proposed_by VARCHAR(128) NOT NULL,
    approved_by VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_adjustments_session ON usage_adjustments (session_id);

