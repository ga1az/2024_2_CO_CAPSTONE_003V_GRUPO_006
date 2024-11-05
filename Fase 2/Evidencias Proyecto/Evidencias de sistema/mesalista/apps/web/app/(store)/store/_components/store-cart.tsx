'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/store-cart-context'
import { formatPrice } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'
import { CartItem as CartItemComponent } from '@/components/store/cart-item'
import type { CartItem } from '@/context/store-cart-context'

export function StoreCart() {
  const { state } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  function calculateItemTotal(item: CartItem): number {
    let total = item.product.price * item.quantity

    Object.entries(item.modifiers).forEach(([modifierId, optionIds]) => {
      const modifier = item.product.modifiers.find(
        (m) => m.id === parseInt(modifierId)
      )
      optionIds.forEach((optionId) => {
        const option = modifier?.options?.find((o) => o.id === optionId)
        if (option) {
          total += option.overcharge * item.quantity
        }
      })
    })

    return total
  }

  const groupedItems = state.items.reduce(
    (acc, item) => {
      const userId = item.addedBy.id
      if (!acc[userId]) {
        acc[userId] = {
          user: item.addedBy,
          items: [],
          total: 0
        }
      }
      acc[userId].items.push(item)
      acc[userId].total += calculateItemTotal(item)
      return acc
    },
    {} as Record<string, { user: any; items: any[]; total: number }>
  )

  const totalCart = Object.values(groupedItems).reduce(
    (sum, group) => sum + group.total,
    0
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        >
          <ShoppingCart className="h-6 w-6" />
          {state.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm">
              {state.items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrito de compras</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          <AnimatePresence>
            {Object.entries(groupedItems).map(([userId, group]) => (
              <motion.div
                key={userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border rounded-lg p-4"
              >
                <div
                  className="flex items-center gap-2 mb-4"
                  style={{ color: group.user.color }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: group.user.color }}
                  />
                  <span className="font-medium">{group.user.name}</span>
                </div>
                {/* Items del usuario */}
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t pt-4">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatPrice(group.total)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {state.items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatPrice(totalCart)}</span>
            </div>
            <Button className="w-full" size="lg">
              Realizar pedido
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
