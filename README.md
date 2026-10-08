# 🌱 EcoSort AI – Smart Waste Management & Community Action

> **“Turn Waste Into Action.”**  
> *Identify. Segregate. Reuse. Recycle. Build a cleaner community.*

EcoSort AI is a full-featured, production-quality civic web platform engineered to empower households, student campuses, residential communities, and municipalities to correctly identify, segregate, recycle, and safely dispose of waste with real social impact.

---

## 🌟 Key Highlights & Social Impact

- 📸 **Multimodal AI Waste Scanner**: Snap a webcam picture, upload photos, or describe waste items. Classifies into **10 circular categories** with bin color codes, safety precautions, and recycling directives.
- ⚡ **Graceful Offline Heuristics & Verification**: If vision AI is unavailable or offline, the platform automatically switches to a robust local heuristic engine. If classification confidence is ambiguous, it proactively prompts users to confirm rather than guessing.
- 🔍 **“What Should I Do With This?” Search**: Instant search for tricky everyday items (phones, lithium batteries, shattered glass, chemical paint cans, blister packs) with exact preparation protocols before disposal.
- 🗂️ **Smart Segregation Assistant**: Paste a mixed waste inventory from your apartment or dorm and get an instant color-coded 6-stream guide with printable notices.
- 📊 **Eco Impact Calculator**: Measures personal and community landfill diversion (kg), CO2e greenhouse gas prevention, trees preserved, and water conserved based on scientific Life Cycle Assessment (LCA) benchmarks.
- 🚚 **Smart Collection Requests**: Door-to-door bulk pickup booking for e-waste and recyclables with lifecycle status progression (`Pending` → `Assigned` → `Collected` → `Completed`).
- 🗺️ **Community Hotspot Map & Reporting**: Interactive OpenStreetMap (Leaflet) displaying overflowing public bins, illegal dumping, and blocked drains with locality-level privacy masking (no private home GPS coordinates leaked).
- 🏆 **Gamification & Eco Points**: Weekly active eco-challenges, celebratory confetti animations, achievement badges, and individual/college leaderboards.
- 📚 **Circular Education Hub & Interactive Quiz**: Segregation 101, home composting ratios, recycling myth busters, and graded interactive knowledge checks.
- 🌐 **Trilingual Localization**: Native support for **English**, **Kannada (ಕನ್ನಡ)**, and **Hindi (हिंदी)** with instant UI toggle.
- ♿ **Accessibility First**: Keyboard navigation, high-contrast toggle, clear labels, and responsive layout for mobile and desktop.
- 🛡️ **Civic & Admin Dashboard**: Switch between Citizen Mode and Municipal Admin Mode to dispatch collection providers and resolve hotspot tickets.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Leaflet 1.9, Canvas Confetti
- **Backend**: Node.js, Express, ES Modules, RESTful APIs
- **Database**: Persistent JSON database store (`server/data/db.json`) pre-populated with realistic Bengaluru community data
- **AI Engine**: Modular architecture supporting Google Gemini Vision API (`gemini-1.5-flash`) with automatic fallback to built-in knowledge engine

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Installation
In the project root:
```bash
# Install root dependencies
npm install

# Install client and server dependencies
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Environment Configuration (Optional)
The application works **100% offline out-of-the-box** in Hackathon Demo Mode without requiring any external paid API keys.

If you wish to test with Google Gemini Vision API, create or edit `server/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Run Locally

#### Development Mode (Starts Client on Port 3000 & Backend on Port 5000 concurrently):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Unified Mode (Express serves built client on Port 5000):
```bash
# Build the client
npm run build

# Start the unified production server
npm run prod
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🧪 Testing API Endpoints

An end-to-end integration test script is included:
```bash
node test-endpoints.js
```
Runs 10 automated checks verifying:
1. Health check & AI engine status
2. Plastic bottle classification & bin matching
3. Heavy metal battery safety warnings
4. Low-confidence verification prompts
5. "What Should I Do With This?" query engine
6. 6-stream multi-item segregation planner
7. Eco Impact LCA calculator
8. Collection requests retrieval
9. Privacy-masked community reports
10. Web client static delivery

---

## 👥 Civic Roles & Demo Features

- **Citizen Mode**: Access scanner, log impact, report neighborhood hotspots, join weekly challenges, and request door-to-door pickups.
- **Admin Mode**: Click the **"Citizen Mode / Admin Mode"** badge in the navbar or visit the **Admin Area** to assign collection providers and mark reported hotspots as "Resolved".
- **Reset Demo Data**: Click **"Reset Hackathon Demo Data"** in the Admin Area to instantly restore fresh baseline data for live jury presentations.

---

## 🔒 Privacy & Safety Notice
- Exact street GPS coordinates and personal phone numbers are never rendered publicly on map cards; localities are masked to neighborhood boundaries.
- Hazardous chemical waste and biohazards are flagged with high-visibility warnings with explicit directives never to flush chemicals or handle broken glass without cut-resistant protection.

