// src/lib/constants.ts
// All static data: cuisine types, Dubai areas, dietary tags
// These mirror the Supabase seed data in 001_initial_schema.sql

export const CUISINES = [
  { name: 'All',          emoji: '🌍', slug: 'all' },
  { name: 'Emirati',      emoji: '🇦🇪', slug: 'emirati' },
  { name: 'South Indian', emoji: '🇮🇳', slug: 'south-indian' },
  { name: 'North Indian', emoji: '🍛',  slug: 'north-indian' },
  { name: 'Pakistani',    emoji: '🇵🇰', slug: 'pakistani' },
  { name: 'Filipino',     emoji: '🇵🇭', slug: 'filipino' },
  { name: 'Cantonese',    emoji: '🇨🇳', slug: 'cantonese' },
  { name: 'Lebanese',     emoji: '🇱🇧', slug: 'lebanese' },
  { name: 'Egyptian',     emoji: '🇪🇬', slug: 'egyptian' },
  { name: 'Turkish',      emoji: '🇹🇷', slug: 'turkish' },
  { name: 'West African', emoji: '🌍',  slug: 'west-african' },
  { name: 'Syrian',       emoji: '🇸🇾', slug: 'syrian' },
  { name: 'Ethiopian',    emoji: '🇪🇹', slug: 'ethiopian' },
  { name: 'Sri Lankan',   emoji: '🇱🇰', slug: 'sri-lankan' },
  { name: 'Indonesian',   emoji: '🇮🇩', slug: 'indonesian' },
  { name: 'Bangladeshi',  emoji: '🇧🇩', slug: 'bangladeshi' },
] as const

export const DUBAI_AREAS = [
  { name: 'Jumeirah',           lat: 25.2048, lng: 55.2321 },
  { name: 'Karama',             lat: 25.2409, lng: 55.3059 },
  { name: 'Deira',              lat: 25.2697, lng: 55.3094 },
  { name: 'Bur Dubai',          lat: 25.2582, lng: 55.2972 },
  { name: 'Al Barsha',          lat: 25.1102, lng: 55.1971 },
  { name: 'Business Bay',       lat: 25.1884, lng: 55.2615 },
  { name: 'Downtown Dubai',     lat: 25.1972, lng: 55.2744 },
  { name: 'Discovery Gardens',  lat: 25.0375, lng: 55.1565 },
  { name: 'Al Nahda',           lat: 25.2905, lng: 55.3614 },
  { name: 'Mirdif',             lat: 25.2249, lng: 55.4169 },
  { name: 'JVC',                lat: 25.0593, lng: 55.2106 },
  { name: 'Dubai Marina',       lat: 25.0805, lng: 55.1403 },
  { name: 'Al Qusais',          lat: 25.2898, lng: 55.3783 },
  { name: 'Satwa',              lat: 25.2305, lng: 55.2714 },
  { name: 'Silicon Oasis',      lat: 25.1212, lng: 55.3773 },
  { name: 'International City', lat: 25.1605, lng: 55.4122 },
  { name: 'Al Muhaisnah',       lat: 25.2826, lng: 55.3888 },
  { name: 'Oud Metha',          lat: 25.2357, lng: 55.3147 },
] as const

export const DIETARY_TAGS = [
  { label: 'All',          value: 'all' },
  { label: '☪ Halal',     value: 'halal' },
  { label: '🥦 Vegetarian', value: 'vegetarian' },
  { label: '🌱 Vegan',     value: 'vegan' },
  { label: 'Gluten-free',  value: 'gluten-free' },
  { label: 'Dairy-free',   value: 'dairy-free' },
] as const

// Map config
export const DUBAI_MAP_CENTER: [number, number] = [25.2048, 55.2708]
export const DUBAI_MAP_ZOOM = 11

// Area name → coordinates lookup (used in /join form)
export const AREA_COORDS: Record<string, { lat: number; lng: number }> =
  Object.fromEntries(DUBAI_AREAS.map(a => [a.name, { lat: a.lat, lng: a.lng }]))

// Chef pin emoji
export const CHEF_PIN_EMOJI = '👩‍🍳'
