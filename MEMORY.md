# MEMORY.md — NextDoorChef Project State

> This file is the agent's persistent memory. Read it at the start of every session.
> Update it at the end of every session with new decisions, progress, and blockers.
> Never delete entries — append only (mark old decisions as superseded if changed).

---

## Project Status

**Current Phase:** Phase 1 — MVP (Buyer ↔ Chef Connection, No Payments)
**Build Status:** 🟡 In progress — Homepage + foundation scaffolded, build passes
**Domain:** nextdoorchef.com (acquired)
**Last Updated:** 2026-05-09
**Active Sprint Goal:** Stand up Phase 1 MVP — all 8 pages functional

---

## Infrastructure Checklist

- [ ] Supabase project created
- [ ] PostGIS extension enabled (`CREATE EXTENSION postgis;`)
- [ ] Database schema migrated (`001_initial_schema.sql`)
- [ ] Seed data: cuisine types + Dubai areas inserted
- [ ] Supabase Storage buckets created (`chef-photos`, `dish-images`)
- [ ] RLS policies applied
- [ ] GitHub repo created
- [ ] Vercel project connected to GitHub
- [ ] `nextdoorchef.com` domain pointed to Vercel
- [ ] `.env.local` configured with Supabase keys
- [ ] Seed data: 3–5 chef profiles for testing
- [ ] Homepage live
- [ ] All 8 Phase 1 routes verified

---

## Architectural Decisions (ADR Log)

### ADR-001: No payments in Phase 1
**Date:** 2026-05-09
**Decision:** Skip all payment infrastructure. Contact via WhatsApp only.
**Reason:** Fastest path to connecting buyers and chefs. Validate demand before complexity.
**Status:** Active

### ADR-002: Leaflet + OpenStreetMap instead of Google Maps
**Date:** 2026-05-09
**Decision:** Use Leaflet.js with OpenStreetMap tiles. Same choice as cr8un8.
**Reason:** Google Maps requires billing setup and API key. Leaflet is fully free, no key needed, works identically in UAE.
**Status:** Active

### ADR-003: Supabase for all backend
**Date:** 2026-05-09
**Decision:** Supabase handles DB (PostgreSQL + PostGIS), Auth, and Storage. No separate backend server.
**Status:** Active

### ADR-004: Phone OTP auth (not email)
**Date:** 2026-05-09
**Decision:** Supabase Auth with phone OTP via Twilio for chef login.
**Reason:** UAE users — especially expat home chefs — strongly prefer phone-based auth. No one uses email for this use case.
**Status:** Active (Twilio Verify required for SMS in UAE)

### ADR-005: WhatsApp as the order/contact channel
**Date:** 2026-05-09
**Decision:** All buyer-chef communication goes through `wa.me` deep links with pre-filled messages.
**Reason:** 95%+ of UAE residents use WhatsApp actively. Zero backend complexity.
**Status:** Active

### ADR-006: No Instagram field
**Date:** 2026-05-09
**Decision:** Unlike cr8un8, NextDoorChef chefs have WhatsApp only (no Instagram field on chef record).
**Reason:** Food ordering is transactional — WhatsApp is sufficient. Keeps schema clean.
**Status:** Active

### ADR-007: `available_today` boolean on dishes
**Date:** 2026-05-09
**Decision:** Dish record has `available_today` boolean. Chefs toggle it daily.
**Reason:** Home menus change daily unlike craft listings. Must reflect today's reality.
**Status:** Active — chef self-service toggle is Phase 2; admin toggles it in Phase 1

### ADR-008: `has_permit` displayed, not required
**Date:** 2026-05-09
**Decision:** Show a "Permit Holder" badge if `has_permit=true`, but don't block non-permit chefs from being listed.
**Reason:** UAE home food regulations are evolving. Hard-requiring permits would block most early chefs. Badge provides transparency to buyers.
**Status:** Active — revisit if UAE regulations change

### ADR-009: Framer Motion for animations
**Date:** 2026-05-09
**Decision:** Use Framer Motion for entrance animations, card hover effects, page transitions.
**Reason:** Same proven pattern as cr8un8. Premium feel with minimal complexity.
**Status:** Active

### ADR-010: Skeleton loading for all async data
**Date:** 2026-05-09
**Decision:** Every grid/list that loads from Supabase shows shimmer skeleton placeholders.
**Reason:** Eliminates layout shift, feels instant, professional finish.
**Status:** Active

---

## Business Context (Agent Must Know)

- **Target users:** Expats and locals in UAE who want authentic homemade food
- **Chef supply:** Home cooks who currently only distribute via word-of-mouth or WhatsApp groups
- **Differentiator:** Location-based discovery on a map — find who's cooking near you today
- **Revenue model (Phase 2+):** Commission on sales, featured chef listings, chef subscription tier
- **Brand essence:** Warm, authentic, neighbourhood — "The food your neighbour makes"
- **Design palette:** Saffron gold + warm cream + terracotta — evokes spice markets, home kitchens

---

## Pending Decisions (Agent Must Ask Before Proceeding)

- [ ] Will chefs have login/dashboard in Phase 1 or is everything admin-managed?
  → Current assumption: admin-managed (Afsal approves, toggles dishes)
- [ ] Should the `/map` page be a standalone full-screen route or embedded on `/chefs`?
  → Current assumption: both — embedded map on `/chefs` sidebar + full-screen `/map` route
- [ ] Cuisine filter: show all 15 cuisines or top 8 + "More"?
  → Current assumption: top 8 visible, horizontal scroll for rest

---

## Known Constraints

- Supabase free tier: 500MB DB, 1GB storage, 50k rows — sufficient for Phase 1
- Vercel hobby: no server-side cron jobs (not needed in Phase 1)
- UAE phone numbers: format `971XXXXXXXXX` — store without `+` for wa.me compatibility
- PostGIS: must be enabled manually in Supabase dashboard before running migrations

---

## Session Log

### Session 0 — Project Setup (2026-05-09)
- Full project documentation created: CLAUDE.md, MEMORY.md, all skill files, schema, migrations
- Architecture decisions documented (ADR-001 through ADR-010)
- Ready for first Antigravity build session

### Session 1 — Phase 1 Priority 1: Homepage + Foundation (2026-05-09)
- **All cr8 source files read into agent context** — project is now independent of local cr8 files
- Foundation files created (copied/adapted from cr8):
  - `package.json` (same deps, name changed)
  - `next.config.js`, `tsconfig.json`, `postcss.config.js`, `.gitignore` (identical)
  - `tailwind.config.ts` (NextDoorChef palette: saffron/terra/cream/dark)
  - `src/app/globals.css` (Playfair Display + DM Sans fonts, Leaflet z-index fixes)
  - `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` (identical)
  - `src/types/index.ts` (Chef, Dish, CuisineType, DubaiArea, ChefMapPoint)
  - `src/lib/utils.ts` (WhatsApp URL builders, UAE phone validation, AED formatter)
  - `src/lib/constants.ts` (15 cuisines, 18 Dubai areas, dietary tags, map center)
- Layout + shell components created:
  - `src/app/layout.tsx` (root layout, OG meta, cream bg)
  - `src/components/Navbar.tsx` (Browse Dishes / Find Chefs / Map / List Your Kitchen)
  - `src/components/Footer.tsx` (NextDoorChef branding, saffron accents)
  - `src/components/SkeletonCard.tsx` (shimmer loading card)
- Homepage created — `src/app/page.tsx`:
  - Dark warm hero (linear-gradient brown) with saffron accents
  - Cuisine strip from `cuisine_types` table (8 visible)
  - Featured dishes section (available_today filter)
  - Chef spotlight section (3 cards with has_permit badge)
  - How it works (Discover → Connect → Enjoy)
  - Join CTA for chefs
- Utility pages: `not-found.tsx`, `error.tsx`, `loading.tsx`, `sitemap.ts`, `robots.ts`
- ✅ `npm run build` passes — zero errors, all routes compile
- **Next:** Phase 1 Priority 2 — `/chefs` page with split layout + map

---

## Reference

- **Sister project:** https://github.com/afsalali1238/cr8 (CraftersUnited — same stack, India market)
- **cr8 CLAUDE.md pattern** used as template for this file
- **Prototype UI** built and documented — 3 pages: homepage, dishes split-view, chefs split-view
