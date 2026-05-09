// src/types/index.ts
// All shared TypeScript types for NextDoorChef
// ADAPTED FROM cr8: Artist → Chef, Listing → Dish

export interface Chef {
  id: string
  name: string
  bio: string | null
  whatsapp: string           // 971XXXXXXXXX — no +, no spaces
  photo_url: string | null   // Supabase storage: chef-photos/{id}/profile.jpg
  cuisine_type: string       // matches cuisine_types.name
  specialty: string | null   // "Known for Kerala fish curry" — one liner
  area: string               // Dubai neighbourhood, matches dubai_areas.name
  lat: number | null
  lng: number | null
  is_approved: boolean
  is_active: boolean
  has_permit: boolean        // UAE DET food safety permit
  accepts_custom: boolean    // willing to do custom orders
  created_at: string
  // joined relation (optional — only when fetched with dishes)
  dishes?: Dish[]
}

export interface Dish {
  id: string
  chef_id: string
  name: string
  description: string | null
  price_aed: number | null   // display only — no checkout in Phase 1
  image_url: string | null   // Supabase storage: dish-images/{chef_id}/{dish_id}.jpg
  cuisine_type: string
  dietary_tags: DietaryTag[] // ['halal', 'vegetarian', ...]
  available_today: boolean
  created_at: string
  // joined relation (optional — only when fetched with chef info)
  chefs?: Pick<Chef, 'id' | 'name' | 'area' | 'whatsapp' | 'photo_url' | 'specialty'>
}

export interface CuisineType {
  id: number
  name: string
  emoji: string
  slug: string
}

export interface DubaiArea {
  id: number
  name: string
  lat: number
  lng: number
}

// Dietary tag options — used in filter chips and dish badges
export type DietaryTag = 'halal' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free'

// Chef onboarding form shape
export interface ChefFormData {
  name: string
  bio: string
  whatsapp: string
  cuisine_type: string
  specialty: string
  area: string
  has_permit: boolean
  accepts_custom: boolean
  photo?: File
}

// Filter state for /chefs and /dishes pages
export interface ChefFilters {
  cuisine: string   // 'All' or a cuisine name
  area: string      // 'All' or a Dubai area name
  verified: boolean // only show has_permit=true
}

export interface DishFilters {
  cuisine: string      // 'All' or a cuisine name
  dietary: DietaryTag | 'All'
  available_today: boolean
}
