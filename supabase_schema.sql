-- ==============================================================================
-- HalalPSX AI - Supabase Database Schema (PostgreSQL + RLS + Triggers)
-- Multi-User Shariah-Compliant PSX Portfolio Manager & Cloud Watcher
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES TABLE
-- Stores user broker preferences, available capital, tax status, subscription, and alerts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    broker TEXT NOT NULL DEFAULT 'KTrade', -- KTrade, Finqalab, Zindagi, AKD Trade, Arif Habib, MStock, Al-Meezan
    budget NUMERIC(12, 2) NOT NULL DEFAULT 50000.00, -- Free Cash available for trading (PKR)
    tax_status TEXT NOT NULL DEFAULT 'FILER', -- 'FILER' (15% CGT) or 'NON_FILER' (30% CGT)
    plan TEXT NOT NULL DEFAULT 'FREE', -- 'FREE', 'PRO', 'PREMIUM'
    ai_credits INT NOT NULL DEFAULT 10, -- Daily AI prompt credits
    ntfy_topic TEXT, -- Custom ntfy.sh topic for instant mobile push alerts
    gemini_api_key TEXT, -- Optional custom Gemini API key
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. PSX AUTO TARGET WATCHER RULES TABLE ("Buy at X, Sell at Y" Cloud Watcher)
-- Evaluated continuously by the Cloudflare Worker 15-minute cron engine
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.psx_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL, -- e.g. 'MLCF', 'MIIETF', 'MEBL', 'HUBC'
    trigger_type TEXT NOT NULL DEFAULT 'TARGET_PRICE', -- 'TARGET_PRICE', 'UPPER_LOCK', 'STOP_LOSS_LOW', 'TRAILING_STOP'
    buy_target NUMERIC(10, 2) NOT NULL, -- Target buy price in PKR
    sell_target NUMERIC(10, 2) NOT NULL, -- Target sell price in PKR
    stop_loss_target NUMERIC(10, 2), -- Auto-exit if price drops to or below stop loss
    quantity INT NOT NULL, -- Number of shares
    sell_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00, -- 25%, 50%, 75%, 100% ("Aadha maal ya poora maal")
    broker TEXT NOT NULL DEFAULT 'KTrade',
    status TEXT NOT NULL DEFAULT 'WAITING_BUY', -- 'WAITING_BUY', 'BOUGHT_WAITING_SELL', 'COMPLETED', 'CANCELLED'
    execution_buy_price NUMERIC(10, 2), -- Actual executed buy price
    execution_sell_price NUMERIC(10, 2), -- Actual executed sell price
    realized_pnl NUMERIC(12, 2) DEFAULT 0.00, -- Net realized profit/loss after broker fees and CGT
    notes TEXT,
    alert_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns if table already exists
ALTER TABLE public.psx_rules ADD COLUMN IF NOT EXISTS trigger_type TEXT DEFAULT 'TARGET_PRICE';
ALTER TABLE public.psx_rules ADD COLUMN IF NOT EXISTS sell_percentage NUMERIC(5, 2) DEFAULT 100.00;
ALTER TABLE public.psx_rules ADD COLUMN IF NOT EXISTS stop_loss_target NUMERIC(10, 2);

-- ------------------------------------------------------------------------------
-- 3. ACTIVE PORTFOLIO HOLDINGS TABLE (Investify Core)
-- Tracks active open positions with live cost and dynamic fee deductions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    avg_buy_price NUMERIC(10, 2) NOT NULL CHECK (avg_buy_price > 0),
    broker TEXT NOT NULL DEFAULT 'KTrade',
    shariah_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, symbol, broker)
);

-- ------------------------------------------------------------------------------
-- 4. TRADE HISTORY TABLE (Realized Gains & Dividends)
-- Completed trades with full audit log of round-trip broker commission, FED, CDC & CGT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    quantity INT NOT NULL,
    buy_price NUMERIC(10, 2) NOT NULL,
    sell_price NUMERIC(10, 2) NOT NULL,
    gross_pnl NUMERIC(12, 2) NOT NULL,
    broker_commission NUMERIC(10, 2) NOT NULL,
    fed_tax NUMERIC(10, 2) NOT NULL, -- 16% Provincial FED on commission
    cdc_charges NUMERIC(10, 2) NOT NULL,
    cgt_tax NUMERIC(10, 2) NOT NULL, -- 15% (Filer) or 30% (Non-Filer) on net gain
    net_pnl NUMERIC(12, 2) NOT NULL,
    holding_days INT DEFAULT 0,
    broker TEXT NOT NULL DEFAULT 'KTrade',
    closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PAYMENT RECEIPTS TABLE (SaaS Subscriptions via Raast / SadaPay / EasyPaisa / JazzCash)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL, -- 'RAAST', 'SADAPAY', 'EASYPAISA', 'JAZZCASH'
    amount NUMERIC(10, 2) NOT NULL,
    plan_requested TEXT NOT NULL, -- 'PRO' (Rs 499), 'PREMIUM' (Rs 1,499)
    receipt_image_url TEXT,
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    ai_verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. STOCK WATCHLIST TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure multi-tenant isolation: Users can ONLY access their own data
-- Cloudflare Worker uses SERVICE_ROLE_KEY to bypass RLS for cron evaluation
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psx_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_watchlists ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- psx_rules policies
CREATE POLICY "Users can view own rules"
    ON public.psx_rules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules"
    ON public.psx_rules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules"
    ON public.psx_rules FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules"
    ON public.psx_rules FOR DELETE
    USING (auth.uid() = user_id);

-- portfolio_holdings policies
CREATE POLICY "Users can manage own holdings"
    ON public.portfolio_holdings FOR ALL
    USING (auth.uid() = user_id);

-- trade_history policies
CREATE POLICY "Users can view own trade history"
    ON public.trade_history FOR ALL
    USING (auth.uid() = user_id);

-- payment_receipts policies
CREATE POLICY "Users can manage own payment receipts"
    ON public.payment_receipts FOR ALL
    USING (auth.uid() = user_id);

-- stock_watchlists policies
CREATE POLICY "Users can manage own watchlist"
    ON public.stock_watchlists FOR ALL
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AUTOMATIC USER PROFILE CREATION TRIGGER
-- When a user registers via Supabase Auth (Email or Google), create user_profiles
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, ntfy_topic)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'halalpsx-' || substr(md5(random()::text), 1, 8)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- INDEXES FOR FAST CRON JOB LOOKUP
-- Cloudflare Worker checks WAITING_BUY and BOUGHT_WAITING_SELL rules every 15 mins
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_psx_rules_status ON public.psx_rules(status);
CREATE INDEX IF NOT EXISTS idx_psx_rules_symbol ON public.psx_rules(symbol);
CREATE INDEX IF NOT EXISTS idx_psx_rules_user ON public.psx_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON public.portfolio_holdings(user_id);
