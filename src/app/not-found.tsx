// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-nav min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl mb-5">🍽️</p>
        <h1 className="font-display text-4xl font-bold mb-3">Page not found</h1>
        <p className="text-muted mb-8">This chef or dish doesn't exist.</p>
        <Link href="/" className="btn-primary">Back to home</Link>
      </div>
    </div>
  )
}
