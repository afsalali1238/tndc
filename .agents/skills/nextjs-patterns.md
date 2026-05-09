# Skill: Next.js 14 Patterns

> Read this file for any task involving page creation, routing, data fetching, or component structure.

---

## Golden Rule: Server vs Client

| Use Server Component | Use Client Component (`"use client"`) |
|---|---|
| Fetching data from Supabase | Map (Leaflet needs browser APIs) |
| Rendering chef/dish grids | Filter chips (need `useState`) |
| SEO metadata | Chef onboarding form |
| Static page shells | Any `onClick`, `onChange` handler |
| Everything by default | As little as possible |

**Default to Server Components. Add `"use client"` only when you hit a browser API or need state.**

---

## Page Structure Pattern

```typescript
// src/app/chefs/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import ChefGrid from '@/components/ChefGrid'
import CuisineFilter from '@/components/CuisineFilter'  // client
import { Suspense } from 'react'
import SkeletonCard from '@/components/SkeletonCard'

export const metadata = {
  title: 'Find Home Chefs Near You | NextDoorChef Dubai',
  description: 'Discover authentic home chefs in your area of Dubai...',
}

export default async function ChefsPage({
  searchParams,
}: {
  searchParams: { cuisine?: string; area?: string }
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('chefs')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)

  if (searchParams.cuisine && searchParams.cuisine !== 'All') {
    query = query.eq('cuisine_type', searchParams.cuisine)
  }
  if (searchParams.area && searchParams.area !== 'All') {
    query = query.eq('area', searchParams.area)
  }

  const { data: chefs } = await query

  return (
    <main>
      <CuisineFilter selected={searchParams.cuisine} />
      <Suspense fallback={<SkeletonCard count={6} />}>
        <ChefGrid chefs={chefs ?? []} />
      </Suspense>
    </main>
  )
}
```

---

## Dynamic Routes

```typescript
// src/app/chefs/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: chef } = await supabase
    .from('chefs')
    .select('name, cuisine_type, area, specialty')
    .eq('id', params.id)
    .single()

  return {
    title: `${chef?.name} — ${chef?.cuisine_type} Home Chef in ${chef?.area} | NextDoorChef`,
    description: chef?.specialty,
  }
}

export default async function ChefProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: chef } = await supabase
    .from('chefs')
    .select(`*, dishes(*)`)
    .eq('id', params.id)
    .eq('is_approved', true)
    .single()

  if (!chef) notFound()

  return <ChefProfile chef={chef} />
}
```

---

## Filter Pattern (URL-based, no useState)

```typescript
// CuisineFilter.tsx — "use client"
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const CUISINES = ['All', 'Emirati', 'South Indian', 'Filipino', 'Cantonese', ...]

export default function CuisineFilter({ selected }: { selected?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (cuisine: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cuisine === 'All') params.delete('cuisine')
    else params.set('cuisine', cuisine)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CUISINES.map(c => (
        <button
          key={c}
          onClick={() => handleSelect(c)}
          className={`chip ${(selected ?? 'All') === c ? 'chip-active' : ''}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
```

---

## Skeleton Loading

```typescript
// SkeletonCard.tsx
export default function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white border border-amber-100 p-4">
          <div className="h-32 bg-amber-50 rounded-lg mb-3" />
          <div className="h-4 bg-amber-50 rounded w-3/4 mb-2" />
          <div className="h-3 bg-amber-50 rounded w-1/2 mb-4" />
          <div className="h-8 bg-amber-50 rounded" />
        </div>
      ))}
    </>
  )
}
```

---

## Layout (Root)

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'NextDoorChef — Homemade Food in Dubai',
  description: 'Find home chefs near you. Authentic homemade food from real kitchens across Dubai.',
  keywords: ['home chef Dubai', 'homemade food UAE', 'authentic cuisine Dubai'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} font-body bg-cream`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

---

## TypeScript Types

```typescript
// src/types/index.ts

export interface Chef {
  id: string
  name: string
  bio: string | null
  whatsapp: string           // 971XXXXXXXXX
  photo_url: string | null
  cuisine_type: string
  specialty: string | null
  area: string
  lat: number | null
  lng: number | null
  is_approved: boolean
  is_active: boolean
  has_permit: boolean
  accepts_custom: boolean
  created_at: string
  dishes?: Dish[]
}

export interface Dish {
  id: string
  chef_id: string
  name: string
  description: string | null
  price_aed: number | null
  image_url: string | null
  cuisine_type: string
  dietary_tags: string[]     // ['halal', 'vegetarian', ...]
  available_today: boolean
  created_at: string
  chefs?: Pick<Chef, 'id' | 'name' | 'area' | 'whatsapp' | 'photo_url'>
}
```

---

## notFound() and Error Handling

```typescript
import { notFound } from 'next/navigation'

// Always handle null chef/dish
if (!chef) notFound()

// Create src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold mb-2">Not found</h1>
        <p className="text-muted mb-6">This chef or dish doesn't exist.</p>
        <a href="/" className="btn-primary">Go home</a>
      </div>
    </div>
  )
}
```
