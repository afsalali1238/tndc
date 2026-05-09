// src/components/DishGrid.tsx
// NEW — no cr8 equivalent

import DishCard from './DishCard'
import type { Dish, Chef } from '@/types'

interface DishGridProps {
  dishes: (Dish & { chefs?: Chef })[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  columns?: 2 | 3 | 4
}

export default function DishGrid({ dishes, selectedId, onSelect, columns = 3 }: DishGridProps) {
  if (dishes.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-4xl mb-4">🍽️</p>
        <p className="font-display text-xl font-semibold mb-2">No dishes found</p>
        <p className="text-muted text-sm">Try a different cuisine or dietary filter</p>
      </div>
    )
  }

  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns]

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {dishes.map(dish => (
        <DishCard
          key={dish.id}
          dish={dish}
          selected={selectedId === dish.id}
          onClick={() => onSelect?.(dish.id)}
        />
      ))}
    </div>
  )
}
