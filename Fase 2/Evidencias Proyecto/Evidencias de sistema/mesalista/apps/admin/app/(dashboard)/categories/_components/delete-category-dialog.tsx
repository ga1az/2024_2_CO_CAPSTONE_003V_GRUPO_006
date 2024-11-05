'use client'

import * as React from 'react'
import { CascadeDeleteDialog } from '@/components/forms/cascade-delete-dialog'
import { deleteCategories, getProductsByCategory } from '../_lib/actions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/dialog'
import { useTransitionRouter } from 'next-view-transitions'

interface DeleteCategoryDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  categoryIds: number[]
  showTrigger?: boolean
  onSuccess?: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteCategoryDialog({
  categoryIds,
  showTrigger = true,
  onSuccess,
  onOpenChange,
  open,
  ...props
}: DeleteCategoryDialogProps) {
  const queryClient = useQueryClient()

  // Fetch related products for each category
  const relatedProductsQueries = useQuery({
    queryKey: ['category-products', categoryIds],
    queryFn: async () => {
      const promises = categoryIds.map((id) => getProductsByCategory(id))
      const results = await Promise.all(promises)

      // Flatten and deduplicate products
      const products = results
        .flatMap((result) => result.data || [])
        .filter(
          (product, index, self) =>
            index === self.findIndex((p) => p.id === product.id)
        )

      return products
    },
    enabled: open && categoryIds.length > 0
  })

  const deleteCategoriesMutation = useMutation({
    mutationFn: deleteCategories,
    onSuccess: (data) => {
      if (data.error) {
        return { error: data.error }
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onSuccess?.()
      return { error: null }
    }
  })

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        // Invalidate the related products query when closing
        queryClient.invalidateQueries({
          queryKey: ['category-products', categoryIds]
        })
      }
      onOpenChange(open)
    },
    [queryClient, categoryIds, onOpenChange]
  )

  return (
    <CascadeDeleteDialog
      {...props}
      open={open}
      title="Delete Category"
      description={`This will permanently delete the selected ${
        categoryIds.length === 1 ? 'category' : 'categories'
      } from our servers.`}
      itemIds={categoryIds}
      relatedItems={
        relatedProductsQueries.data?.map((product) => ({
          id: product.id,
          name: product.name,
          type: 'Product',
          url: `/products/${product.id}`
        })) ?? []
      }
      showTrigger={showTrigger}
      onDelete={(ids) => deleteCategoriesMutation.mutateAsync({ ids })}
      onOpenChange={handleOpenChange}
      isLoading={relatedProductsQueries.isLoading}
    />
  )
}
