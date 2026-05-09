# Database Schema Reference — NextDoorChef

> Quick reference for all tables, columns, types, and constraints.
> For the actual SQL, see `supabase/migrations/001_initial_schema.sql`.

---

## Table: chefs

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | — | Full name |
| `bio` | text | YES | — | Chef backstory, 2–3 sentences |
| `whatsapp` | text | NO | — | `971XXXXXXXXX` — no `+`, no spaces |
| `photo_url` | text | YES | — | Supabase Storage path: `chef-photos/{id}/profile.jpg` |
| `cuisine_type` | text | NO | — | Must match `cuisine_types.name` |
| `specialty` | text | YES | — | One-liner: "Known for Kerala fish curry" |
| `area` | text | NO | — | Dubai neighbourhood — must match `dubai_areas.name` |
| `lat` | decimal(10,7) | YES | — | Set from `dubai_areas` on insert |
| `lng` | decimal(10,7) | YES | — | Set from `dubai_areas` on insert |
| `is_approved` | boolean | NO | false | Admin sets to `true` after review |
| `is_active` | boolean | NO | true | Set `false` to hide without deleting |
| `has_permit` | boolean | NO | false | UAE DET food permit |
| `accepts_custom` | boolean | NO | true | Willing to do custom orders |
| `created_at` | timestamptz | NO | now() | Auto-set |

**Indexes:**
- `idx_chefs_location` — PostGIS GIST index on (lng, lat) for geo queries
- `idx_chefs_approved` — (is_approved, is_active) for public list queries
- `idx_chefs_cuisine` — (cuisine_type) for filter queries
- `idx_chefs_area` — (area) for area filter queries

---

## Table: dishes

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `chef_id` | uuid | NO | — | FK → chefs.id ON DELETE CASCADE |
| `name` | text | NO | — | Dish name |
| `description` | text | YES | — | Ingredients, cooking style, portion size |
| `price_aed` | numeric(8,2) | YES | — | Display only. No checkout. |
| `image_url` | text | YES | — | Supabase Storage: `dish-images/{chef_id}/{dish_id}.jpg` |
| `cuisine_type` | text | NO | — | Usually matches chef's cuisine — but can differ (chef does multiple) |
| `dietary_tags` | text[] | NO | `{}` | Array: `['halal','vegetarian','vegan','gluten-free','dairy-free']` |
| `available_today` | boolean | NO | true | Chef/admin toggles daily |
| `created_at` | timestamptz | NO | now() | Auto-set |

**Indexes:**
- `idx_dishes_chef_id` — for chef profile page query
- `idx_dishes_cuisine` — for cuisine filter
- `idx_dishes_available` — for today's dishes filter
- `idx_dishes_dietary_tags` — GIN index for array containment queries (`@>`)

**Dietary tag queries:**
```sql
-- Find all vegetarian dishes
SELECT * FROM dishes WHERE dietary_tags @> ARRAY['vegetarian'];

-- Find halal AND gluten-free dishes
SELECT * FROM dishes WHERE dietary_tags @> ARRAY['halal', 'gluten-free'];
```

---

## Table: cuisine_types (reference)

| Column | Type | Notes |
|---|---|---|
| `id` | serial | Primary key |
| `name` | text | `'Emirati'`, `'South Indian'`, etc. |
| `emoji` | text | Country/food flag emoji |
| `slug` | text | URL-safe: `'south-indian'`, `'west-african'` |

**Seed values:** 15 cuisines — see `001_initial_schema.sql`

---

## Table: dubai_areas (reference)

| Column | Type | Notes |
|---|---|---|
| `id` | serial | Primary key |
| `name` | text | `'Jumeirah'`, `'Karama'`, etc. |
| `lat` | decimal(10,7) | Area centre latitude |
| `lng` | decimal(10,7) | Area centre longitude |

**Seed values:** 18 Dubai areas — see `001_initial_schema.sql`

---

## Common Join Queries

```sql
-- Chef profile page: chef + all their dishes
SELECT
  c.*,
  json_agg(d.*) AS dishes
FROM chefs c
LEFT JOIN dishes d ON d.chef_id = c.id
WHERE c.id = $1 AND c.is_approved = true
GROUP BY c.id;

-- Dishes browse page: dishes with chef info
SELECT
  d.*,
  c.name AS chef_name,
  c.area AS chef_area,
  c.whatsapp AS chef_whatsapp,
  c.photo_url AS chef_photo_url
FROM dishes d
JOIN chefs c ON c.id = d.chef_id
WHERE
  c.is_approved = true
  AND c.is_active = true
  AND d.available_today = true
ORDER BY d.created_at DESC;

-- Filter by cuisine + dietary tag
SELECT d.*, c.name AS chef_name, c.area, c.whatsapp
FROM dishes d
JOIN chefs c ON c.id = d.chef_id
WHERE
  c.is_approved = true AND c.is_active = true
  AND d.cuisine_type = 'South Indian'          -- omit if filter = All
  AND d.dietary_tags @> ARRAY['halal']         -- omit if no dietary filter
  AND d.available_today = true
ORDER BY d.created_at DESC;
```

---

## Supabase Storage Buckets

| Bucket | Public | Usage |
|---|---|---|
| `chef-photos` | ✅ Yes | `chef-photos/{chef_id}/profile.jpg` |
| `dish-images` | ✅ Yes | `dish-images/{chef_id}/{dish_id}.jpg` |

Both buckets must be **public** so image URLs work without auth tokens.
Create them in: Supabase Dashboard → Storage → New Bucket → toggle Public ON.

---

## WhatsApp Format Rule

```
✅ Store as:  971501234567   (12 digits, starts with 971)
❌ Never:     +971501234567  (has + prefix — breaks wa.me links)
❌ Never:     0501234567     (local format — store normalized)
❌ Never:     971 50 123 4567 (spaces)
```

Normalize on insert using `validateUAEPhone()` from `whatsapp-contact.md`.
