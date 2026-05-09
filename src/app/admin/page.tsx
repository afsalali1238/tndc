// src/app/admin/page.tsx
// ADAPTED FROM cr8 /admin — same approve/reject pattern, chefs table instead of artists

export const dynamic = 'force-dynamic'

import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Chef } from '@/types'

// Server actions for approve/reject
async function approveChef(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  // @ts-ignore
  await getAdminClient().from('chefs').update({ is_approved: true }).eq('id', id)
  revalidatePath('/admin')
}

async function rejectChef(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  // @ts-ignore
  await getAdminClient().from('chefs').update({ is_active: false }).eq('id', id)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  // Pending applications
  const { data: pending } = await getAdminClient()
    .from('chefs')
    .select('*')
    .eq('is_approved', false)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // All approved chefs
  const { data: approved } = await getAdminClient()
    .from('chefs')
    .select('id, name, cuisine_type, area, whatsapp, has_permit, created_at')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const pendingList = (pending ?? []) as Chef[]
  const approvedList = (approved ?? []) as Chef[]

  return (
    <div className="pt-nav min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="font-display text-3xl font-bold mb-10">Admin Dashboard</h1>

        {/* Pending */}
        <section className="mb-14">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            Pending applications
            <span className="bg-terra text-white text-xs px-2 py-0.5 rounded-full">{pendingList.length}</span>
          </h2>

          {pendingList.length === 0 && (
            <p className="text-muted text-sm">No pending applications 🎉</p>
          )}

          <div className="space-y-4">
            {pendingList.map(chef => (
              <div key={chef.id} className="bg-white rounded-card border border-border p-5 flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium">{chef.name}</p>
                    {chef.has_permit && (
                      <span className="text-xs text-verified bg-verified-bg px-1.5 py-0.5 rounded">🏛 Permit</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{chef.cuisine_type} · {chef.area}</p>
                  <p className="text-sm text-muted">📱 {chef.whatsapp}</p>
                  {chef.specialty && <p className="text-sm mt-1">{chef.specialty}</p>}
                  {chef.bio && <p className="text-sm text-muted mt-1 line-clamp-2">{chef.bio}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form action={approveChef}>
                    <input type="hidden" name="id" value={chef.id} />
                    <button type="submit" className="bg-verified text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                      Approve
                    </button>
                  </form>
                  <form action={rejectChef}>
                    <input type="hidden" name="id" value={chef.id} />
                    <button type="submit" className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Approved */}
        <section>
          <h2 className="font-semibold text-lg mb-4">
            Active chefs <span className="text-muted font-normal">({approvedList.length})</span>
          </h2>
          <div className="bg-white rounded-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Cuisine</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Area</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Permit</th>
                </tr>
              </thead>
              <tbody>
                {approvedList.map((chef, i) => (
                  <tr key={chef.id} className={i % 2 === 0 ? '' : 'bg-cream/50'}>
                    <td className="px-4 py-3 font-medium">{chef.name}</td>
                    <td className="px-4 py-3 text-muted">{chef.cuisine_type}</td>
                    <td className="px-4 py-3 text-muted">{chef.area}</td>
                    <td className="px-4 py-3 text-muted">{chef.whatsapp}</td>
                    <td className="px-4 py-3">
                      {chef.has_permit
                        ? <span className="text-verified text-xs font-medium">✓ Yes</span>
                        : <span className="text-muted text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
