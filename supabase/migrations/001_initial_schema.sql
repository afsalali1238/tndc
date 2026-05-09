-- ============================================================
-- NextDoorChef — Initial Schema Migration
-- File: supabase/migrations/001_initial_schema.sql
-- Run in: Supabase Dashboard → SQL Editor
-- Order: Run ONCE on a fresh Supabase project
-- ============================================================

-- Step 0: Enable PostGIS for geo queries (run this first)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABLE: chefs
-- ============================================================
CREATE TABLE chefs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  bio             text,
  whatsapp        text NOT NULL,           -- 971XXXXXXXXX format, no +
  photo_url       text,                    -- Supabase storage path
  cuisine_type    text NOT NULL,           -- FK-like: must match cuisine_types.name
  specialty       text,                    -- "Known for Kerala fish curry"
  area            text NOT NULL,           -- Dubai neighbourhood
  lat             decimal(10,7),           -- geocoded from area
  lng             decimal(10,7),
  is_approved     boolean NOT NULL DEFAULT false,  -- admin approval gate
  is_active       boolean NOT NULL DEFAULT true,
  has_permit      boolean NOT NULL DEFAULT false,  -- UAE food safety permit
  accepts_custom  boolean NOT NULL DEFAULT true,   -- accepts custom orders
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Geo index for fast proximity queries
CREATE INDEX idx_chefs_location ON chefs USING GIST (
  ST_SetSRID(ST_MakePoint(lng::float8, lat::float8), 4326)
) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Standard indexes
CREATE INDEX idx_chefs_approved ON chefs (is_approved, is_active);
CREATE INDEX idx_chefs_cuisine  ON chefs (cuisine_type);
CREATE INDEX idx_chefs_area     ON chefs (area);

-- ============================================================
-- TABLE: dishes
-- ============================================================
CREATE TABLE dishes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id         uuid NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  price_aed       numeric(8,2),            -- display only, no checkout
  image_url       text,                    -- Supabase storage path
  cuisine_type    text NOT NULL,
  dietary_tags    text[] DEFAULT '{}',     -- ['halal','vegetarian','vegan','gluten-free']
  available_today boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dishes_chef_id       ON dishes (chef_id);
CREATE INDEX idx_dishes_cuisine       ON dishes (cuisine_type);
CREATE INDEX idx_dishes_available     ON dishes (available_today);
CREATE INDEX idx_dishes_dietary_tags  ON dishes USING GIN (dietary_tags);

-- ============================================================
-- TABLE: cuisine_types (seed/reference)
-- ============================================================
CREATE TABLE cuisine_types (
  id    serial PRIMARY KEY,
  name  text NOT NULL UNIQUE,
  emoji text NOT NULL,
  slug  text NOT NULL UNIQUE
);

-- ============================================================
-- TABLE: dubai_areas (seed/reference)
-- ============================================================
CREATE TABLE dubai_areas (
  id    serial PRIMARY KEY,
  name  text NOT NULL UNIQUE,
  lat   decimal(10,7) NOT NULL,
  lng   decimal(10,7) NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE chefs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE dubai_areas   ENABLE ROW LEVEL SECURITY;

-- Public: read approved active chefs
CREATE POLICY "Public read approved chefs"
ON chefs FOR SELECT
USING (is_approved = true AND is_active = true);

-- Public: submit chef application (is_approved always false on insert)
CREATE POLICY "Public insert chef application"
ON chefs FOR INSERT
WITH CHECK (is_approved = false);

-- Public: read dishes from approved chefs
CREATE POLICY "Public read dishes"
ON dishes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chefs c
    WHERE c.id = dishes.chef_id
    AND c.is_approved = true
    AND c.is_active = true
  )
);

-- Public: read reference tables
CREATE POLICY "Public read cuisine types"
ON cuisine_types FOR SELECT USING (true);

CREATE POLICY "Public read dubai areas"
ON dubai_areas FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: Cuisine Types
-- ============================================================
INSERT INTO cuisine_types (name, emoji, slug) VALUES
  ('Emirati',       '🇦🇪', 'emirati'),
  ('South Indian',  '🇮🇳', 'south-indian'),
  ('North Indian',  '🍛', 'north-indian'),
  ('Pakistani',     '🇵🇰', 'pakistani'),
  ('Filipino',      '🇵🇭', 'filipino'),
  ('Cantonese',     '🇨🇳', 'cantonese'),
  ('Lebanese',      '🇱🇧', 'lebanese'),
  ('Egyptian',      '🇪🇬', 'egyptian'),
  ('Turkish',       '🇹🇷', 'turkish'),
  ('West African',  '🌍', 'west-african'),
  ('Syrian',        '🇸🇾', 'syrian'),
  ('Ethiopian',     '🇪🇹', 'ethiopian'),
  ('Sri Lankan',    '🇱🇰', 'sri-lankan'),
  ('Indonesian',    '🇮🇩', 'indonesian'),
  ('Bangladeshi',   '🇧🇩', 'bangladeshi');

-- ============================================================
-- SEED DATA: Dubai Areas (with coordinates)
-- ============================================================
INSERT INTO dubai_areas (name, lat, lng) VALUES
  ('Jumeirah',          25.2048, 55.2321),
  ('Karama',            25.2409, 55.3059),
  ('Deira',             25.2697, 55.3094),
  ('Bur Dubai',         25.2582, 55.2972),
  ('Al Barsha',         25.1102, 55.1971),
  ('Business Bay',      25.1884, 55.2615),
  ('Downtown Dubai',    25.1972, 55.2744),
  ('Discovery Gardens', 25.0375, 55.1565),
  ('Al Nahda',          25.2905, 55.3614),
  ('Mirdif',            25.2249, 55.4169),
  ('JVC',               25.0593, 55.2106),
  ('Dubai Marina',      25.0805, 55.1403),
  ('Al Qusais',         25.2898, 55.3783),
  ('Satwa',             25.2305, 55.2714),
  ('Silicon Oasis',     25.1212, 55.3773),
  ('International City',25.1605, 55.4122),
  ('Al Muhaisnah',      25.2826, 55.3888),
  ('Oud Metha',         25.2357, 55.3147);

-- ============================================================
-- SEED DATA: Sample Chefs (for development/testing)
-- ============================================================
INSERT INTO chefs (name, bio, whatsapp, cuisine_type, specialty, area, lat, lng, is_approved, has_permit) VALUES
(
  'Fatima Al-Rashidi',
  'Third-generation Emirati cook from Abu Dhabi, now in Jumeirah. I learned from my grandmother and have been cooking for family and friends for 20 years.',
  '971501234567',
  'Emirati',
  'Traditional Machboos Laham and slow-cooked Harees — made in clay pots the old way',
  'Jumeirah',
  25.2048, 55.2321,
  true, true
),
(
  'Priya Sharma',
  'From Thrissur, Kerala. I cook the food I grew up eating — not the restaurant version, the real home version. Available most evenings.',
  '971502345678',
  'South Indian',
  'Authentic Kerala Sadya, fresh-ground masala fish curry, and homemade papadams',
  'Karama',
  25.2409, 55.3059,
  true, false
),
(
  'Li Wei',
  'Former dim sum chef at a 4-star hotel in Guangzhou. Now cooking from home for people who want the real thing, not the mall version.',
  '971503456789',
  'Cantonese',
  'Hand-folded dim sum, Char Siu Bao, and Cantonese roast duck — takes orders 24h in advance',
  'Deira',
  25.2697, 55.3094,
  true, true
);

-- ============================================================
-- SEED DATA: Sample Dishes (linked to sample chefs above)
-- ============================================================
-- Note: chef UUIDs are generated — this seed runs AFTER chefs insert
-- In development, insert dishes via Supabase table editor using the real IDs.
-- Or use a separate seed script that queries chef IDs first.

-- ============================================================
-- USEFUL QUERIES (for Supabase SQL Editor / admin use)
-- ============================================================

-- Get all pending chef applications
-- SELECT id, name, cuisine_type, area, whatsapp, created_at
-- FROM chefs WHERE is_approved = false ORDER BY created_at DESC;

-- Approve a chef
-- UPDATE chefs SET is_approved = true WHERE id = '<chef-id>';

-- Find chefs within 5km of a coordinate (PostGIS)
-- SELECT *, ST_Distance(
--   ST_SetSRID(ST_MakePoint(lng::float8, lat::float8), 4326)::geography,
--   ST_SetSRID(ST_MakePoint(55.2708, 25.2048), 4326)::geography
-- ) AS distance_meters
-- FROM chefs
-- WHERE is_approved = true AND is_active = true
-- AND ST_DWithin(
--   ST_SetSRID(ST_MakePoint(lng::float8, lat::float8), 4326)::geography,
--   ST_SetSRID(ST_MakePoint(55.2708, 25.2048), 4326)::geography,
--   5000  -- 5km radius
-- )
-- ORDER BY distance_meters;
