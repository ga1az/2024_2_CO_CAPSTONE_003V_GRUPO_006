'use client'

import { useRef, useEffect } from 'react'
import { Category } from '@/app/(store)/store/_lib/schemas'
import { cn } from '@/lib/utils'

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filtrar categorías sin productos
  const validCategories = categories.filter(
    (category) => category.products && category.products.length > 0
  )

  useEffect(() => {
    const activeTab = document.getElementById(`tab-${activeCategory}`)
    if (activeTab && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollLeft =
        activeTab.offsetLeft -
        container.offsetWidth / 2 +
        activeTab.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [activeCategory])

  if (validCategories.length === 0) return null

  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-2"
      >
        {validCategories.map((category) => (
          <button
            key={category.id}
            id={`tab-${category.id}`}
            onClick={() => onCategoryChange(category.id.toString())}
            className={cn(
              'flex-none px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              'hover:text-primary',
              activeCategory === category.id.toString()
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
