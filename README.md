# 🚀 SkillSwap — Peer-to-Peer Skill Barter Platform

> **Problem Statement:** College students want to learn new skills from each other (e.g., Python for Guitar) but lack money for formal coaching and a platform to connect.
>
> **Our Solution:** A Peer-to-Peer Skill Barter Platform. Students list skills they have and want to learn. Our Groq AI engine matches compatible pairs. Sessions are conducted via in-app WebRTC video calls, fueled by a skill credit economy where teaching earns credits and learning spends them. Quality is maintained through a peer rating system and verified badges.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3FCF8E?logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA3.1-F55036)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://typescriptlang.org)

---

## 🏆 Hackathon Demo Highlights
- **100% Live Database:** Zero mock data. Every feature is fully integrated with Supabase (even the landing page stats!).
- **PWA Mobile App:** Fully installable as a native app on iOS and Android with custom icons and service workers.
- **End-to-End P2P Video:** Fully working WebRTC rooms for live skill-swapping with synced session-end and auto-reconnect logic.
- **Real-Time Everything:** Instant notifications, online presence, and live direct messaging.
- **AI-Powered Matching:** Groq LLaMA-3.1 engine intelligently pairs users based on desired/offered skills.
- **Social Sharing & Badges:** Automatically award "Top Teacher" badges and let users boast about 5-star reviews on X (Twitter) and LinkedIn.

---

## ✨ Features

### 🏠 Landing Page
- [x] Stunning glassmorphic landing page with dark mode support
- [x] Animated statistics, feature cards, and smooth scroll navigation
- [x] Responsive mobile-first design with hamburger menu

### 🔐 Authentication
- [x] Email/password sign-up and login via Supabase Auth
- [x] GitHub OAuth integration
- [x] Magic link authentication
- [x] Session-based auth with middleware protection
- [x] Guided onboarding flow (skill selection + profile setup)

### 📊 Dashboard & Community
- **Marketplace** — Browse and discover skill listings from other students
  - 🔍 **Live Search:** Instantly filter users, skills, and tags
  - 🏆 **Dynamic Badges:** Earn "Top Teacher" (4.8+ stars) and "Active Swapper" (5+ sessions) badges
- **AI Matches** — Groq-powered AI matching engine finds compatible skill-swap partners
- **Campus Help Board** — Public feed where students can post urgent bounties for help in exchange for credits
- **Sessions** — View pending, active, and completed sessions
- **Rich Portfolios** — Full profile editor with academic info, GitHub, LinkedIn, and portfolio links
- **Gamification & Endorsements** — Endorse your peers for specific skills to award them shiny badges on their profiles
- **Reviews** — Rate and review your peers after sessions
  - 🔗 **Social Sharing:** One-click boast to Twitter/LinkedIn for 4+ star reviews
- **Leaderboard** — Top contributors ranked by sessions, ratings, and credits

### 🤖 AI-Powered Features
- [x] **Smart Matchmaker** — AI recommends specific peers based on skills, college, city, and preferences
- [x] **Persistent AI Chatbot** — Floating assistant powered by Groq (Llama 3.1) with database persistence for:
  - [x] "Quiz Me" interactive mode for test preparation
  - [x] Native file handling (upload images and documents directly to the AI)
  - [x] Multi-lingual support for regional languages
  - [x] Finding skill matches ("Who can teach me React?")
  - [x] Platform guidance ("How do credits work?")

### 💬 Real-Time Messaging & Notifications
- [x] **Direct Messaging** — Peer-to-peer chat interface to coordinate sessions
- [x] **Live Presence** — Online status indicators (green dots) for active users via Supabase Presence
- [x] **Read Receipts** — "Read" ticks for sent messages
- [x] **File & Voice Sharing** — Attach documents or record voice memos directly in the chat
- [x] **Live Notifications** — Instant alerts when someone requests a session with you

### 💰 Credit Economy
- [x] Start with 10 credits
- [x] Teaching a session = +1 credit earned
- [x] Learning a session = -1 credit spent
- [x] Credit balance displayed across dashboard

### 📹 WebRTC Video Calls
- [x] Peer-to-peer video/audio sessions via WebRTC signaling
- [x] Session room pages with join functionality

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Web + API in one repo |
| **Language** | TypeScript 5.8 (strict) | Type safety across the board |
| **Styling** | Tailwind CSS | Utility-first, mobile-first |
| **Icons** | Lucide React | Consistent iconography |
| **Database** | Supabase — PostgreSQL | Relational data + Row Level Security |
| **Auth** | Supabase Auth | Email/password, GitHub OAuth, Magic Links |
| **Realtime** | Supabase Realtime | Live notifications via postgres_changes |
| **AI / LLM** | Groq API — `llama-3.1-8b-instant` | AI matching + streaming chatbot |
| **Video/Audio** | WebRTC | In-app P2P video sessions |
| **Deployment** | Vercel | CI/CD, preview URLs, edge runtime |

---

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx                           # Root layout with providers + fonts
│   ├── page.tsx                             # Landing page
│   ├── globals.css                          # Design tokens + theme variables
│   │
│   ├── (auth)/                              # Auth pages (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── auth/callback/route.ts               # OAuth callback handler
│   ├── onboarding/page.tsx                  # Guided skill selection + profile setup
│   │
│   ├── dashboard/                           # Protected dashboard section
│   │   ├── layout.tsx                       # Auth guard + Sidebar + TopBar + ChatbotWidget
│   │   ├── page.tsx                         # Marketplace (browse skill listings)
│   │   ├── matches/page.tsx                 # AI-powered peer matching
│   │   ├── sessions/page.tsx                # Active & completed sessions
│   │   ├── sessions/[id]/page.tsx           # Individual session / video call room
│   │   ├── profile/page.tsx                 # Full profile editor
│   │   ├── reviews/page.tsx                 # Peer review system
│   │   └── leaderboard/page.tsx             # Top contributors ranked
│   │
│   └── api/                                 # API routes
│       ├── ai/match/route.ts                # POST — Groq AI matching endpoint
│       ├── ai/chat/route.ts                 # POST — Streaming AI chatbot (Llama 3.1)
│       ├── sessions/create/route.ts         # POST — Create session + notify teacher
│       ├── sessions/accept/route.ts         # POST — Accept session request
│       ├── sessions/end/route.ts            # POST — End session + credit transfer
│       ├── reviews/route.ts                 # POST — Submit peer review
│       └── health/route.ts                  # GET  — Health check
│
├── components/
│   ├── dashboard/                           # Dashboard-specific components
│   │   ├── Sidebar.tsx                      # Collapsible sidebar navigation
│   │   ├── TopBar.tsx                       # Search + credits + live notifications + avatar
│   │   ├── StatsOverview.tsx                # Clickable stat cards (credits, sessions, rating)
│   │   ├── SkillCard.tsx                    # Marketplace listing card
│   │   └── CreditBadge.tsx                  # Credit display badge
│   │
│   ├── shared/                              # Reusable UI components
│   │   ├── Navbar.tsx                       # Landing page navbar
│   │   ├── Footer.tsx                       # Landing page footer
│   │   ├── GlassCard.tsx                    # Glassmorphic card component
│   │   ├── GradientButton.tsx               # Gradient action button
│   │   ├── SkillBadge.tsx                   # Skill tag (have/want variants)
│   │   ├── AnimatedCounter.tsx              # Animated number counter
│   │   ├── ChatbotWidget.tsx                # Floating AI chatbot with markdown
│   │   ├── ThemeToggle.tsx                  # Dark/light mode toggle
│   │   ├── PageWrapper.tsx                  # Container utility
│   │   ├── LoadingSpinner.tsx               # Loading state
│   │   └── ErrorBoundary.tsx                # Error boundary
│   │
│   └── landing/                             # Landing page sections
│       └── Features.tsx                     # Feature showcase
│
├── hooks/
│   ├── useUser.ts                           # Auth + profile + skills state
│   └── useNotifications.ts                  # Real-time notification subscription
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # Browser Supabase client
│   │   └── server.ts                        # Server Supabase client
│   ├── constants.ts                         # Routes, skill categories, skill list
│   └── utils.ts                             # cn() helper + utilities
│
├── services/
│   ├── ai/
│   │   ├── groqClient.ts                    # Groq SDK singleton
│   │   ├── matchingAgent.ts                 # LLaMA3 matching workflow
│   │   └── prompts.ts                       # System & user prompt templates
│   │
│   └── webrtc/
│       ├── signaling.ts                     # WebRTC peer signaling logic
│       └── index.ts                         # Barrel export
│
├── supabase/
│   └── migrations/
│       ├── add_profile_fields.sql           # Extended profile columns (15 fields)
│       └── add_notifications_and_leaderboard.sql  # Notifications table + Realtime
│
├── types/
│   ├── database.ts                          # Supabase DB schema types
│   ├── api.ts                               # API payload types
│   └── index.ts                             # Global interfaces
│
├── supabase_schema.sql                      # Full database schema (profiles, skills, sessions, reviews)
├── .env.local.example                       # Environment variable template
├── next.config.ts                           # Next.js configuration
├── tailwind.config.ts                       # Tailwind configuration
├── tsconfig.json                            # TypeScript strict mode + aliases
└── package.json                             # Dependencies
```

---

## 🗄️ Database Schema

### Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | User profiles linked to auth | username, college, degree, city, credits, rating, etc. |
| `skills` | Skills users offer or want | user_id, skill_name, type (offered/desired) |
| `sessions` | Skill exchange sessions | teacher_id, learner_id, status (pending/active/completed) |
| `reviews` | Post-session peer reviews | session_id, reviewer_id, reviewee_id, rating (1-5), feedback |
| `notifications` | Real-time notification feed | user_id, type, title, message, link, is_read |

### Key Features
- **Row Level Security (RLS)** on all tables
- **Realtime** enabled on notifications table
- **Auto-triggers**: Profile creation on signup, average rating calculation on review

---

## 🔐 Environment Variables

Copy `.env.local.example` → `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Groq AI (server-only — never prefix with NEXT_PUBLIC_)
GROQ_API_KEY=your-groq-api-key-here

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚙️ Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/abhishiv17/Code-Carnage.git
cd Code-Carnage

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# → Fill in all values

# 4. Run the database migrations
# Go to Supabase Dashboard → SQL Editor → run:
#   - supabase_schema.sql (core tables)
#   - supabase/migrations/add_profile_fields.sql (extended profile)
#   - supabase/migrations/add_notifications_and_leaderboard.sql (notifications + realtime)

# 5. Start the development server
npm run dev
# → App runs at http://localhost:3000
```

### Pre-flight Checks

```bash
npx tsc --noEmit     # TypeScript check — zero errors required
npm run build        # Full production build
npm run lint         # ESLint check
```

---

## 👥 Team

| Name | Role | Domain |
|---|---|---|
| **Abhishek** | Lead / AI Architect | AI services, system architecture, merges |
| **Kiran** | Backend / Database | Supabase, auth, sessions, credit economy |
| **Arjun** | UI/UX | Components, pages, Tailwind theming |
| **Chethan** | API / Integration | API routes, WebRTC, data hooks |

---

## 🚀 Deployment

| Branch | Environment | URL |
|---|---|---|
| `main` | Production | Auto-deploys to Vercel |
| `dev` | Staging | Preview deployment |
| `feature/*` | Preview | Auto-generated per PR |

---

## 📚 Key References

| Resource | URL |
|---|---|
| Next.js App Router Docs | https://nextjs.org/docs/app |
| Supabase Auth (SSR) | https://supabase.com/docs/guides/auth/server-side/nextjs |
| Supabase Realtime | https://supabase.com/docs/guides/realtime |
| Groq API Reference | https://console.groq.com/docs/openai |
| Tailwind CSS | https://tailwindcss.com/docs |
| Lucide Icons | https://lucide.dev/icons |
