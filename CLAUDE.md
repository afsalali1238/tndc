# CLAUDE.md — NextDoorChef (nextdoorchef.com)

> Agent instruction file for Google Antigravity, Claude Code, Cursor, and Codex CLI.
> Read this file fully before touching any code. These rules are non-negotiable.
> Also read MEMORY.md and all files in .agents/skills/ before starting any task.

---

## Project Identity

**Product:** NextDoorChef — "Find the home chef next door who cooks what you miss from home."
**Domain:** https://nextdoorchef.com
**Market:** UAE only (Dubai initial focus, Abu Dhabi + Sharjah next)
**Stack:** Next.js 14 · Supabase · Vercel · Tailwind CSS · Leaflet.js · shadcn/ui · Framer Motion
**Phase:** Phase 1 MVP — Connect buyers to home chefs. No payments. WhatsApp contact only.
**Owner:** Afsal (non-technical — every decision must be explainable in plain language)
**Sister Project:** CraftersUnited (cr8un8.com) — same architecture, different vertical. Reference it for patterns.

---

## The Four Principles (Karpathy Rules)

### 1. Think Before Coding
- State all assumptions explicitly before writing a single line
- If two interpretations exist, present both and wait for clarification
- Never silently pick an approach — surface tradeoffs
- Stop when confused. Name what's unclear. Ask.

### 2. Simplicity First
- Minimum code that meets the stated goal. Nothing speculative.
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't asked for
- If 200 lines could be 50, rewrite it
- **Test:** Would a senior engineer call this overcomplicated? If yes, simplify.

### 3. Surgical Changes
- Touch only what the task requires
- Do not "improve" adjacent code, comments, or formatting
- Match existing code style even if you'd do it differently
- If you notice unrelated dead code, mention it — don't delete it
- Every changed line must trace directly back to the user's request

### 4. Goal-Driven Execution
- Transform every task into a verifiable success criterion before starting
- Multi-step tasks: write the plan first, get approval, then execute
- Loop until the criterion is met — don't declare victory early
- Format for plans:
```
1. [Step] → verify: [how to confirm it worked]
2. [Step] → verify: [how to confirm it worked]
```

---

## Architecture Overview

```
nextdoorchef/
├── CLAUDE.md                    ← You are here. Read first.
├── MEMORY.md                    ← Project state, decisions, session log
├── .env.example                 ← All required env vars (no values)
├── .agents/
│   └── skills/
│       ├── supabase.md          ← Supabase patterns, RLS, storage
│       ├── nextjs-patterns.md   ← App Router, Server/Client components
│       ├── leaflet-maps.md      ← Map implementation, chef pins
│       ├── design-system.md     ← Colors, fonts, tokens, component rules
│       └── whatsapp-contact.md  ← Contact deep link pattern
├── src/
│   ├── app/                     ← Next.js 14 App Router pages
│   │   ├── page.tsx             ← / Homepage
│   │   ├── dishes/
│   │   │   ├── page.tsx         ← /dishes Browse all dishes
│   │   │   └── [id]/page.tsx    ← /dishes/[id] Dish detail
│   │   ├── chefs/
│   │   │   ├── page.tsx         ← /chefs Chef directory + map
│   │   │   └── [id]/page.tsx    ← /chefs/[id] Chef profile + menu
│   │   ├── join/
│   │   │   └── page.tsx         ← /join Chef onboarding form
│   │   ├── map/
│   │   │   └── page.tsx         ← /map Full-screen interactive map
│   │   ├── admin/
│   │   │   └── page.tsx         ← /admin Chef approval dashboard
│   │   └── layout.tsx           ← Root layout, Nav, Footer
│   ├── components/
│   │   ├── ChefCard.tsx
│   │   ├── ChefGrid.tsx
│   │   ├── DishCard.tsx
│   │   ├── DishGrid.tsx
│   │   ├── MapView.tsx          ← Leaflet client component
│   │   ├── CuisineFilter.tsx
│   │   ├── AreaFilter.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── ChefOnboardingForm.tsx
│   │   └── SkeletonCard.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        ← Browser client
│   │   │   └── server.ts        ← Server component client
│   │   └── utils.ts
│   └── types/
│       └── index.ts             ← Chef, Dish, Cuisine TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── images/
└── docs/
    ├── ARCHITECTURE.md          ← ADR log, decisions
    └── SCHEMA.md                ← Database schema reference
```

---

## Tech Stack — Canonical Decisions

| Layer | Tool | Reason | Free Tier |
|---|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, SEO, Vercel-native | Unlimited |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent | Free |
| Animations | Framer Motion | Premium feel, 60fps | Free |
| Database | Supabase (PostgreSQL + PostGIS) | Auth + DB + Storage + geo queries | 500MB / 50k rows |
| Auth | Supabase Auth (Phone OTP) | UAE users prefer phone over email | Free |
| Storage | Supabase Storage | Chef photos, dish images | 1GB |
| Maps | Leaflet.js + OpenStreetMap | Fully free, no API key, no billing | Unlimited |
| Hosting | Vercel | Auto-deploy from GitHub | Free hobby |
| Contact | WhatsApp deep link (`wa.me`) | Zero backend needed | Free |
| Admin | Custom `/admin` page + Supabase table editor | Chef approval flow | Free |
| Loading states | Skeleton shimmer | CLS prevention, modern feel | — |
| SEO | Next.js dynamic metadata | Per-page chef/dish meta tags | — |

**DO NOT introduce any tool not on this list without asking first.**

---

## Database Schema (Source of Truth)

See `docs/SCHEMA.md` for full reference. Abbreviated here:

```sql
-- chefs
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text NOT NULL
bio             text
whatsapp        text NOT NULL          -- format: 971XXXXXXXXX (no +)
photo_url       text                   -- Supabase storage path
cuisine_type    text NOT NULL          -- see CUISINE TYPES below
specialty       text                   -- one-line: "Known for Kerala fish curry"
area            text NOT NULL          -- Dubai neighbourhood
lat             decimal(10,7)          -- geocoded from area
lng             decimal(10,7)
is_approved     boolean DEFAULT false  -- admin gate
is_active       boolean DEFAULT true
has_permit      boolean DEFAULT false  -- UAE food safety permit
accepts_custom  boolean DEFAULT true   -- custom orders/requests
created_at      timestamptz DEFAULT now()

-- dishes
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
chef_id         uuid REFERENCES chefs(id) ON DELETE CASCADE
name            text NOT NULL
description     text
price_aed       numeric(8,2)           -- display only, no checkout
image_url       text
cuisine_type    text
dietary_tags    text[]                 -- ['halal','vegetarian','vegan','gluten-free']
available_today boolean DEFAULT true   -- chef toggles daily
created_at      timestamptz DEFAULT now()
```

### Cuisine Types (seed data)
```
Emirati · South Indian · North Indian · Pakistani · Filipino
Cantonese · Lebanese · Egyptian · Turkish · West African
Syrian · Ethiopian · Sri Lankan · Indonesian · Bangladeshi
```

### Dubai Areas (seed data)
```
Jumeirah · Karama · Deira · Bur Dubai · Al Barsha
Business Bay · Downtown Dubai · Discovery Gardens · Al Nahda
Mirdif · JVC · Dubai Marina · Al Qusais · Satwa
```

---

## Pages — Phase 1 (Build in this order)

| Priority | Route | Description | Success Criterion |
|---|---|---|---|
| 1 | `/` | Homepage: hero + search + featured dishes + chef spotlight + how it works | Renders 4 dish cards + 3 chef cards from Supabase |
| 2 | `/chefs` | Chef directory: filterable grid + side map | Filter by cuisine/area works; map pins match cards |
| 3 | `/chefs/[id]` | Chef profile: photo + bio + full menu + WhatsApp button | WhatsApp link opens with pre-filled message |
| 4 | `/dishes` | Browse all dishes: filter by cuisine/dietary/area | Filter + search works |
| 5 | `/dishes/[id]` | Dish detail: photo + description + chef info + order button | "Order via WhatsApp" link resolves correctly |
| 6 | `/map` | Full-screen interactive map, all chef pins | Pins cluster on mobile; clicking pin shows chef popup |
| 7 | `/join` | Chef onboarding form | Data saves to Supabase `chefs` table with `is_approved=false` |
| 8 | `/admin` | Protected: approve/reject chefs, view pending | Only accessible with admin Supabase role |

---

## Component Rules

- **Never build a component that does more than one thing**
- Keep components under 150 lines — split if longer
- All data fetching in Server Components (app/ directory)
- Client Components (`"use client"`) only for: MapView, CuisineFilter, AreaFilter, ChefOnboardingForm
- Use shadcn/ui for all UI primitives — never write custom buttons/inputs/modals from scratch
- Skeleton loading for every async grid or list

### Naming Conventions
```
ChefCard.tsx          ← single chef in grid
ChefGrid.tsx          ← wraps multiple ChefCards
DishCard.tsx          ← single dish
DishGrid.tsx          ← wraps multiple DishCards
MapView.tsx           ← Leaflet map (client component)
CuisineFilter.tsx     ← filter chips row (client component)
AreaFilter.tsx        ← area filter (client component)
WhatsAppButton.tsx    ← green WA button with pre-filled message
ChefOnboardingForm.tsx ← /join form (client component)
SkeletonCard.tsx      ← shimmer placeholder
```

---

## WhatsApp Contact Logic

```typescript
// Pre-filled message for dish order
const dishOrderUrl = (chef: Chef, dish: Dish) =>
  `https://wa.me/${chef.whatsapp}?text=${encodeURIComponent(
    `Hello ${chef.name}! I found you on NextDoorChef and I'd like to order: ${dish.name}. Is it available?`
  )}`

// Generic chef contact
const chefContactUrl = (chef: Chef) =>
  `https://wa.me/${chef.whatsapp}?text=${encodeURIComponent(
    `Hello ${chef.name}! I found you on NextDoorChef and I'm interested in your food. Can you share today's menu?`
  )}`
```

No messaging backend. No database writes. Pure deep links.
See `.agents/skills/whatsapp-contact.md` for full patterns.

---

## Environment Variables

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only, admin operations
NEXT_PUBLIC_SITE_URL=https://nextdoorchef.com
```

---

## Supabase RLS Policies

```sql
-- Public: read approved, active chefs only
CREATE POLICY "Public read approved chefs"
ON chefs FOR SELECT
USING (is_approved = true AND is_active = true);

-- Public: read dishes of approved chefs
CREATE POLICY "Public read dishes"
ON dishes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chefs
    WHERE chefs.id = dishes.chef_id
    AND chefs.is_approved = true
    AND chefs.is_active = true
  )
);

-- Service role bypasses all RLS (admin operations server-side only)
```

---

## What NOT to Build in Phase 1

- ❌ Cart / checkout / any payment processing
- ❌ In-app messaging (WhatsApp link replaces this entirely)
- ❌ Reviews or ratings
- ❌ Chef self-service dashboard (Afsal approves/manages)
- ❌ Email notifications
- ❌ Full-text search (filter chips only in Phase 1)
- ❌ Mobile app
- ❌ Any third-party paid API
- ❌ Google Maps (Leaflet + OpenStreetMap is free and sufficient)
- ❌ Community/forums (Phase 3+)

If a feature isn't in the Pages table above, ask before building it.

---

## Design System

See `.agents/skills/design-system.md` for the full token set.

**Quick reference:**
- Primary: Saffron `#E8960A` (amber/golden)
- Accent: Terracotta `#C4522A`
- Background: Warm cream `#FBF4E8`
- Dark: Deep brown `#1A0F06`
- Font display: Playfair Display (serif — warmth, heritage)
- Font body: DM Sans (clean, readable)
- Border radius: 12px cards, 8px inputs, 50px chips
- Shadows: subtle warm `rgba(26,15,6,.07)`

---

## Deployment

1. Push to GitHub (`main` branch)
2. Vercel auto-deploys on every push (zero configuration)
3. Custom domain: `nextdoorchef.com` → set in Vercel dashboard
4. Supabase project stays on free tier — no changes needed
5. Run migrations via Supabase dashboard SQL editor (paste `001_initial_schema.sql`)

---

## Agent Execution Protocol

When Afsal gives a task:

1. **Read MEMORY.md first** — check if a decision was already made
2. **Read the relevant skill file** — e.g. maps task → read `leaflet-maps.md` first
3. **State your plan** in step format — get confirmation before writing code
4. **Build the smallest thing** that meets the success criterion
5. **Verify** the criterion explicitly before declaring done
6. **Update MEMORY.md** — append new decisions, progress, blockers

Never start coding without a plan. Never declare success without verifying.
