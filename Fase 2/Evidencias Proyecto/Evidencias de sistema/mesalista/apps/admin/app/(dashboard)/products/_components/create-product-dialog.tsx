'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'

import { createProduct } from '../_lib/actions'
import { CreateProductForm } from '@/app/(dashboard)/products/_components/create-product-form'
import { insertProductResolver } from '../_lib/validations'
import { InsertProductDTO } from '@mesalista/database/src/schema'
import { Icons } from '@/components/icons'

export function CreateProductDialog() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery()

  const form = useForm<InsertProductDTO>({
    resolver: zodResolver(insertProductResolver),
    defaultValues: {
      name: '',
      isActive: false
    }
  })

  const queryClient = useQueryClient()

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      queryClient.setQueryData(['products'], (oldData: any) => {
        return {
          ...oldData,
          data: [...(oldData?.data || []), data.data]
        }
      })
      form.reset()
      setOpen(false)

      if (data.status === 'success') {
        toast.success('Product created')
      } else {
        toast.error((data.error as unknown as Error).message)
      }
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product')
    }
  })

  function onSubmit(input: InsertProductDTO) {
    createProductMutation.mutate(input)
  }

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="md">
            <PlusIcon className="mr-2 size-5" aria-hidden="true" />
            New Product
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new Product.
            </DialogDescription>
          </DialogHeader>
          <CreateProductForm form={form} onSubmit={onSubmit}>
            <DialogFooter className="gap-2 pt-2 md:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={createProductMutation.isPending} type="submit">
                {createProductMutation.isPending && (
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Create
              </Button>
            </DialogFooter>
          </CreateProductForm>
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          New Product
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create Product</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create a new Product.
          </DrawerDescription>
        </DrawerHeader>
        <CreateProductForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 md:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={createProductMutation.isPending} type="submit">
              {createProductMutation.isPending && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Create
            </Button>
          </DialogFooter>
        </CreateProductForm>
      </DrawerContent>
    </Drawer>
  )
}
