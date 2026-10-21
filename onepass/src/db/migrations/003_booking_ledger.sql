-- Migration: 003_booking_ledger.sql
-- Description: Credit ledger, credit accounts, bookings, booking events, and check-in pass models.
-- Follows architecture.md §4, §5 and rules.md §4.

-- 1. Immutable Credit Ledger (Source of financial truth for entitlements)
CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    delta INTEGER NOT NULL, -- positive for grants/refunds, negative for debits
    entry_type VARCHAR(32) NOT NULL CHECK (entry_type IN ('grant', 'debit', 'refund', 'expiry', 'adjustment')),
    source_type VARCHAR(32) NOT NULL CHECK (source_type IN ('seed_pack', 'order', 'booking', 'cancellation', 'admin')),
    source_id VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_idempotency ON credit_ledger (idempotency_key);

-- 2. Credit Accounts (Transactional balance projection)
CREATE TABLE IF NOT EXISTS credit_accounts (
    user_id UUID PRIMARY KEY,
    cached_balance INTEGER NOT NULL DEFAULT 0 CHECK (cached_balance >= 0),
    last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bookings
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
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings (slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin_token ON bookings (checkin_token);

-- 4. Booking Events (Append-only timeline of state transitions)
CREATE TABLE IF NOT EXISTS booking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    status_from VARCHAR(32),
    status_to VARCHAR(32) NOT NULL,
    actor_id UUID NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking ON booking_events (booking_id, created_at);
