# Inlo OnePass — Developer & Antigravity Guide

Welcome to Inlo. This codebase powers the Inlo OnePass sports and fitness membership ecosystem in Bengaluru.

## 🚀 Quickstart for Developers & Antigravity IDE

1. **Install Dependencies**:
   ```bash
   cd onepass
   npm install
   ```

2. **Environment Variables**:
   Create `onepass/.env.local` (copy from `.env.example` or team vault):
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
   - `NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>`
   - `NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED=true`
   - `NEXT_PUBLIC_FEATURE_BOOKINGS_ENABLED=true`
   - `NEXT_PUBLIC_FEATURE_PARTNER_SELF_SERVE=true`

3. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Access locally at: `http://localhost:3000`

4. **Verify TypeScript & Tests**:
   ```bash
   npm run type-check
   npm run test
   ```

## 🌐 Live Deployment Workflow

- **Hosting**: Vercel (Production URL: `https://inlo.vercel.app` / `https://www.inlo.tech`)
- **Git Remote**: `git@github.com:devsharmaofficial/inlo.git` (branch: `main`)
- **Auto-deploy**: Pushing commits to `main` automatically builds and deploys to production on Vercel.

## 🏛️ Core Architectural Invariants

1. **Universal Tap In / Tap Out Metering**:
   - Members access venues via dynamic scannable QR passes (`/pass`).
   - Credits exhaust dynamically based on venue tier rates and visit duration.
   - Strict daily hard caps prevent overcharging even if member forgets to tap out.
   - See `src/features/metering/metering-service.ts`.

2. **Aesthetic & UX Standard (Anti-Slop)**:
   - Minimalist, high-end design matching `design (2).md`.
   - Never output verbose, fluffy or promotional placeholder copy. Keep text crisp and editorial.
   - Use custom properties design system with tactile buttons, micro-interactions, and premium typography.

3. **Authentication**:
   - Managed via Supabase Auth (`@supabase/ssr`).
   - Supports Google OAuth, Phone SMS OTP, and Email magic PIN.
