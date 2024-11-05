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

import { createCategory } from '../_lib/actions'
import { CreateCategoryForm } from '@/app/(dashboard)/categories/_components/create-category-form'
import { insertCategoryResolver } from '../_lib/validations'
import { InsertCategorySchema } from '@mesalista/database/src/schema'
import { Icons } from '@/components/icons'

export function CreateCategoryDialog() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery()

  const form = useForm<InsertCategorySchema>({
    resolver: zodResolver(insertCategoryResolver),
    defaultValues: {
      name: '',
      isActive: false
    }
  })

  const queryClient = useQueryClient()

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      queryClient.setQueryData(['categories'], (oldData: any) => {
        return {
          ...oldData,
          data: [...(oldData?.data || []), data.data]
        }
      })
      form.reset()
      setOpen(false)

      if (data.status === 'success') {
        toast.success('Category created')
      } else {
        toast.error((data.error as Error).message)
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category')
    }
  })

  function onSubmit(input: InsertCategorySchema) {
    createCategoryMutation.mutate(input)
  }

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="md">
            <PlusIcon className="mr-2 size-5" aria-hidden="true" />
            New Category
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new category.
            </DialogDescription>
          </DialogHeader>
          <CreateCategoryForm form={form} onSubmit={onSubmit}>
            <DialogFooter className="gap-2 pt-2 md:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={createCategoryMutation.isPending} type="submit">
                {createCategoryMutation.isPending && (
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Create
              </Button>
            </DialogFooter>
          </CreateCategoryForm>
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          New Category
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create Category</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create a new category.
          </DrawerDescription>
        </DrawerHeader>
        <CreateCategoryForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 md:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={createCategoryMutation.isPending} type="submit">
              {createCategoryMutation.isPending && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Create
            </Button>
          </DialogFooter>
        </CreateCategoryForm>
      </DrawerContent>
    </Drawer>
  )
}
