// src/app/map/page.tsx
// ADAPTED FROM cr8 /map — change centre + zoom only

import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import type { Chef } from '@/types'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-amber-bg animate-pulse flex items-center justify-center">
      <p className="text-muted">Loading map…</p>
    </div>
  ),
})

export default async function MapPage() {
  const supabase = createClient()
  const { data: chefs } = await supabase
    .from('chefs')
    .select('id, name, cuisine_type, area, lat, lng, whatsapp, specialty, photo_url, has_permit')
    .eq('is_approved', true)
    .eq('is_active', true)
    .not('lat', 'is', null)

  return (
    <div className="fixed inset-0 z-0 pt-nav">
      <MapView
        chefs={(chefs ?? []) as Chef[]}
        height="100%"
      />
    </div>
  )
}
