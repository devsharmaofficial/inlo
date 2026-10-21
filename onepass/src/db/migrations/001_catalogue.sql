-- Migration: 001_catalogue.sql
-- Description: Core catalogue entities for activities, partners, venues, and venue offerings.
-- Follows architecture.md §4.

-- 1. Activities taxonomy
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

-- Index for public activity lookups
CREATE INDEX IF NOT EXISTS idx_activities_active_sort ON activities (is_active, sort_order);

-- 2. Partners (Venue operators / business entities)
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

-- 3. Venues (Physical locations)
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

-- Index for public filtering by status and locality
CREATE INDEX IF NOT EXISTS idx_venues_status_locality ON venues (status, locality);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues (slug);

-- 4. Venue Activities (Offerings & credit costs per activity)
CREATE TABLE IF NOT EXISTS venue_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    credit_cost INTEGER NOT NULL CHECK (credit_cost > 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_venue_activity UNIQUE (venue_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_activities_venue ON venue_activities (venue_id, is_active);
CREATE INDEX IF NOT EXISTS idx_venue_activities_activity ON venue_activities (activity_id, is_active);

-- 5. Venue Images
CREATE TABLE IF NOT EXISTS venue_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    url VARCHAR(1024) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_images_venue ON venue_images (venue_id, display_order);
