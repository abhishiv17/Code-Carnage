# 🚀 Code Carnage 2.0 — Team Boilerplate

> **Problem Statement:** College students want to learn new skills from each other (e.g., Python for Guitar) but lack money for formal coaching and a platform to connect.
>
> **Our Solution:** A Peer-to-Peer Skill Barter Platform. Students list skills they have and want to learn. Our Groq AI engine matches compatible pairs. Sessions are conducted via in-app WebRTC video calls, fueled by a skill credit economy where teaching earns credits and learning spends them. Quality is maintained through a peer rating system and verified badges.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3FCF8E?logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA3-F55036)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://typescriptlang.org)

---

## 📋 Scaffold Status Tracker

> **Instructions:** Update this table as you build. Move each item from 🔲 SCAFFOLD → 🔨 IN PROGRESS → ✅ DONE.

| Area | File / Feature | Status | Owner |
|---|---|---|---|
| Landing Page | `app/page.tsx` | 🔲 SCAFFOLD | Arjun |
| Auth — Login | `app/(auth)/login/page.tsx` | 🔲 SCAFFOLD | Kiran |
| Auth — Signup | `app/(auth)/signup/page.tsx` | 🔲 SCAFFOLD | Kiran |
| Dashboard Page | `app/dashboard/page.tsx` | 🔲 SCAFFOLD | Arjun |
| Dashboard Layout + Auth Guard | `app/dashboard/layout.tsx` | 🔲 SCAFFOLD | Kiran |
| AI Matching Endpoint | `app/api/ai/match/route.ts` | ✅ DONE | Abhishek |
| Groq Matching Agent | `services/ai/matchingAgent.ts` | ✅ DONE | Abhishek |
| AI Prompts | `services/ai/prompts.ts` | ✅ DONE | Abhishek |
| WebRTC Signaling | `services/webrtc/signaling.ts` | ✅ DONE | Chethan |
| Video Call Room | `app/dashboard/sessions/[id]/page.tsx` | 🔲 SCAFFOLD | Arjun |
| Session Create Endpoint | `app/api/sessions/create/route.ts` | ✅ DONE | Kiran |
| Credit Economy Endpoint | `app/api/sessions/end/route.ts` | ✅ DONE | Kiran |
| Reviews Endpoint | `app/api/reviews/route.ts` | ✅ DONE | Chethan |
| Navbar (Web + Mobile) | `components/shared/Navbar.tsx` | 🔲 SCAFFOLD | Arjun |
| Footer | `components/shared/Footer.tsx` | 🔲 SCAFFOLD | Arjun |
| Database Schema | `types/database.ts` | ✅ DONE | Kiran |
| API Types | `types/api.ts` | 🔲 SCAFFOLD | Chethan |
| App Constants | `lib/constants.ts` | 🔲 SCAFFOLD | All |
| Supabase Client | `lib/supabase/client.ts` | ✅ DONE | Kiran |
| Supabase Server | `lib/supabase/server.ts` | ✅ DONE | Kiran |
| Session Accept Endpoint | `app/api/sessions/accept/route.ts` | ✅ DONE | Kiran |
| Realtime Session Notifications | `services/realtime/sessions.ts` | ✅ DONE | Chethan |
| Backend Test Page | `app/test/page.tsx` | ✅ DONE | Abhishek |
| Health Check API | `app/api/health/route.ts` | ✅ DONE | Abhishek |

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Web + API in one repo |
| **Language** | TypeScript 5.8 (strict) | Type safety across the board |
| **Styling** | Tailwind CSS v4 | Utility-first, mobile-first |
| **Components** | shadcn/ui | Accessible, composable UI primitives |
| **Icons** | Lucide React | Consistent iconography |
| **Database** | Supabase — PostgreSQL | Relational data + Row Level Security |
| **Auth** | Supabase Auth | Email/password, OAuth, session cookies |
| **Realtime** | Supabase Realtime | Live data subscriptions |
| **Storage** | Supabase Storage | File uploads, media |
| **AI / LLM** | Groq API — `llama3-8b-8192` | Ultra-fast inference for AI peer matching |
| **Video/Audio** | WebRTC + PeerJS | In-app P2P video sessions |
| **Deployment** | Vercel | CI/CD, preview URLs, edge runtime |

---

## 🎨 Design & Theming Profiles

Our boilerplate is currently pre-configured with the **"Command Center"** profile (Dark Mode Default, Slate Base, Violet Primary, 0.3rem Radius), which is perfect for AI and Infrastructure tools. 

If your hackathon idea pivots, you can easily switch to one of these alternative UI profiles using the `shadcn/ui` theme builder:

### 1. The 'Command Center' Profile (Default)
- **Best for:** AI & Infrastructure tools
- **Style:** Nova (`new-york`)
- **Base Color:** Slate or Zinc
- **Theme/Primary Color:** Violet or Blue
- **Radius:** 0.3rem or 0rem
- **Why it stands out:** Creates a sleek, terminal-inspired aesthetic. When displaying reasoning logs, API responses, or system diagnostics, the sharp edges and cool slate tones give the interface a high-tech, enterprise-grade feel.

### 2. The 'Eco-Metrics' Profile
- **Best for:** Sustainability & Logistics
- **Style:** Default
- **Base Color:** Stone
- **Theme/Primary Color:** Green
- **Radius:** 0.75rem or 1.0rem
- **Why it stands out:** For rendering carbon footprint charts or mapping efficient route logistics, Stone paired with Green feels organic yet strictly data-driven. The softer rounded corners make dense data visualizations more approachable without losing readability.

### 3. The 'Critical Alert' Profile
- **Best for:** High-Impact Demos
- **Style:** Nova (`new-york`)
- **Base Color:** Neutral
- **Theme/Primary Color:** Rose or Orange
- **Radius:** 0.5rem
- **Why it stands out:** During a quick presentation, eyes need to be drawn immediately to the problem the system is solving. Using Rose or Orange accents against a stark Neutral background makes error states, alerts, or bottleneck resolutions pop right off the screen.

> **Boilerplate Integration Tip:** 
> After selecting these exact settings on the `shadcn/ui` builder, simply click **Copy Code** and drop the generated `components.json` and CSS variables straight into the codebase. Toggling on the dark mode default in `app/layout.tsx` is highly recommended—complex dashboards built under a tight timeline almost always look significantly more polished and visually cohesive in dark mode.

---

## 📁 Directory Structure

> Every file marked `[SCAFFOLD]` is pre-wired and ready to be filled in with your feature logic. Do not rename or move scaffold files — update their internals instead.

```
.
├── app/                                     # Next.js App Router root
│   ├── layout.tsx                           # [SCAFFOLD] Root layout — add providers here
│   ├── page.tsx                             # [SCAFFOLD] Landing / home page
│   ├── globals.css                          # [SCAFFOLD] Tailwind + CSS variable tokens
│   │
│   ├── (auth)/                              # Route group — unauthenticated pages (no layout)
│   │   ├── login/
│   │   │   └── page.tsx                    # [SCAFFOLD] Supabase email/password sign-in
│   │   └── signup/
│   │       └── page.tsx                    # [SCAFFOLD] New user registration
│   │
│   ├── dashboard/                           # Protected section — requires active session
│   │   ├── layout.tsx                       # [SCAFFOLD] Auth guard + Navbar wrapper
│   │   └── page.tsx                         # [SCAFFOLD] Main dashboard view
│   │
│   └── api/                                 # Serverless API route handlers
│       ├── ai/
│       │   └── match/
│       │       └── route.ts                # [SCAFFOLD] POST — Groq LLaMA3 matching endpoint
│       ├── webhook/
│       │   └── route.ts                    # [SCAFFOLD] POST — Inbound event receiver
│       └── health/
│           └── route.ts                    # [DONE]    GET  — Service health check
│
├── components/
│   ├── ui/                                  # ⚙️  AUTO-GENERATED by shadcn CLI — DO NOT edit
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   └── ...                             # Add via: npx shadcn@latest add <component>
│   │
│   └── shared/                              # ✏️  CUSTOM — Team-authored reusable components
│       ├── Navbar.tsx                       # [SCAFFOLD] Responsive nav — web + mobile hamburger
│       ├── Footer.tsx                       # [SCAFFOLD] Global footer with project links
│       ├── PageWrapper.tsx                  # [SCAFFOLD] Max-width container utility
│       ├── LoadingSpinner.tsx               # [SCAFFOLD] Spinner + full-page loading state
│       └── ErrorBoundary.tsx               # [SCAFFOLD] Client-side React error boundary
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # [DONE] Browser Supabase client (use in "use client")
│   │   └── server.ts                        # [DONE] Server Supabase client (use in RSC/routes)
│   ├── utils.ts                             # [SCAFFOLD] cn() helper + shared utility functions
│   └── constants.ts                         # [SCAFFOLD] APP_NAME, ROUTES, NAV_LINKS, GROQ_CONFIG
│
├── services/
│   ├── ai/
│   │   ├── groqClient.ts                    # [DONE] Groq SDK singleton (server-only)
│   │   ├── matchingAgent.ts                 # [SCAFFOLD] LLaMA3 agentic matching workflow
│   │   └── prompts.ts                       # [SCAFFOLD] All system & user prompt templates
│   │
│   └── webrtc/
│       ├── signaling.ts                     # [SCAFFOLD] WebRTC peer signaling logic
│       └── index.ts                         # [SCAFFOLD] Barrel export for webrtc
│
├── types/
│   ├── database.ts                          # [SCAFFOLD] Supabase DB schema types (auto-gen later)
│   ├── api.ts                               # [SCAFFOLD] API request/response payload types
│   └── index.ts                             # [SCAFFOLD] Global interfaces, enums, utility types
│
├── public/
│   ├── favicon.ico                          # [SCAFFOLD] Replace with your project favicon
│   ├── logo.svg                             # [SCAFFOLD] Replace with your project logo
│   └── images/                              # Static image assets
│
├── .env.local                               # 🔒 SECRET — Never commit. Add to .gitignore ✓
├── .env.local.example                       # ✅ Committed — template for teammates
├── .gitignore                               # Pre-configured for Next.js + Supabase + Vercel
├── components.json                          # shadcn/ui CLI configuration
├── next.config.ts                           # [SCAFFOLD] Image domains, experimental flags
├── tailwind.config.ts                       # Tailwind v4 config (CSS-first)
├── tsconfig.json                            # TypeScript strict mode + path aliases
└── package.json                             # All dependencies pinned — see requirements.txt
```

---

## 🔐 Environment Variables

Copy `.env.local.example` → `.env.local` and fill in your credentials before running the app.

```bash
cp .env.local.example .env.local
```

```bash
# .env.local.example

# ─── Supabase ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# ─── Groq AI ──────────────────────────────────────────────────────────────────
# SERVER-ONLY — never prefix with NEXT_PUBLIC_
GROQ_API_KEY=your-groq-api-key-here

# ─── App Config ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── External Integrations (add as needed) ────────────────────────────────────
# EXTERNAL_API_BASE_URL=https://api.example.com
# EXTERNAL_API_KEY=your-external-api-key-here
# WEBHOOK_SECRET=your-webhook-signing-secret
```

> **Security rules:**
> - `NEXT_PUBLIC_*` vars are bundled into the browser. Use only for non-sensitive config.
> - `GROQ_API_KEY` is server-only. Never reference it in `"use client"` files.
> - `.env.local` is already in `.gitignore`. Never commit it.

---

## ⚙️ Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO

# 2. Switch to dev immediately (never work on main)
git checkout dev

# 3. Install all dependencies
npm install

# 4. Set up environment variables
cp .env.local.example .env.local
# → Open .env.local and fill in all values before continuing

# 5. Start the development server
npm run dev
# → App runs at http://localhost:3000
```

### Pre-flight Build Check

Run this before pushing or opening a PR to catch errors early:

```bash
npm run build        # Full production build — must pass before PR
npm run lint         # ESLint check — zero errors allowed
npx tsc --noEmit     # TypeScript check — zero errors allowed
```

### Adding shadcn/ui Components

```bash
# Always use the CLI — never create files in /components/ui manually
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add sheet
npx shadcn@latest add select
npx shadcn@latest add avatar
```

### Generating Supabase Types

```bash
# After finalising your database schema, auto-generate types/database.ts:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

---

## 📱 Web & Mobile Architecture Notes

This boilerplate is intentionally structured as a **universal foundation** for both web and native mobile (via React Native / Expo) targets.

| Concern | Web (This Repo) | Mobile (Future) |
|---|---|---|
| **Auth** | Supabase cookie sessions | Supabase token + AsyncStorage |
| **Realtime** | Supabase Realtime channels | Supabase Realtime channels |
| **AI Calls** | Via `/api/ai/parse` route | Same endpoint (REST) |
| **UI Components** | shadcn/ui + Tailwind | NativeWind + RN equivalents |
| **Navigation** | Next.js App Router | React Navigation |
| **Storage** | Supabase Storage (URLs) | Same (shared bucket) |

**Key design decisions that keep mobile in mind:**
- All AI and data logic lives in `services/` — portable, framework-agnostic.
- All database types live in `types/database.ts` — shareable with a mobile workspace.
- API routes in `app/api/` act as a backend for both web and mobile clients.
- No UI logic in `lib/` or `services/` — clean separation of concerns.

---

## 👥 Team Roles & Ownership

| Name | Role | Primary Domain | Do Not Touch |
|---|---|---|---|
| **Abhishek** | Lead Maintainer / AI Architect | `services/ai/`, PR reviews, system architecture, merges | — |
| **Kiran** | Database / Backend Schema | `lib/supabase/`, `types/database.ts`, Supabase migrations, RLS policies | `services/ai/` |
| **Arjun** | UI/UX Components | `components/shared/`, `app/**/page.tsx` layouts, Tailwind theming | `app/api/` |
| **Chethan** | API Integration / Frontend Wiring | `app/api/`, `services/integrations/`, data-fetching hooks | `lib/supabase/` |

---

## 🌿 Git Branching Strategy

### Branch Hierarchy

```
main            ← 🚨 PRODUCTION. Auto-deploys to Vercel. No direct pushes. Ever.
  └── dev       ← 🔀 STAGING. All PRs target this branch. Merged to main for releases.
        ├── feature/abhishek-groq-agent
        ├── feature/kiran-auth-schema
        ├── feature/arjun-navbar
        └── feature/chethan-api-wiring
```

### ⚠️ Cardinal Rules

1. **`main` is sacred.** Only Abhishek merges `dev` → `main` for a release cut. No exceptions.
2. **`dev` is staging.** Never push to `dev` directly. All changes arrive via Pull Request.
3. **Always branch from `dev`.** Before creating your branch, run `git pull origin dev`.
4. **Branch naming:** `feature/<your-name>-<short-description>` — e.g. `feature/arjun-sidebar-nav`.
5. **Commit often.** Micro-commits with clear messages beat giant end-of-session dumps.

### Pull Request Workflow

```
1. Push your feature branch to GitHub.
2. Open a PR: your-branch → dev (NOT main).
3. Verify the Vercel Preview deployment is green.
4. Assign Abhishek as reviewer.
5. Fix any review comments → push to same branch.
6. Abhishek approves & squash-merges into dev.
```

> 🔥 **Before every PR:** Pull `dev` into your branch locally and fix any conflicts first.
> See `git-cheatsheet.txt` for the exact 7-step sync sequence.

---

## 🚀 Deployment

| Branch | Environment | Trigger | URL |
|---|---|---|---|
| `main` | Production | Push / merge to main | `https://your-app.vercel.app` |
| `dev` | Staging | Push / merge to dev | `https://your-app-git-dev-yourorg.vercel.app` |
| `feature/*` | Preview | Every push to feature branch | Auto-generated per PR |

**Build health rules:**
- `npm run build` must succeed with zero errors locally before any push.
- TypeScript errors (`tsc --noEmit`) = blocked PR. No exceptions.
- ESLint errors (`npm run lint`) = blocked PR. Warnings are acceptable.
- A red Vercel preview build on your PR must be fixed before review is requested.

---

## 🗺️ Hackathon Sprint Checklist

Use this during the event to stay on track:

```
Hour 0–1   [ ] All teammates: clone repo, run dev server, confirm env vars work
           [ ] Kiran: create Supabase project, define Skill, Credit, and Session schemas
           [ ] Abhishek: finalize Groq AI matching prompt strategy, test /api/ai/match
           [ ] Arjun: scaffold Find a Peer UI and Video Room UI
           [ ] Chethan: set up PeerJS/WebRTC signaling foundation

Hour 1–6   [ ] Core feature loop working: Input Skill -> Groq AI Match -> Save to DB
           [ ] Auth flow: signup -> email confirm -> dashboard redirect
           [ ] Each member: open first PR to dev, Abhishek reviews & merges

Hour 6–18  [ ] WebRTC Integration: Start a call, transmit video/audio between peers
           [ ] Economy Logic: Deduct credit on joining call, add credit to teacher
           [ ] Peer Rating System: Post-call modal to rate the peer
           [ ] Mobile responsiveness pass (Arjun)

Hour 18–23 [ ] Final PR: dev -> main (Abhishek)
           [ ] Production Vercel URL confirmed green
           [ ] Demo flow rehearsed (matching Python with Guitar -> Call -> Rate)

Hour 24    [ ] Submission with production URL + GitHub repo link
```

---

## 📚 Key Reference Links

| Resource | URL |
|---|---|
| Next.js App Router Docs | https://nextjs.org/docs/app |
| Supabase Auth (SSR) | https://supabase.com/docs/guides/auth/server-side/nextjs |
| Supabase JS Client | https://supabase.com/docs/reference/javascript |
| shadcn/ui Components | https://ui.shadcn.com/docs/components |
| Groq API Reference | https://console.groq.com/docs/openai |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| Vercel Deployment | https://vercel.com/docs/deployments/overview |
| Lucide Icons | https://lucide.dev/icons |
