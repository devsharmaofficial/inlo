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
