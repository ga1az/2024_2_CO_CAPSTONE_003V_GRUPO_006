import { CartItem as CartItemType } from '@/context/store-cart-context'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/store-cart-context'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { dispatch } = useCart()

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: item.id })
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: item.id, quantity: newQuantity }
      })
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <h4 className="font-medium">{item.product.name}</h4>
        <div className="text-sm text-muted-foreground mt-1">
          {Object.entries(item.modifiers).map(([modifierId, optionIds]) => {
            const modifier = item.product.modifiers.find(
              (m) => m.id === parseInt(modifierId)
            )
            return optionIds
              .map((optionId) => {
                const option = modifier?.options?.find((o) => o.id === optionId)
                return option?.name
              })
              .join(', ')
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
        >
          {item.quantity === 1 ? (
            <Trash2 className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
