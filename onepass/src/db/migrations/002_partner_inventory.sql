-- Migration: 002_partner_inventory.sql
-- Description: Partner permissions, bookable inventory slots, capacity constraints, and inventory audit logs.
-- Follows architecture.md §4 and rules.md §4.

-- 1. Partner Members (Scoped role mapping per partner organization)
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

-- 2. Availability Slots (Bookable session inventory)
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

-- Indexes for slot querying and concurrency checks
CREATE INDEX IF NOT EXISTS idx_slots_venue_starts ON availability_slots (venue_id, starts_at, status);
CREATE INDEX IF NOT EXISTS idx_slots_activity_starts ON availability_slots (activity_id, starts_at, status);

-- 3. Inventory Blackouts (Partner-defined closure or maintenance windows)
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

CREATE INDEX IF NOT EXISTS idx_blackouts_venue_times ON inventory_blackouts (venue_id, starts_at, ends_at);

-- 4. Inventory Audit Log (Immutable record of inventory and capacity changes)
CREATE TABLE IF NOT EXISTS inventory_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_audit_target ON inventory_audit_log (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_actor ON inventory_audit_log (actor_id, created_at);
