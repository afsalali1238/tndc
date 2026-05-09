# Skill: Leaflet Maps

> Read this file for any task involving the map — chef pins, map page, or map sidebar.

---

## Critical Rules

- Leaflet **requires** `"use client"` — it uses browser APIs (`window`, `document`)
- Always import Leaflet CSS in the component or globals.css: `import 'leaflet/dist/leaflet.css'`
- Default Leaflet marker icons break in Next.js — always use `L.divIcon` instead
- The map container div **must have an explicit height** or it renders as 0px and shows blank
- Use `react-leaflet-cluster` for clustering when there are 10+ markers

---

## MapView Component (Full Pattern)

```typescript
// src/components/MapView.tsx
'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Chef } from '@/types'
import WhatsAppButton from './WhatsAppButton'

// Dubai center coordinates
const DUBAI_CENTER: [number, number] = [25.2048, 55.2708]
const DEFAULT_ZOOM = 11

// Custom chef pin using divIcon (emoji + saffron circle)
function chefPin(emoji = '👩‍🍳', active = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background: ${active ? '#C4522A' : '#E8960A'};
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 2.5px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      transition: all .2s;
    ">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  })
}

interface MapViewProps {
  chefs: Chef[]
  selectedChefId?: string | null
  onChefSelect?: (chefId: string) => void
  height?: string  // e.g. '100%', '500px'
}

export default function MapView({
  chefs,
  selectedChefId,
  onChefSelect,
  height = '100%',
}: MapViewProps) {
  return (
    <MapContainer
      center={DUBAI_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height, width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />

      <MarkerClusterGroup chunkedLoading>
        {chefs
          .filter(c => c.lat && c.lng)
          .map(chef => (
            <Marker
              key={chef.id}
              position={[chef.lat!, chef.lng!]}
              icon={chefPin('👩‍🍳', chef.id === selectedChefId)}
              eventHandlers={{
                click: () => onChefSelect?.(chef.id),
              }}
            >
              <Popup maxWidth={240}>
                <ChefPopup chef={chef} />
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>

      {/* Fly to selected chef */}
      {selectedChefId && (
        <FlyToChef chef={chefs.find(c => c.id === selectedChefId)} />
      )}
    </MapContainer>
  )
}

// Sub-component: flies map to selected chef pin
function FlyToChef({ chef }: { chef?: Chef }) {
  const map = useMap()
  useEffect(() => {
    if (chef?.lat && chef?.lng) {
      map.flyTo([chef.lat, chef.lng], 15, { duration: 0.8 })
    }
  }, [chef, map])
  return null
}

// Sub-component: popup content
function ChefPopup({ chef }: { chef: Chef }) {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{chef.name}</p>
      <p style={{ fontSize: 12, color: '#8C7860', marginBottom: 6 }}>
        {chef.cuisine_type} · {chef.area}
      </p>
      {chef.specialty && (
        <p style={{ fontSize: 12, marginBottom: 8 }}>{chef.specialty}</p>
      )}
      <WhatsAppButton chef={chef} size="sm" />
    </div>
  )
}
```

---

## Dynamic Import (Required — Leaflet breaks SSR)

```typescript
// Always import MapView with dynamic() + ssr: false
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-amber-50 animate-pulse rounded-xl flex items-center justify-center">
      <span className="text-muted text-sm">Loading map…</span>
    </div>
  ),
})
```

---

## Split Layout: Cards + Map

```typescript
// Used on /chefs and /dishes pages
export default function SplitLayout({ children, chefs, selectedChefId, onChefSelect }) {
  return (
    <div className="flex h-[calc(100vh-62px)] mt-[62px]">
      {/* Left: scrollable card list */}
      <div className="w-[420px] flex-shrink-0 overflow-y-auto bg-cream">
        {children}
      </div>
      
      {/* Right: sticky map */}
      <div className="flex-1 relative">
        <MapView
          chefs={chefs}
          selectedChefId={selectedChefId}
          onChefSelect={onChefSelect}
          height="100%"
        />
      </div>
    </div>
  )
}
```

---

## Full-Screen Map Page (/map)

```typescript
// src/app/map/page.tsx
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default async function MapPage() {
  const supabase = createClient()
  const { data: chefs } = await supabase
    .from('chefs')
    .select('id, name, cuisine_type, area, lat, lng, whatsapp, specialty, photo_url')
    .eq('is_approved', true)
    .eq('is_active', true)
    .not('lat', 'is', null)

  return (
    <main className="h-screen w-screen fixed top-0 left-0 z-0">
      <MapView chefs={chefs ?? []} height="100vh" />
    </main>
  )
}
```

---

## globals.css — Required Leaflet Overrides

```css
/* Fix Leaflet popup font */
.leaflet-popup-content-wrapper {
  border-radius: 10px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,.15) !important;
  font-family: var(--font-body) !important;
}
.leaflet-popup-content {
  margin: 14px 16px !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

/* Fix cluster icon sizing */
.leaflet-cluster-anim .leaflet-marker-icon,
.leaflet-cluster-anim .leaflet-marker-shadow {
  transition: transform 0.3s ease-out, opacity 0.3s ease-in;
}
```

---

## Common Map Errors

| Error | Cause | Fix |
|---|---|---|
| Map shows blank / 0 height | Container has no height | Add explicit `height` to map container div |
| Marker icons show as broken image | Leaflet default icons break in webpack | Use `L.divIcon` always |
| `window is not defined` | Leaflet imported in Server Component | Use `dynamic(() => import(...), { ssr: false })` |
| Map doesn't re-render on filter | State not wired to map | Pass filtered `chefs` array as prop |
| Cluster not working | Missing import | `import MarkerClusterGroup from 'react-leaflet-cluster'` |
