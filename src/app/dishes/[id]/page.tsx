// src/app/dishes/[id]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import WhatsAppButton from '@/components/WhatsAppButton'
import { formatAED } from '@/lib/utils'
import type { Metadata } from 'next'
import type { Chef, Dish } from '@/types'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('dishes').select('name, description').eq('id', params.id).single()
  if (!data) return { title: 'Dish not found' }
  return { title: data.name, description: data.description ?? undefined }
}

export default async function DishDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data } = await supabase
    .from('dishes')
    .select('*, chefs(*, dishes(*))')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const dish = data as Dish & { chefs: Chef }

  return (
    <div className="pt-nav min-h-screen max-w-3xl mx-auto px-8 py-12">
      {/* Image */}
      <div className="rounded-card overflow-hidden bg-amber-bg h-72 flex items-center justify-center mb-8">
        {dish.image_url
          ? <Image src={dish.image_url} alt={dish.name} width={700} height={288} className="w-full h-full object-cover" />
          : <span className="text-7xl">🍽️</span>}
      </div>

      {/* Name + price */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="font-display text-3xl font-bold">{dish.name}</h1>
        <span className="font-semibold text-2xl text-terra flex-shrink-0">{formatAED(dish.price_aed)}</span>
      </div>

      {/* Chef */}
      {dish.chefs && (
        <p className="text-muted mb-4">
          by{' '}
          <Link href={`/chefs/${dish.chefs.id}`} className="text-dark font-medium hover:underline">
            {dish.chefs.name}
          </Link>
          {' '}· 📍 {dish.chefs.area}
        </p>
      )}

      {/* Description */}
      {dish.description && (
        <p className="text-dark leading-relaxed mb-6">{dish.description}</p>
      )}

      {/* Availability */}
      <div className={`inline-block text-sm px-3 py-1.5 rounded-lg mb-6 ${dish.available_today ? 'bg-verified-bg text-verified' : 'bg-red-50 text-red-600'}`}>
        {dish.available_today ? '✓ Available today' : 'Not available today — ask chef'}
      </div>

      {/* Order */}
      {dish.chefs && (
        <div className="flex gap-3">
          <WhatsAppButton chef={dish.chefs} dish={dish} size="lg" label="Order via WhatsApp" />
          <WhatsAppButton chef={dish.chefs} size="lg" label="Ask a question" />
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-border">
        <Link href="/dishes" className="text-sm text-muted hover:text-dark">← Back to dishes</Link>
      </div>
    </div>
  )
}
