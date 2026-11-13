# HalalPSX AI (Investify.pk Inspired + Islamic AI Co-Pilot) 🌙📈
> **Pakistan's First Multi-User Shariah-Compliant PSX Portfolio Manager, Technical Screener, and Natural-Language "Buy at X, Sell at Y" Cloud Watcher SaaS Platform (Web App + Mobile PWA).**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20on%20GitHub%20Pages-028C8C?style=for-the-badge&logo=github)](https://tariqumair015-hafiz.github.io/halalpsx-ai/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)

🌍 **Live Web App:** [https://tariqumair015-hafiz.github.io/halalpsx-ai/](https://tariqumair015-hafiz.github.io/halalpsx-ai/)

---

## 🌟 Overview & Key Features

HalalPSX AI combines the clean, high-utility financial tracking of **Investify.pk** with a **Roman Urdu / English AI Co-Pilot**, **live PSX stock scraping**, **dynamic Pakistani broker fee engine**, and an automated **15-minute Cloudflare Worker Cron Engine**.

### 1. Distinct Islamic & Modern Fintech Branding
- **Custom Logo & Aesthetic:** Crescent Moon fused with an upward Bullish PSX Candlestick in Emerald Green (`#10B981`), Mint (`#34D399`), Gold/Amber (`#F59E0B`), and Deep Obsidian Slate (`#090D16`).
- **PWA & Mobile-First:** Designed like a sleek Bloomberg/Investify mobile app terminal ready for PWA and Android APK installation via Capacitor.

### 2. Module A: Multi-User Onboarding & Dynamic Broker Engine
- **Broker Selection:** Select **KTrade, Finqalab, Zindagi (JS Global), AKD Trade, Arif Habib, MStock, or Al-Meezan**.
- **Dynamic Free Cash / Budget:** Never hardcoded. Adapts to Rs 25,000, Rs 50,000, Rs 500,000, etc.
- **Tax Status:** **Filer (15% CGT)** vs **Non-Filer (30% CGT)**.
- **Real Pakistani Fees:** Accurately accounts for `max(Rs 0.05/share, 0.15% value)`, **16% Provincial FED** on brokerage commission, and CDC depository fees.

### 3. Module B: Investify-Style Market Pulse & Shariah Screener
- **Top Live Macro Ticker Bar:** KMI-30 (Halal Index), KSE-100, USD/PKR, Gold (Tola PKR), Silver, and Market Breadth (Advancing vs Declining).
- **PSX Fear & Greed Mood Meter:** Sentiment index gauge (0-100) with Islamic retail strategy guidance.
- **Stock Cards & Day Low/High Range Bars:** Real-time visual progress bar showing where current price sits between Day Low and Day High.
- **Technical Signals:** `🟢 DIP BUY ZONE`, `🚀 BULLISH`, `⚖️ NEUTRAL`, `⚠️ WAIT (OVERBOUGHT - FOMO Protection)`.
- **Affordability Tag:** Instant calculation of how many shares you can buy right now with your Free Cash.
- **32 Technical Indicators Modal:** RSI 14, 20 EMA, 50 EMA, 200 SMA, Classic Pivot Points (S1/S2/P/R1/R2), P/E, EPS, Dividend Yield, and KMI Shariah criteria checklist.

### 4. Module C: 4-Tab Portfolio Manager (Investify Core)
1. **Auto Target Watcher ("Buy at X, Sell at Y" Cloud Rules):** Lifecycle workflow (`WAITING_BUY` ➔ `BOUGHT_WAITING_SELL` ➔ `COMPLETED`).
2. **Active Holdings:** Tracks bought shares, Average Buy Price, Total Cost, Current Market Value, and True Net Post-Tax Profit/Loss.
3. **Sold History:** Closed trades audit log with realized returns automatically credited back to your Free Cash.
4. **AI Screenshot Portfolio Importer (Gemini Vision):** Upload a screenshot of your KTrade/Finqalab/Zindagi app to auto-import cash balance and stock holdings.

### 5. Module D: Halal & Pakistani Investor Calculators
1. **PSX Brokerage, Tax & Breakeven Calculator:** Exact round-trip broker commission, 16% FED, CDC, 15%/30% CGT, and exact Breakeven Sell Price.
2. **Halal Dividend Purification & Zakat Calculator:** Calculates non-permissible dividend charity amount (e.g. 1.5% for MLCF, 3.2% for HUBC) and 2.5% Zakat on holdings.
3. **Stock Average Down Calculator:** Blends old and new purchases to display new average cost and required break-even drop.

### 6. Module E: Roman Urdu & English AI Co-Pilot
- Slide-out chat drawer speaking fluent Roman Urdu & English.
- Natural Language Rule Setting: *"MLCF 103 pe 9 share buy aur 112 pe sell set kar do"* ➔ AI generates `SET_RULE` and registers it directly into your portfolio!
- Context-Aware: Evaluates live PSX prices, available budget, and recommends top KMI-30 Shariah picks (`MIIETF`, `MLCF`, `MEBL`, `HUBC`).

### 7. Module F: SaaS Monetization & Local Pakistani Payment Flow
- **Free vs Pro (Rs 499/mo) vs Premium (Rs 1,499/mo)**.
- Local Pakistani Payment modal supporting **Raast Instant QR / SadaPay / EasyPaisa / JazzCash** with receipt verification.
- **SECP Legal Compliance:** Prominent disclaimers across modals and footer.

---

## 🚀 How to Run Locally

### 1. Frontend Web App
```bash
# In project root
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Cloudflare Worker Backend & Cron Engine
```bash
# In the /worker directory
cd worker
npm install
npx wrangler dev
```

---

## ☁️ Deployment Guide

### Deploying the Database (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of `supabase_schema.sql`.
4. Copy your project URL and anon public key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Deploying Cloudflare Worker & 15-Minute Market Hours Cron
```bash
cd worker
# Set your secrets
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put GEMINI_API_KEY

# Deploy to Cloudflare edge
npx wrangler deploy
```

### Deploying Frontend to Cloudflare Pages / Vercel
```bash
npm run build
# Upload the generated /dist folder to Cloudflare Pages or Vercel
```

---

## 📱 Mobile PWA / Android APK Installation
The app includes a fully compliant `manifest.json` and viewport configuration.
To install on Android:
1. Open the hosted URL in Chrome on Android.
2. Tap the browser menu `⋮` ➔ **"Install app"** or **"Add to Home screen"**.
3. It launches as a fullscreen standalone dark-mode fintech mobile app.

---
*SECP Disclaimer: Educational research and Shariah screening tool only — Not licensed financial advice.*
