// src/components/DishCard.tsx
// NEW — no cr8 equivalent. Dishes are unique to NextDoorChef.
// Shows: image/emoji, name, chef, description, price, dietary tags, WA button

import Image from 'next/image'
import Link from 'next/link'
import WhatsAppButton from './WhatsAppButton'
import { formatAED } from '@/lib/utils'
import type { Dish, Chef } from '@/types'

interface DishCardProps {
  dish: Dish & { chefs?: Chef }
  selected?: boolean
  onClick?: () => void
}

const DIETARY_BADGE: Record<string, { label: string; color: string }> = {
  halal:       { label: '☪ Halal',      color: 'bg-green-50 text-green-700' },
  vegetarian:  { label: '🥦 Veg',       color: 'bg-emerald-50 text-emerald-700' },
  vegan:       { label: '🌱 Vegan',     color: 'bg-lime-50 text-lime-700' },
  'gluten-free':{ label: 'GF',          color: 'bg-amber-50 text-amber-700' },
  'dairy-free': { label: 'DF',          color: 'bg-sky-50 text-sky-700' },
}

export default function DishCard({ dish, selected, onClick }: DishCardProps) {
  const chef = dish.chefs as Chef | undefined

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-card border overflow-hidden transition-all cursor-pointer
        hover:-translate-y-0.5 hover:shadow-card-hover
        ${selected
          ? 'border-saffron shadow-[0_0_0_3px_#FEF3DC]'
          : 'border-border hover:border-saffron/50'
        }
      `}
    >
      {/* Image / emoji */}
      <div className="h-36 bg-amber-bg flex items-center justify-center overflow-hidden">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.name}
            width={400}
            height={144}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🍽️</span>
        )}
      </div>

      <div className="p-4">
        {/* Name + availability */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-body font-medium text-dark leading-tight">{dish.name}</h3>
          {!dish.available_today && (
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
              Not today
            </span>
          )}
        </div>

        {/* Chef + area */}
        {chef && (
          <p className="text-xs text-muted mb-1">
            by {chef.name} · 📍 {chef.area}
          </p>
        )}

        {/* Description */}
        {dish.description && (
          <p className="text-xs text-muted leading-relaxed mb-2 line-clamp-2">
            {dish.description}
          </p>
        )}

        {/* Dietary badges */}
        {dish.dietary_tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {dish.dietary_tags.map(tag => {
              const b = DIETARY_BADGE[tag]
              return b ? (
                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${b.color}`}>
                  {b.label}
                </span>
              ) : null
            })}
          </div>
        )}

        {/* Price + action */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-terra">{formatAED(dish.price_aed)}</span>
          <div className="flex items-center gap-2">
            <Link
              href={`/dishes/${dish.id}`}
              onClick={e => e.stopPropagation()}
              className="text-xs text-muted hover:text-dark transition-colors"
            >
              Details
            </Link>
            {chef && <WhatsAppButton chef={chef} dish={dish} size="sm" label="Order" />}
          </div>
        </div>
      </div>
    </div>
  )
}
