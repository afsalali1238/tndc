# Skill: Supabase

> Read this file whenever a task involves Supabase — database, auth, storage, or RLS.

---

## Client Setup

### Browser client (for Client Components)
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server client (for Server Components + Route Handlers)
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

---

## Fetching Data (Server Components)

```typescript
// Always use the server client in Server Components
import { createClient } from '@/lib/supabase/server'

// Fetch all approved chefs
const supabase = createClient()
const { data: chefs, error } = await supabase
  .from('chefs')
  .select('*')
  .eq('is_approved', true)
  .eq('is_active', true)
  .order('created_at', { ascending: false })

// Fetch chef with their dishes
const { data: chef } = await supabase
  .from('chefs')
  .select(`
    *,
    dishes (*)
  `)
  .eq('id', chefId)
  .eq('is_approved', true)
  .single()

// Fetch dishes by cuisine filter
const { data: dishes } = await supabase
  .from('dishes')
  .select(`
    *,
    chefs (id, name, area, whatsapp, photo_url)
  `)
  .eq('available_today', true)
  .eq('cuisine_type', cuisineFilter)  // omit if 'All'
```

---

## Inserting Data (Chef Onboarding Form)

```typescript
// In a Server Action or Route Handler
const { data, error } = await supabase
  .from('chefs')
  .insert({
    name: formData.name,
    bio: formData.bio,
    whatsapp: formData.whatsapp,    // 971XXXXXXXXX format
    cuisine_type: formData.cuisine_type,
    specialty: formData.specialty,
    area: formData.area,
    lat: areaCoordinates[formData.area].lat,
    lng: areaCoordinates[formData.area].lng,
    has_permit: formData.has_permit,
    accepts_custom: formData.accepts_custom,
    is_approved: false,             // always false on insert — admin approves
  })
  .select()
  .single()
```

---

## Storage — Uploading Images

```typescript
// Upload chef photo
const { data, error } = await supabase.storage
  .from('chef-photos')
  .upload(`${chefId}/profile.jpg`, file, {
    cacheControl: '3600',
    upsert: true,
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('chef-photos')
  .getPublicUrl(`${chefId}/profile.jpg`)

// Upload dish image
const { data } = await supabase.storage
  .from('dish-images')
  .upload(`${chefId}/${dishId}.jpg`, file, { upsert: true })
```

**Storage buckets to create (public):**
- `chef-photos` — chef profile photos
- `dish-images` — dish/food photos

---

## RLS — Row Level Security

Never disable RLS. Always add a policy before expecting public reads to work.

```sql
-- Enable RLS on every table
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Public reads: approved chefs only
CREATE POLICY "Public read approved chefs"
ON chefs FOR SELECT
USING (is_approved = true AND is_active = true);

-- Public reads: dishes from approved chefs only
CREATE POLICY "Public read dishes"
ON dishes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chefs
    WHERE chefs.id = dishes.chef_id
    AND chefs.is_approved = true
    AND chefs.is_active = true
  )
);

-- Public inserts: anyone can submit a chef application (is_approved defaults false)
CREATE POLICY "Public insert chef application"
ON chefs FOR INSERT
WITH CHECK (is_approved = false);

-- Admin: service role key bypasses all RLS automatically
-- Use SUPABASE_SERVICE_ROLE_KEY in admin operations (server-side only)
```

---

## Area → Coordinate Map (Use for /join form geocoding)

```typescript
export const DUBAI_AREAS: Record<string, { lat: number; lng: number }> = {
  'Jumeirah':           { lat: 25.2048, lng: 55.2321 },
  'Karama':             { lat: 25.2409, lng: 55.3059 },
  'Deira':              { lat: 25.2697, lng: 55.3094 },
  'Bur Dubai':          { lat: 25.2582, lng: 55.2972 },
  'Al Barsha':          { lat: 25.1102, lng: 55.1971 },
  'Business Bay':       { lat: 25.1884, lng: 55.2615 },
  'Downtown Dubai':     { lat: 25.1972, lng: 55.2744 },
  'Discovery Gardens':  { lat: 25.0375, lng: 55.1565 },
  'Al Nahda':           { lat: 25.2905, lng: 55.3614 },
  'Mirdif':             { lat: 25.2249, lng: 55.4169 },
  'JVC':                { lat: 25.0593, lng: 55.2106 },
  'Dubai Marina':       { lat: 25.0805, lng: 55.1403 },
  'Al Qusais':          { lat: 25.2898, lng: 55.3783 },
  'Satwa':              { lat: 25.2305, lng: 55.2714 },
}
```

---

## Admin Operations (Service Role — Server-Side Only)

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER expose to client
)

// Approve a chef
await adminClient
  .from('chefs')
  .update({ is_approved: true })
  .eq('id', chefId)

// Reject / deactivate a chef
await adminClient
  .from('chefs')
  .update({ is_active: false })
  .eq('id', chefId)
```

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `row violates RLS` | Missing SELECT policy | Add the policy above |
| `Invalid API key` | Wrong env var | Check `.env.local` values |
| `relation does not exist` | Migration not run | Run `001_initial_schema.sql` in Supabase SQL editor |
| `PostGIS function not found` | Extension not enabled | Run `CREATE EXTENSION postgis;` first |
| `storage: Bucket not found` | Bucket not created | Create `chef-photos` and `dish-images` in Storage tab |
