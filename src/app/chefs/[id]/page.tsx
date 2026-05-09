// src/app/chefs/[id]/page.tsx
// ADAPTED FROM cr8 /artists/[id] — chef profile + dish menu

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DishCard from '@/components/DishCard'
import WhatsAppButton from '@/components/WhatsAppButton'
import type { Metadata } from 'next'
import type { Chef, Dish } from '@/types'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: chef } = await supabase
    .from('chefs')
    .select('name, cuisine_type, area, specialty')
    .eq('id', params.id)
    .single()

  if (!chef) return { title: 'Chef not found' }

  return {
    title: `${chef.name} — ${chef.cuisine_type} Home Chef in ${chef.area}`,
    description: chef.specialty ?? `${chef.name} is a home chef in ${chef.area}, Dubai`,
  }
}

export default async function ChefProfilePage({ params }: Props) {
  const supabase = createClient()

  const { data: chef } = await supabase
    .from('chefs')
    .select('*, dishes(*)')
    .eq('id', params.id)
    .eq('is_approved', true)
    .single()

  if (!chef) notFound()

  const c = chef as Chef & { dishes: Dish[] }
  const availableDishes = c.dishes?.filter(d => d.available_today) ?? []
  const otherDishes = c.dishes?.filter(d => !d.available_today) ?? []

  return (
    <div className="pt-nav min-h-screen">
      {/* Hero */}
      <div className="bg-dark text-white px-8 py-14">
        <div className="max-w-4xl mx-auto flex items-start gap-8">
          <div className="w-24 h-24 rounded-full bg-amber-bg flex-shrink-0 overflow-hidden flex items-center justify-center text-4xl">
            {c.photo_url
              ? <Image src={c.photo_url} alt={c.name} width={96} height={96} className="object-cover w-full h-full" />
              : '👩‍🍳'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-display text-3xl font-bold">{c.name}</h1>
              {c.has_permit && (
                <span className="text-xs font-medium text-verified bg-verified-bg px-2 py-0.5 rounded">🏛 Licensed</span>
              )}
            </div>
            <p className="text-white/60 mb-1">{c.cuisine_type} · 📍 {c.area}, Dubai</p>
            {c.specialty && <p className="text-white/80 text-sm mt-2">{c.specialty}</p>}
            {c.bio && <p className="text-white/55 text-sm mt-3 max-w-lg leading-relaxed">{c.bio}</p>}
            <div className="flex items-center gap-3 mt-5">
              <WhatsAppButton chef={c} size="md" label="Chat on WhatsApp" />
              {c.accepts_custom && (
                <WhatsAppButton chef={c} size="md" label="Custom order" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {availableDishes.length > 0 && (
          <section className="mb-12">
            <p className="section-label">Available today</p>
            <h2 className="font-display text-2xl font-bold mb-6">Today&apos;s menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDishes.map(dish => (
                <DishCard key={dish.id} dish={{ ...dish, chefs: c }} />
              ))}
            </div>
          </section>
        )}

        {otherDishes.length > 0 && (
          <section>
            <p className="section-label">Full menu</p>
            <h2 className="font-display text-2xl font-bold mb-6">All dishes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {otherDishes.map(dish => (
                <DishCard key={dish.id} dish={{ ...dish, chefs: c }} />
              ))}
            </div>
          </section>
        )}

        {c.dishes?.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-4xl mb-4">🍽️</p>
            <p className="font-display text-xl font-semibold mb-2">Menu coming soon</p>
            <p className="text-muted text-sm mb-6">Chat with {c.name} directly to ask about today&apos;s dishes</p>
            <WhatsAppButton chef={c} size="lg" />
          </div>
        )}

        <div className="mt-10">
          <Link href="/chefs" className="text-sm text-muted hover:text-dark transition-colors">← Back to chefs</Link>
        </div>
      </div>
    </div>
  )
}
