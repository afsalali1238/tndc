# Skill: cr8 Reference — What to Copy, What to Change

> READ THIS SECOND, after CLAUDE.md.
> This is the most important skill file. It tells you exactly what to reuse
> from the cr8 codebase and what must be changed for NextDoorChef.
>
> cr8 repo: https://github.com/afsalali1238/cr8
> cr8 is COMPLETE (Phase 1 done, all 8 routes working, clean build verified).

---

## The Core Insight

NextDoorChef is cr8un8 in a different vertical.

| Dimension | cr8 (CraftersUnited) | NextDoorChef |
|---|---|---|
| What | Handcrafted goods marketplace | Homemade food marketplace |
| Who sells | Artists / Crafters | Home Chefs |
| What they sell | Listings (artwork, crafts) | Dishes (food items) |
| Discovery | Map of artist locations | Map of chef locations |
| Contact | WhatsApp + Instagram | WhatsApp only |
| Market | India (Kerala/Karnataka) | UAE (Dubai) |
| Currency | ₹ INR | AED |
| Auth | Email + Google OAuth (Phase 2) | Phone OTP (Phase 2) |
| Categories | Art & Crafts, Home Décor, etc. | Emirati, South Indian, Filipino, etc. |
| Geo areas | Indian states + cities | Dubai neighbourhoods |
| Daily toggle | No (listings are evergreen) | Yes (`available_today` on dishes) |
| Permit field | No | Yes (`has_permit` on chefs) |
| Stack | Identical | Identical |
| Conventions | Same | Same |

---

## File-by-File: Copy → Adapt

### COPY DIRECTLY (zero changes needed)

These files are identical between projects. Copy from cr8, change only `cr8un8` → `nextdoorchef` in strings/comments:

```
package.json          → same dependencies, change "name": "nextdoorchef"
next.config.js        → identical
tsconfig.json         → identical
postcss.config.js     → identical
.gitignore            → identical
src/lib/supabase/client.ts   → identical
src/lib/supabase/server.ts   → identical
src/components/SkeletonCard.tsx → identical (shimmer pattern is universal)
src/components/Footer.tsx    → copy structure, change brand name + domain
```

---

### ADAPT (same pattern, different content)

#### `tailwind.config.ts`
cr8 uses: `terracotta` primary, `sand` background, `ink` text
NextDoorChef uses: `saffron` primary, `cream` background, `dark-brown` text

```typescript
// cr8 palette → NextDoorChef palette
// terracotta #C4522A  →  keep as accent (terra)
// sand #F5EFE0        →  cream #FBF4E8
// ink #1C1410         →  dark #1A0F06

// NEW in NextDoorChef:
// saffron #E8960A     →  primary color (was terracotta in cr8)
```

#### `src/app/globals.css`
- Same CSS variable pattern as cr8
- Change color values to NextDoorChef palette (see `design-system.md`)
- Keep all Leaflet overrides exactly as cr8

#### `src/app/layout.tsx`
cr8: `Playfair Display` + `DM Sans` — **keep identical fonts**
Change: site name, meta description, tagline

#### `src/components/Nav.tsx`
cr8 nav links: Home / Artists / Listings / Map / Join
NextDoorChef nav links: Home / Browse Dishes / Find Chefs / Map / List Your Kitchen

Copy the mobile menu pattern, Framer Motion animation, sticky behaviour — all identical.

#### `src/components/MapView.tsx`
- Copy entirely from cr8
- Change: pin emoji (cr8 uses 🎨, NextDoorChef uses 👩‍🍳)
- Change: popup content (chef info instead of artist info)
- Change: default map centre from Kerala `[10.8505, 76.2711]` → Dubai `[25.2048, 55.2708]`
- Change: default zoom from `8` → `11` (Dubai is a single city, not a country)
- Everything else: identical (Leaflet setup, cluster, dynamic import, divIcon pattern)

#### `src/components/ArtistCard.tsx` → `ChefCard.tsx`
Rename file. Adapt fields:
```
artist.name         → chef.name        (same)
artist.location     → chef.area        (different field name)
artist.category     → chef.cuisine_type
artist.instagram    → REMOVE           (no Instagram in NextDoorChef)
artist.whatsapp     → chef.whatsapp    (same)
artist.bio          → chef.bio         (same)
```
Add new fields not in cr8:
```
chef.has_permit     → show "Licensed" badge if true
chef.accepts_custom → show "Custom orders" badge if true
chef.specialty      → show as subtitle (cr8 has no equivalent)
```

#### `src/components/ArtistGrid.tsx` → `ChefGrid.tsx`
Copy exactly. Change: `ArtistCard` import → `ChefCard`.

#### `src/app/artists/page.tsx` → `src/app/chefs/page.tsx`
Copy the split layout pattern (cards left, map right) — it is identical.
Change:
- `artists` table → `chefs` table
- Category filter chips → Cuisine filter chips
- State filter → Area (Dubai neighbourhood) filter
- `ArtistGrid` → `ChefGrid`

#### `src/app/artists/[id]/page.tsx` → `src/app/chefs/[id]/page.tsx`
Copy the profile page pattern.
Change:
- Add dish list below chef bio (cr8 shows listings, same concept)
- Remove Instagram button
- `generateMetadata` — change fields to chef/cuisine/area

#### `src/app/listings/page.tsx` → `src/app/dishes/page.tsx`
Copy the listings browse page.
Change:
- `listings` table → `dishes` table
- Add `available_today` filter toggle (new in NextDoorChef)
- Add dietary filter chips: Halal / Vegetarian / Vegan / Gluten-free
- Price display: `₹` → `AED`
- Map pins show chef location (same concept as artist location)

#### `src/app/join/page.tsx`
Copy the onboarding form structure.
Change fields:
```
cr8 fields:            NextDoorChef fields:
name                 → name
bio                  → bio
category (select)    → cuisine_type (select — different options)
location (text)      → area (select — Dubai neighbourhoods dropdown)
whatsapp             → whatsapp (same, but validate UAE format 971XXXXXXXXX)
instagram            → REMOVE
photo upload         → photo upload (same)
                     → ADD: specialty (one-liner text field)
                     → ADD: has_permit (checkbox)
                     → ADD: accepts_custom (checkbox, default true)
```

#### `src/app/admin/page.tsx`
Copy entirely. Change:
- Table: `artists` → `chefs`
- Columns to show: name, cuisine_type, area, whatsapp, has_permit, created_at
- Approve/reject logic: identical

#### `supabase/migrations/`
cr8 schema has: `artists`, `listings`, `categories`
NextDoorChef schema has: `chefs`, `dishes`, `cuisine_types`, `dubai_areas`

Do NOT copy the cr8 migration. Use `001_initial_schema.sql` from this repo — it is already written.

---

## What Is NEW in NextDoorChef (Doesn't Exist in cr8)

### 1. `available_today` toggle on dishes
cr8 listings are evergreen. NextDoorChef dishes change daily.
- Field: `dishes.available_today boolean DEFAULT true`
- UI: Toggle chip on dishes browse page ("Available today" filter)
- Admin: Toggle in Supabase table editor

### 2. Dietary filter tags
cr8 has no dietary filters. NextDoorChef dishes have:
- `dietary_tags text[]` — array field with: `halal`, `vegetarian`, `vegan`, `gluten-free`
- Filter chips on `/dishes` page
- Badge display on `DishCard`

### 3. `has_permit` badge on chefs
cr8 has no permit concept. NextDoorChef shows:
- `chef.has_permit boolean` — set by admin on approval
- "🏛 Licensed" badge on `ChefCard` and chef profile if true

### 4. `specialty` field on chefs
cr8 has no one-liner specialty. NextDoorChef shows below chef name:
- `chef.specialty text` — "Known for Kerala fish curry and fresh-ground masala"
- Displayed as subtitle on `ChefCard`

### 5. Dubai area coordinates
cr8 uses lat/lng from user input geocoded by Google Maps (not used in NextDoorChef).
NextDoorChef uses a pre-defined lookup table `dubai_areas` — chef selects their area from a dropdown, lat/lng auto-assigned from the table. No geocoding API needed.

### 6. `SplitLayout` component
cr8 has the split layout inline in each page.
NextDoorChef extracts it as a reusable `SplitLayout` component since both `/chefs` and `/dishes` use it.

---

## What Is REMOVED in NextDoorChef (Exists in cr8, Not Here)

| Removed | Reason |
|---|---|
| `artist.instagram` field | Food ordering is transactional; WhatsApp only |
| `categories` table | Replaced by `cuisine_types` with different seed data |
| Google OAuth (Phase 2 plan) | UAE users prefer phone OTP |
| State/city filtering | Replaced by Dubai area filtering |
| INR currency | Replaced by AED |
| India-specific area coordinates | Replaced by Dubai neighbourhood coordinates |

---

## Copy Order (Recommended Build Sequence)

When starting from scratch, do this:

```
1. Clone cr8 repo locally for reference
2. Init new Next.js 14 project: npx create-next-app@14 nextdoorchef
3. Copy: package.json dependencies → npm install
4. Copy: tailwind.config.ts (adapt colours)
5. Copy: src/lib/supabase/* (identical)
6. Copy: src/types/index.ts (adapt for Chef/Dish)
7. Copy: src/lib/utils.ts (adapt WhatsApp URLs)
8. Copy: src/app/globals.css (adapt colours, keep Leaflet overrides)
9. Copy: src/app/layout.tsx (adapt brand/meta)
10. Copy: src/components/Nav.tsx (adapt links)
11. Copy: src/components/Footer.tsx (adapt brand)
12. Copy: src/components/MapView.tsx (adapt pin emoji + centre coords)
13. Copy: src/components/ArtistCard.tsx → ChefCard.tsx (adapt fields)
14. Copy: src/components/ArtistGrid.tsx → ChefGrid.tsx
15. Copy: src/components/SkeletonCard.tsx (identical)
16. NEW: src/components/DishCard.tsx (no cr8 equivalent — write fresh)
17. NEW: src/components/DishGrid.tsx (no cr8 equivalent — write fresh)
18. NEW: src/components/SplitLayout.tsx (extract from cr8 pages)
19. Copy: src/app/page.tsx → adapt (homepage structure identical)
20. Copy: src/app/artists/page.tsx → chefs/page.tsx (adapt)
21. Copy: src/app/artists/[id]/page.tsx → chefs/[id]/page.tsx (adapt)
22. NEW: src/app/dishes/page.tsx (adapt from artists page + add dietary)
23. NEW: src/app/dishes/[id]/page.tsx
24. Copy: src/app/map/page.tsx (adapt centre coords)
25. Copy: src/app/join/page.tsx (adapt fields)
26. Copy: src/app/admin/page.tsx (adapt table name)
27. Run: supabase/migrations/001_initial_schema.sql in Supabase SQL editor
```

---

## Key Differences Summary (Quick Reference Card)

```
cr8                     NextDoorChef
─────────────────────────────────────────────
artists table           chefs table
listings table          dishes table
categories table        cuisine_types table
(no area table)         dubai_areas table
category field          cuisine_type field
location_name field     area field (dropdown)
state + city fields     (removed — Dubai only)
instagram field         (removed)
(no specialty field)    specialty field
(no has_permit field)   has_permit field
(no available_today)    available_today on dishes
(no dietary_tags)       dietary_tags text[] on dishes
₹ INR prices            AED prices
India map centre        Dubai map centre [25.2048, 55.2708]
zoom level 8 (country)  zoom level 11 (city)
🎨 pin emoji            👩‍🍳 pin emoji
email auth (Phase 2)    phone OTP auth (Phase 2)
Razorpay (Phase 2)      Telr UAE (Phase 2)
```
