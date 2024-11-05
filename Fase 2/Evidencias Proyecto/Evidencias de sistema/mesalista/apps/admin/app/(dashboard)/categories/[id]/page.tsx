import { notFound } from 'next/navigation'
import { getCategoryById } from '../_lib/actions'
import { CategoryDetails } from '../_components/category-details'
import { Shell } from '@/components/shell'

interface CategoryPageProps {
  params: {
    id: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { data: category, error } = await getCategoryById(Number(params.id))

  if (error || !category) {
    notFound()
  }

  return (
    <Shell>
      <CategoryDetails category={category.data} />
    </Shell>
  )
}
