// src/components/MapView.tsx
// ADAPTED FROM cr8:
//   - Pin emoji: 🎨 → 👩‍🍳
//   - Map centre: Kerala → Dubai [25.2048, 55.2708]
//   - Zoom: 8 (country) → 11 (city)
//   - Popup content: chef info instead of artist info
// Everything else: identical to cr8
'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import WhatsAppButton from './WhatsAppButton'
import { DUBAI_MAP_CENTER, DUBAI_MAP_ZOOM, CHEF_PIN_EMOJI } from '@/lib/constants'
import type { Chef } from '@/types'

// Chef map pin — divIcon avoids broken default Leaflet icons in webpack
function chefPin(active = false) {
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
    ">${CHEF_PIN_EMOJI}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  })
}

interface MapViewProps {
  chefs: Chef[]
  selectedChefId?: string | null
  onChefSelect?: (chefId: string) => void
  height?: string
}

export default function MapView({
  chefs,
  selectedChefId,
  onChefSelect,
  height = '100%',
}: MapViewProps) {
  const validChefs = chefs.filter(c => c.lat && c.lng)

  return (
    <MapContainer
      center={DUBAI_MAP_CENTER}
      zoom={DUBAI_MAP_ZOOM}
      style={{ height, width: '100%' }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />

      <MarkerClusterGroup chunkedLoading>
        {validChefs.map(chef => (
          <Marker
            key={chef.id}
            position={[chef.lat!, chef.lng!]}
            icon={chefPin(chef.id === selectedChefId)}
            eventHandlers={{ click: () => onChefSelect?.(chef.id) }}
          >
            <Popup maxWidth={240}>
              <ChefPopup chef={chef} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Fly to selected chef pin */}
      <FlyToChef chef={validChefs.find(c => c.id === selectedChefId)} />
    </MapContainer>
  )
}

// Flies the map to the selected chef
function FlyToChef({ chef }: { chef?: Chef }) {
  const map = useMap()
  useEffect(() => {
    if (chef?.lat && chef?.lng) {
      map.flyTo([chef.lat, chef.lng], 15, { duration: 0.8 })
    }
  }, [chef, map])
  return null
}

// Popup content shown when a pin is clicked
function ChefPopup({ chef }: { chef: Chef }) {
  return (
    <div style={{ fontFamily: 'var(--font-body, DM Sans, sans-serif)' }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{chef.name}</p>
      <p style={{ fontSize: 12, color: '#8C7860', marginBottom: 4 }}>
        {chef.cuisine_type} · {chef.area}
      </p>
      {chef.specialty && (
        <p style={{ fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          {chef.specialty}
        </p>
      )}
      <WhatsAppButton chef={chef} size="sm" />
    </div>
  )
}
