-- Migration: 004_membership_payments.sql
-- Description: Membership product SKUs, orders, payment webhook event inbox, and reconciliation tracking.
-- Follows architecture.md §4, §6 and rules.md §4.

-- 1. Membership Products / SKUs
CREATE TABLE IF NOT EXISTS membership_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    price_paise INTEGER NOT NULL CHECK (price_paise > 0), -- integer paise (e.g. 449900 for ₹4,499)
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    validity_days INTEGER NOT NULL DEFAULT 30 CHECK (validity_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_active_sort ON membership_products (is_active, sort_order);

-- 2. Payment Orders (Authoritative server-side order records)
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES membership_products(id) ON DELETE RESTRICT,
    provider_order_id VARCHAR(128) UNIQUE, -- e.g. order_O123456789 from Razorpay
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'captured', 'failed', 'refunded')),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    credits_to_grant INTEGER NOT NULL CHECK (credits_to_grant > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON payment_orders (user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_provider_order ON payment_orders (provider_order_id);

-- 3. Payment Event Inbox (Idempotent webhook delivery store)
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id VARCHAR(128) UNIQUE NOT NULL, -- Unique provider event ID
    provider VARCHAR(32) NOT NULL DEFAULT 'razorpay',
    event_type VARCHAR(64) NOT NULL,
    payload_digest VARCHAR(64) NOT NULL, -- SHA256 digest of payload for tamper check
    order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'ignored', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_events_provider_event ON payment_events (provider_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events (order_id);
