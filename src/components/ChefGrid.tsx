// src/components/ChefGrid.tsx
// ADAPTED FROM cr8 ArtistGrid — wraps ChefCard

import ChefCard from './ChefCard'
import type { Chef } from '@/types'

interface ChefGridProps {
  chefs: Chef[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  columns?: 2 | 3
}

export default function ChefGrid({ chefs, selectedId, onSelect, columns = 3 }: ChefGridProps) {
  if (chefs.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-4xl mb-4">👩‍🍳</p>
        <p className="font-display text-xl font-semibold mb-2">No chefs found</p>
        <p className="text-muted text-sm">Try a different cuisine or area filter</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
      {chefs.map(chef => (
        <ChefCard
          key={chef.id}
          chef={chef}
          selected={selectedId === chef.id}
          onClick={() => onSelect?.(chef.id)}
        />
      ))}
    </div>
  )
}
