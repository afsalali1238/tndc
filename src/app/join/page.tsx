// src/app/join/page.tsx
// ADAPTED FROM cr8 /join — same form structure, different fields
// New fields: specialty, has_permit, accepts_custom
// Removed: instagram
// Changed: category → cuisine_type, location → area (dropdown)

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateUAEPhone, cn } from '@/lib/utils'
import { CUISINES, DUBAI_AREAS, AREA_COORDS } from '@/lib/constants'

export default function JoinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    bio: '',
    whatsapp: '',
    cuisine_type: '',
    specialty: '',
    area: '',
    has_permit: false,
    accepts_custom: true,
  })

  const set = (key: string, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate phone
    const phone = validateUAEPhone(form.whatsapp)
    if (!phone) {
      setError('Please enter a valid UAE phone number (e.g. 0501234567)')
      return
    }

    // Get coordinates from area
    const coords = AREA_COORDS[form.area]
    if (!coords) {
      setError('Please select your area')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: insertError } = await supabase.from('chefs').insert({
      name: form.name,
      bio: form.bio || null,
      whatsapp: phone,
      cuisine_type: form.cuisine_type,
      specialty: form.specialty || null,
      area: form.area,
      lat: coords.lat,
      lng: coords.lng,
      has_permit: form.has_permit,
      accepts_custom: form.accepts_custom,
      is_approved: false, // always false — admin approves
    })

    setLoading(false)
    if (insertError) {
      setError('Something went wrong. Please try again.')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="pt-nav min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-5">🎉</p>
          <h1 className="font-display text-3xl font-bold mb-3">You're on the list!</h1>
          <p className="text-muted leading-relaxed mb-6">
            We've received your application. We'll review it and activate your profile within 24 hours. We'll WhatsApp you when you're live.
          </p>
          <button onClick={() => router.push('/')} className="btn-primary">Back to home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-nav min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-14">
        <p className="section-label">For home chefs</p>
        <h1 className="font-display text-4xl font-bold mb-2">List your kitchen</h1>
        <p className="text-muted mb-10 leading-relaxed">
          Share your cuisine with Dubai. We'll review your profile and get you live within 24 hours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Full name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className="input-field" placeholder="Your name" />
          </div>

          {/* Cuisine */}
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Your cuisine *</label>
            <select required value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}
              className="input-field">
              <option value="">Select cuisine type</option>
              {CUISINES.filter(c => c.name !== 'All').map(c => (
                <option key={c.slug} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Your area in Dubai *</label>
            <select required value={form.area} onChange={e => set('area', e.target.value)}
              className="input-field">
              <option value="">Select your area</option>
              {DUBAI_AREAS.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">WhatsApp number *</label>
            <input required value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
              className="input-field" placeholder="e.g. 0501234567" type="tel" />
            <p className="text-xs text-muted mt-1">Buyers will contact you directly. UAE numbers only.</p>
          </div>

          {/* Specialty */}
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Your specialty</label>
            <input value={form.specialty} onChange={e => set('specialty', e.target.value)}
              className="input-field" placeholder="e.g. Known for Kerala fish curry and homemade papadams" />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">About you</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
              className="input-field resize-none" rows={3}
              placeholder="Tell buyers your story — where you're from, how you learned to cook..." />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.has_permit}
                onChange={e => set('has_permit', e.target.checked)}
                className="mt-0.5 accent-saffron" />
              <span className="text-sm text-dark">
                I have a UAE home kitchen / food safety permit
                <span className="block text-xs text-muted mt-0.5">A "Licensed" badge will appear on your profile</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.accepts_custom}
                onChange={e => set('accepts_custom', e.target.checked)}
                className="mt-0.5 accent-saffron" />
              <span className="text-sm text-dark">
                I accept custom orders (birthday cakes, special requests, etc.)
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={cn('btn-primary w-full justify-center', loading && 'opacity-60 cursor-not-allowed')}>
            {loading ? 'Submitting…' : 'Submit my kitchen →'}
          </button>
        </form>
      </div>
    </div>
  )
}
