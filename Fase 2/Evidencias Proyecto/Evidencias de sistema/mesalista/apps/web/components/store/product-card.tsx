'use client'

import { useState } from 'react'
import { Product } from '@/app/(store)/store/_lib/schemas'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import { ProductModifierDialog } from './product-modifier-dialog'
import Image from 'next/image'
import { useStoreMode } from '@/app/(store)/store/_lib/use-store-mode'
import { cn } from '@/lib/utils'
import useValidStoreCode from '@/app/(store)/_lib/use-valid-code'

interface ProductCardProps {
  product: Product
  currency?: string
}

export function ProductCard({ product, currency = 'CLP' }: ProductCardProps) {
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false)
  const { isValid, needsCode, tableId } = useValidStoreCode()
  const isOrderMode = isValid && !needsCode

  // Ensure modifiers is always an array
  const modifiers = product.modifiers || []

  const handleAddToCart = (product: Product, modifiers: any) => {
    console.log('Added to cart:', { product, modifiers })
  }

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden hover:shadow-lg transition-shadow group',
          isOrderMode && 'cursor-pointer'
        )}
        onClick={() => isOrderMode && setIsModifierDialogOpen(true)}
      >
        <div className="relative aspect-[4/3] w-full">
          {product.bgImage ? (
            <Image
              src={product.bgImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
              {isOrderMode && modifiers.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {modifiers.length} modificadores disponibles
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-lg whitespace-nowrap">
                {formatPrice(product.price, currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isOrderMode && (
        <ProductModifierDialog
          product={{
            ...product,
            modifiers: modifiers
          }}
          currency={currency}
          isOpen={isModifierDialogOpen}
          onClose={() => setIsModifierDialogOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  )
}
