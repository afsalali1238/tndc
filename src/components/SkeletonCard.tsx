// src/components/SkeletonCard.tsx
// IDENTICAL TO cr8 — shimmer loading placeholder for grids

interface SkeletonCardProps {
  count?: number
  variant?: 'chef' | 'dish'
}

export default function SkeletonCard({ count = 3, variant = 'chef' }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-border overflow-hidden">
          {variant === 'dish' && (
            <div className="h-36 skeleton" />
          )}
          <div className="p-4 space-y-3">
            {variant === 'chef' && (
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton rounded w-2/3" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            )}
            <div className="h-3 skeleton rounded w-full" />
            <div className="h-3 skeleton rounded w-4/5" />
            <div className="h-3 skeleton rounded w-3/5" />
            <div className="h-8 skeleton rounded mt-2" />
          </div>
        </div>
      ))}
    </>
  )
}
