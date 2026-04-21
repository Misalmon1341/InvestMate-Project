# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Invesmate** is an educational investment simulation app for university students to learn about personal finance and investing without real financial risk. Inspired by Revolut's operational model, it uses gamification (missions, achievements, scoring) to teach concepts like diversification, risk, ETFs, stocks, and crypto.

## Architecture

**Frontend-only prototype** (early stage):
- `docs/index.html` - Main HTML entry point
- `docs/css/styles.css` - Styling
- `docs/js/main.js` - Application logic

**Planned 4-layer architecture** (from Invesmate.md):
1. **Presentation Layer** - HTML/CSS/JS for UI and navigation
2. **Logic Layer** - Frontend JS for simulation, validations, user state
3. **Services Layer** - Backend for complex logic and API endpoints
4. **Data Layer** - MongoDB/Firebase for users, investments, scores, achievements

## Core Modules

- **User** - Login/registration, profile, balance
- **Portfolio** - Fictitious balance, assets, transaction history
- **Investment Simulation** - Buy/sell actions, price variations, P/L tracking
- **Missions** - Task lists, progress tracking, rewards
- **Challenges** - Challenges, scoring system
- **Achievements** - Badges and recognition

## Key User Flows

1. App intro/context → Learning section → Explore sections → Start investing
2. Browse products (stocks, ETFs, crypto) → Analyze → Purchase → Track portfolio
3. Complete missions → Earn rewards → Progress feedback → Ready to invest

## Resources

- **Design**: [Figma UI/UX](https://www.figma.com/design/xXk8iFpmaaXRhpb0Ngbisn/Invesmate-UiLayout)
- **Documentation**: `Invesmate.md` contains full conceptual spec, user stories, value proposition, and feature details

## Development

**Run locally:**
```bash
# Using Node.js http-server
npx http-server docs -p 8080

# Or open directly
open docs/index.html
```

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+) - Mobile-first PWA

## Current State

v1.0 implemented:
- Full mobile-first UI with 10+ screens
- User authentication (localStorage)
- Investment simulation with 16+ products (stocks, ETFs, crypto)
- 8 missions with rewards system
- 8 achievements/badges
- Learning section with concepts, tips, and common mistakes
- Simulated price fluctuations (auto-update every 30s)
- PWA manifest for mobile installation

**Pending:** Service worker for offline support, backend integration, real market data API
