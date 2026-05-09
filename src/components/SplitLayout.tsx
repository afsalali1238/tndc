// src/components/SplitLayout.tsx
// NEW — extracted from cr8 page-level pattern into a shared component
// Used by /chefs and /dishes pages (both are cards-left + map-right)
'use client'

import dynamic from 'next/dynamic'
import type { Chef } from '@/types'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-amber-bg animate-pulse flex items-center justify-center">
      <span className="text-muted text-sm">Loading map…</span>
    </div>
  ),
})

interface SplitLayoutProps {
  chefs: Chef[]
  selectedChefId?: string | null
  onChefSelect?: (id: string) => void
  panelHeader: React.ReactNode
  children: React.ReactNode
}

export default function SplitLayout({
  chefs,
  selectedChefId,
  onChefSelect,
  panelHeader,
  children,
}: SplitLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-62px)] mt-nav">
      {/* Left: scrollable cards panel */}
      <div className="w-[420px] flex-shrink-0 flex flex-col bg-cream overflow-hidden">
        {/* Sticky filter header */}
        <div className="bg-white border-b border-border flex-shrink-0">
          {panelHeader}
        </div>
        {/* Scrollable cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {children}
        </div>
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
