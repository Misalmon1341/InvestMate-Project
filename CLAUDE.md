# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Invesmate** is an educational investment simulation app for university students to learn about personal finance and investing without real financial risk. Inspired by Revolut's operational model, it uses gamification (missions, achievements, scoring) to teach concepts like diversification, risk, ETFs, stocks, and crypto.

## Architecture

**Frontend**: Mobile-first PWA (Progressive Web App)
- `docs/index.html` - Main HTML entry point with all screens
- `docs/css/styles.css` - Mobile-first responsive styling
- `docs/js/main.js` - Core application logic

**Backend**: Supabase (PostgreSQL + Auth + Realtime)
- `docs/js/supabase-client.js` - Supabase client configuration
- `docs/js/auth-service.js` - Authentication service
- `docs/js/portfolio-service.js` - Portfolio management
- `docs/js/missions-service.js` - Missions and achievements

**Data Layer** (Supabase tables):
- `profiles` - User profiles with balance
- `portfolio` - User asset holdings
- `transactions` - Transaction history
- `user_missions` - Mission progress
- `user_achievements` - Unlocked achievements

## Development

**Run locally:**
```bash
cd docs
npm install
npm run dev          # Vite dev server (port 3000)
# OR
npm run serve        # Simple http-server (port 8080)
```

**Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES6 modules), Supabase

## Key Features Implemented

- **Authentication**: Supabase Auth with localStorage fallback
- **Investment Simulation**: 16+ products (stocks, ETFs, crypto) with real-time price updates
- **Portfolio Management**: Buy/sell assets, track P/L
- **Missions System**: 8 missions with monetary rewards
- **Achievements**: 8 badges to unlock
- **Learning Section**: Concepts, tips, and common mistakes
- **PWA Ready**: Manifest.json for mobile installation

## Configuration

**Supabase Setup:**
1. Create project at https://supabase.com
2. Run SQL from `docs/SUPABASE_SETUP.md`
3. Store credentials in localStorage or `.env`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

See `docs/CONFIGURACION_RAPIDA.md` for detailed setup instructions.

## Resources

- **Design**: [Figma UI/UX](https://www.figma.com/design/xXk8iFpmaaXRhpb0Ngbisn/Invesmate-UiLayout)
- **Documentation**: `Invesmate.md` - Full conceptual spec
- **Setup Guide**: `docs/SUPABASE_SETUP.md` - Database schema and RLS policies
- **Quick Start**: `docs/CONFIGURACION_RAPIDA.md` - Step-by-step configuration
