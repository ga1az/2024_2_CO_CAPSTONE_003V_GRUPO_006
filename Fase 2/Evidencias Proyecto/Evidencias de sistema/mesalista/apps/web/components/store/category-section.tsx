import { Category } from '@/app/(store)/store/_lib/schemas'
import { ProductCard } from './product-card'

interface CategorySectionProps {
  category: Category
  currency?: string
}

export function CategorySection({
  category,
  currency = 'CLP'
}: CategorySectionProps) {
  if (!category.products || category.products.length === 0) {
    return null
  }

  return (
    <div id={`category-${category.id}`} className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{category.name}</h2>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} currency={currency} />
        ))}
      </div>
    </div>
  )
}
