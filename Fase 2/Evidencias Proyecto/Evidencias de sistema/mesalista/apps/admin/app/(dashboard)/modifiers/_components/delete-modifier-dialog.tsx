'use client'

import * as React from 'react'
import { CascadeDeleteDialog } from '@/components/forms/cascade-delete-dialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/dialog'
import { deleteModifiers, getModifierById } from '../_lib/actions' // Ensure you have a bulk delete function
import { toast } from 'sonner'

interface DeleteModifierDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  modifierIds: number[]
  showTrigger?: boolean
  onSuccess?: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteModifierDialog({
  modifierIds,
  showTrigger = true,
  onSuccess,
  onOpenChange,
  open,
  ...props
}: DeleteModifierDialogProps) {
  const queryClient = useQueryClient()

  // Fetch modifier details including options and products
  const modifierQuery = useQuery({
    queryKey: ['modifier-details', modifierIds],
    queryFn: async () => {
      const promises = modifierIds.map((id) => getModifierById(id))
      const results = await Promise.all(promises)
      return results.map((result) => result.data).filter(Boolean)
    },
    enabled: open && modifierIds.length > 0
  })

  // Delete mutation
  const deleteModifierMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await deleteModifiers({ ids }) // Use bulk delete API
      if (response.error) {
        return { error: response.error }
      }
      return { error: null }
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error('Failed to delete modifier')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['modifiers'] })
      onSuccess?.()
      toast.success('Modifier deleted successfully')
    }
  })

  // Get related items for the cascade delete dialog
  const relatedItems = React.useMemo(() => {
    if (!modifierQuery.data) return []

    return [
      // Add options
      ...modifierQuery.data.flatMap((modifier) =>
        (modifier?.options || []).map((option) => ({
          id: option.idOption!,
          name: option.name,
          type: 'Option'
        }))
      ),
      // Add products
      ...modifierQuery.data.flatMap((modifier) =>
        (modifier?.products || []).map((product) => ({
          id: product.idProduct,
          name: product.name,
          type: 'Product',
          url: `/products/${product.idProduct}`
        }))
      )
    ]
  }, [modifierQuery.data])

  return (
    <CascadeDeleteDialog
      {...props}
      open={open}
      title="Delete Modifier"
      description={`This will permanently delete the selected ${
        modifierIds.length === 1 ? 'modifier' : 'modifiers'
      } and all their associated options and product relationships.`}
      itemIds={modifierIds}
      relatedItems={relatedItems}
      showTrigger={showTrigger}
      onDelete={(ids) => deleteModifierMutation.mutateAsync(ids)}
      onOpenChange={onOpenChange}
      isLoading={modifierQuery.isLoading}
    />
  )
}
