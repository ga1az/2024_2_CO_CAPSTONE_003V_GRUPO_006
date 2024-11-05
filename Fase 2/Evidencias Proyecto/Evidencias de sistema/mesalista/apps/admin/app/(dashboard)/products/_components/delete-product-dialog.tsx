'use client'

import * as React from 'react'
import { TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Icons } from '@/components/icons'
import { deleteProducts } from '../_lib/actions'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface DeleteProductDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  ProductIds: number[]
  showTrigger?: boolean
  onSuccess?: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({
  ProductIds,
  showTrigger = true,
  onSuccess,
  onOpenChange,
  ...props
}: DeleteProductDialogProps) {
  const isDesktop = useMediaQuery()
  const queryClient = useQueryClient()

  const deleteproductsMutation = useMutation({
    mutationFn: deleteProducts,
    onSuccess: (data) => {
      if (data.error) {
        toast.error('Failed to delete products')
      } else {
        toast.success('products deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['products'] })
        onSuccess?.()
        onOpenChange(false)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete products')
    }
  })

  function onDelete() {
    ProductIds.forEach((id) => deleteproductsMutation.mutate({ ids: [id] }))
  }

  const dialogContent = (
    <>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the
          {ProductIds.length === 1 ? ' Product' : ' products'} from our servers.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:space-x-0">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          aria-label="Delete products"
          variant="destructive"
          onClick={onDelete}
          disabled={deleteproductsMutation.isPending}
        >
          {deleteproductsMutation.isPending && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Delete
        </Button>
      </DialogFooter>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog {...props} onOpenChange={onOpenChange}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="md">
              <TrashIcon className="mr-2 size-4" aria-hidden="true" />
              Delete
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>{dialogContent}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer {...props} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>
            This action cannot be undone. This will permanently delete the
            {ProductIds.length === 1 ? ' Product' : ' products'} from our
            servers.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>{dialogContent}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
