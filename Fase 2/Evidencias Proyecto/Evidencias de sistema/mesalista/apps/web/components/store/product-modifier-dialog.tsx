'use client'

import { useState, useEffect } from 'react'
import { Product, Modifier } from '@/app/(store)/store/_lib/schemas'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatPrice } from '@/lib/format'
import Image from 'next/image'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/store-cart-context'
import { useParams, useSearchParams } from 'next/navigation'

interface ProductModifierDialogProps {
  product: Product
  currency: string
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, selectedModifiers: any) => void
}

export function ProductModifierDialog({
  product,
  currency,
  isOpen,
  onClose,
  onAddToCart
}: ProductModifierDialogProps) {
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<number, number[]>
  >({})
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<Record<number, string>>({})
  const { state, dispatch } = useCart()

  const params = useParams()
  const searchParams = useSearchParams()

  const storeId = params.storeId as string
  const tableId = searchParams.get('table') || ''

  // Ensure modifiers is always an array
  const modifiers = product.modifiers || []

  useEffect(() => {
    if (isOpen) {
      setSelectedModifiers({})
      setErrors({})
      setQuantity(1)
    }
  }, [isOpen])

  const handleModifierSelection = (modifier: Modifier, optionId: number) => {
    setSelectedModifiers((prev) => {
      const current = prev[modifier.id] || []

      if (modifier.isMultiple) {
        const updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]

        return {
          ...prev,
          [modifier.id]: updated
        }
      } else {
        return {
          ...prev,
          [modifier.id]: [optionId]
        }
      }
    })

    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[modifier.id]
      return newErrors
    })
  }

  const validateSelections = () => {
    const newErrors: Record<number, string> = {}
    let isValid = true

    modifiers
      .filter((modifier) => modifier?.options && modifier.options.length > 0)
      .forEach((modifier) => {
        if (
          modifier.isRequired &&
          (!selectedModifiers[modifier.id] ||
            selectedModifiers[modifier.id].length === 0)
        ) {
          newErrors[modifier.id] = 'Este modificador es requerido'
          isValid = false
        }
      })

    setErrors(newErrors)
    return isValid
  }

  const handleAddToCart = () => {
    if (validateSelections()) {
      const cartItem = {
        id: crypto.randomUUID(),
        product,
        quantity,
        modifiers: selectedModifiers,
        addedBy: {
          id: state.currentUser?.id || '',
          name: state.currentUser?.name || '',
          color: state.currentUser?.color || ''
        }
      }

      dispatch({ type: 'ADD_ITEM', payload: cartItem })

      onClose()
    }
  }

  function calculateTotal(): number {
    let total = product.price * quantity

    for (const modifier of modifiers) {
      const selected = selectedModifiers[modifier.id]

      if (selected && modifier.options) {
        for (const optionId of selected) {
          const option = modifier.options.find((o) => o.id === optionId)
          if (option) {
            total += option.overcharge
          }
        }
      }
    }

    return total
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative pt-3">
          {product.bgImage && (
            <div className="relative h-[200px] w-full mb-4 rounded-lg overflow-hidden">
              <Image
                src={product.bgImage}
                alt={product.name}
                className="object-cover"
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                priority
              />
            </div>
          )}
          <DialogTitle>{product.name}</DialogTitle>
          {product.description && (
            <DialogDescription>{product.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence>
            {modifiers
              .filter(
                (modifier) => modifier?.options && modifier.options.length > 0
              )
              .map((modifier) => (
                <motion.div
                  key={modifier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{modifier.name}</h3>
                    <div className="flex items-center space-x-2">
                      {modifier.isRequired && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                          Requerido
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {modifier.isMultiple ? 'Múltiple' : 'Una opción'}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {errors[modifier.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert variant="destructive" className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {errors[modifier.id]}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {modifier.isMultiple ? (
                      modifier.options?.map((option) => (
                        <motion.div
                          key={option.id}
                          className="group cursor-pointer rounded-lg hover:bg-muted/30 transition-colors"
                          whileHover={{ scale: 1.005 }}
                          onClick={() =>
                            handleModifierSelection(modifier, option.id)
                          }
                        >
                          <div className="flex items-center justify-between p-2">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`option-${option.id}`}
                                checked={selectedModifiers[
                                  modifier.id
                                ]?.includes(option.id)}
                                onCheckedChange={() =>
                                  handleModifierSelection(modifier, option.id)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="cursor-pointer select-none">
                                {option.name}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              +{formatPrice(option.overcharge, currency)}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <RadioGroup
                        value={selectedModifiers[modifier.id]?.[0]?.toString()}
                        onValueChange={(value) =>
                          handleModifierSelection(modifier, parseInt(value))
                        }
                      >
                        {modifier.options?.map((option) => (
                          <motion.div
                            key={option.id}
                            className="group cursor-pointer rounded-lg hover:bg-muted/30 transition-colors"
                            whileHover={{ scale: 1.005 }}
                            onClick={() =>
                              handleModifierSelection(
                                modifier,
                                parseInt(option.id.toString())
                              )
                            }
                          >
                            <div className="flex items-center justify-between p-2">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value={option.id.toString()}
                                  id={`option-${option.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="cursor-pointer select-none">
                                  {option.name}
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                +{formatPrice(option.overcharge, currency)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex flex-col border-t pt-6">
          <div className="flex items-center justify-between w-full mb-6">
            <div className="inline-flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center border-l border-r">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
            <div className="text-lg font-semibold">
              {formatPrice(calculateTotal(), currency)}
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleAddToCart}>
            Agregar al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
