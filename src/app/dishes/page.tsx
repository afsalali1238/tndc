// src/app/dishes/page.tsx
// NEW — no cr8 equivalent. Dishes browse with split layout.

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import DishCard from '@/components/DishCard'
import SplitLayout from '@/components/SplitLayout'
import CuisineFilter from '@/components/CuisineFilter'
import SkeletonCard from '@/components/SkeletonCard'
import type { Metadata } from 'next'
import type { Chef, Dish } from '@/types'

export const metadata: Metadata = {
  title: 'Browse Homemade Dishes in Dubai',
  description: 'Find authentic homemade dishes from home chefs across Dubai. Filter by cuisine and dietary preference.',
}

export default async function DishesPage({
  searchParams,
}: {
  searchParams: { cuisine?: string; dietary?: string; today?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('dishes')
    .select('*, chefs(id, name, area, whatsapp, photo_url, specialty, lat, lng)')
    .order('created_at', { ascending: false })

  if (searchParams.cuisine && searchParams.cuisine !== 'All') {
    query = query.eq('cuisine_type', searchParams.cuisine)
  }
  if (searchParams.dietary && searchParams.dietary !== 'all') {
    query = query.contains('dietary_tags', [searchParams.dietary])
  }
  if (searchParams.today === '1') {
    query = query.eq('available_today', true)
  }

  const { data: dishes } = await query
  const dishList = (dishes ?? []) as (Dish & { chefs: Chef })[]

  // All chefs for the map
  const { data: allChefs } = await supabase
    .from('chefs')
    .select('id, name, cuisine_type, area, lat, lng, whatsapp, specialty, photo_url')
    .eq('is_approved', true)
    .eq('is_active', true)

  const panelHeader = (
    <div className="p-4 space-y-3">
      <div>
        <h1 className="font-display text-xl font-bold">Browse dishes</h1>
        <p className="text-xs text-muted mt-0.5">{dishList.length} dish{dishList.length !== 1 ? 'es' : ''} found</p>
      </div>
      <Suspense><CuisineFilter selected={searchParams.cuisine ?? 'All'} /></Suspense>
    </div>
  )

  return (
    <SplitLayout
      chefs={(allChefs ?? []) as Chef[]}
      panelHeader={panelHeader}
    >
      <Suspense fallback={<SkeletonCard count={4} variant="dish" />}>
        {dishList.map(dish => (
          <DishCard key={dish.id} dish={dish} />
        ))}
        {dishList.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="font-medium mb-1">No dishes found</p>
            <p className="text-sm text-muted">Try a different filter</p>
          </div>
        )}
      </Suspense>
    </SplitLayout>
  )
}
