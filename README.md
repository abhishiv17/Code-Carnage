# 🚀 SkillSwap 2.0 — Peer-to-Peer Skill Barter Platform

> **Problem Statement:** College students want to learn new skills from each other (e.g., Python for Guitar) but lack money for formal coaching and a platform to connect.
>
> **Our Solution:** A Peer-to-Peer Skill Barter Platform. Students list skills they have and want to learn. Our Groq AI engine matches compatible pairs. Sessions are conducted via in-app WebRTC video calls, fueled by a skill credit economy where teaching earns credits and learning spends them. Quality is maintained through a peer rating system, verified badges, and a thriving community forum.

**🌐 Live Demo:** [https://code-carnage.vercel.app/](https://code-carnage.vercel.app/)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://code-carnage.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3FCF8E?logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA3.1-F55036)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://typescriptlang.org)

---

## 🏆 Version 2.0 Highlights
- **AI Skill Recommendations:** Personalized learning paths suggested by Llama 3.1 based on your profile and goals.
- **Community Forum:** A centralized hub for discussions, Q&A, and showcasing student projects with upvoting and "Solution" marking.
- **Resource Library:** A crowdsourced repository to share and discover videos, articles, and e-books.
- **Gamified Badges & Milestones:** Earn 14+ unique badges (e.g., "Top Teacher", "Skill Pioneer") and track your journey via interactive milestones.
- **Skill Library:** Explore a comprehensive library of skills with real-time demand and teacher statistics.

---

## ✨ Features

### 🏠 Landing Page
- [x] Stunning glassmorphic landing page with dark mode support
- [x] Animated statistics, feature cards, and smooth scroll navigation
- [x] Version 2.0 feature showcase (AI, Forum, Badges)

### 📊 Dashboard & Community
- **Marketplace** — Browse and discover skill listings from other students
- **Skill Library** — Explore all available skills with teacher/learner stats and average ratings
- **AI Recommendations** — Get personalized skill suggestions from Llama 3.1
- **Community Forum** — Post discussions, ask for help, upvote content, and mark solutions
- **Resource Library** — Share and upvote learning materials (videos, articles, books)
- **Badges & Milestones** — Track progress and earn verified badges for your profile
- **Leaderboard** — Top contributors ranked by sessions, ratings, and credits

### 🤖 AI-Powered Features
- [x] **Smart Matchmaker** — AI recommends peers based on skills, college, and city
- [x] **Skill Suggestions** — Personalized "What to learn next" engine
- [x] **Persistent AI Chatbot** — Floating assistant for quizzes, file handling, and platform guidance

### 💬 Real-Time Messaging & Notifications
- [x] **Direct Messaging** — Coordinate sessions with peers
- [x] **Live Presence** — Online status indicators
- [x] **Live Notifications** — Instant alerts for session requests and upvotes

### 📹 WebRTC Video Calls
- [x] Peer-to-peer video/audio sessions directly in the browser
- [x] Auto-credit transfer upon session completion

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Web + API in one repo |
| **Language** | TypeScript 5.8 (strict) | Type safety |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Database** | Supabase — PostgreSQL | Relational data + RLS |
| **AI / LLM** | Groq API — `llama-3.1-8b-instant` | Recommendations + Chatbot |
| **Realtime** | Supabase Realtime | Notifications + Presence |
| **Video** | WebRTC | In-app P2P video sessions |

---

## 📁 Project Structure

```
.
├── app/
│   ├── dashboard/
│   │   ├── forum/           # Community Forum (list, detail, new)
│   │   ├── skills/          # Skill Library & AI Recommendations
│   │   ├── resources/       # Resource Library
│   │   ├── profile/         # Profile with Badges & Milestones
│   │   └── sessions/        # WebRTC session rooms
│   └── api/
│       ├── ai/recommendations  # Llama 3.1 suggestions
│       └── badges/             # Badge logic & awarding
├── components/
│   ├── dashboard/
│   │   ├── AIRecommendations.tsx
│   │   ├── BadgesSection.tsx
│   │   └── Sidebar.tsx      # Updated navigation
│   └── shared/
│       └── LanguageSelector.tsx # Multi-language support
├── supabase/
│   └── migrations/
│       ├── add_badges_system.sql
│       ├── add_community_forum.sql
│       └── add_resources_table.sql
```

---

## 🗄️ Database Schema

### New Tables (v2.0)

| Table | Purpose |
|---|---|
| `badges` | Definition of all awardable badges |
| `user_badges` | Junction table for user-earned badges |
| `forum_posts` | Discussions, Q&A, and project showcases |
| `forum_comments` | Replies with "Solution" marking |
| `resources` | Shared learning links and files |

---

## ⚙️ Local Setup

```bash
# 1. Clone & Install
git clone https://github.com/abhishiv17/Code-Carnage.git
cd Code-Carnage
npm install

# 2. Database Migrations (Run in Supabase SQL Editor)
# - supabase_schema.sql
# - supabase/migrations/add_badges_system.sql
# - supabase/migrations/add_community_forum.sql
# - supabase/migrations/add_resources_table.sql

# 3. Start
npm run dev
```

---

## 🚀 Deployment

The platform is deployed on **Vercel** with automatic CI/CD from the `main` branch. 

[https://code-carnage.vercel.app/](https://code-carnage.vercel.app/)
