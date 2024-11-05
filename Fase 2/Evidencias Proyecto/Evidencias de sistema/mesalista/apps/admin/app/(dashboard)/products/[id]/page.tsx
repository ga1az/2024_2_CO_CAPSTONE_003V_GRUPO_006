import { notFound } from 'next/navigation'
import { getProductById } from '../_lib/actions'
import { ProductDetails } from '../_components/product-details'
import { Shell } from '@/components/shell'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { data: product, error } = await getProductById(Number(params.id))

  if (error || !product) {
    notFound()
  }

  return (
    <Shell>
      <ProductDetails product={product.data as any} />
    </Shell>
  )
}
