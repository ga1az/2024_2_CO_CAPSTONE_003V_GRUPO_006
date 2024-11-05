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

import { createModifier } from '../_lib/actions'
import { CreateModifierForm } from '@/app/(dashboard)/modifiers/_components/create-modifier-form'
import { insertModifierResolver } from '../_lib/validations'
import { InsertModifierOptionWithoutIdOptSchema } from '@mesalista/database/src/schema'
import { Icons } from '@/components/icons'

export function CreateModifierDialog() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery()

  const form = useForm<InsertModifierOptionWithoutIdOptSchema>({
    resolver: zodResolver(insertModifierResolver),
    defaultValues: {
      name: '',
      isMultipleChoice: false,
      isRequired: false,
      options: [],
      idProducts: []
    },
    mode: 'onSubmit'
  })

  const queryClient = useQueryClient()

  const createModifierMutation = useMutation({
    mutationFn: createModifier,
    onSuccess: (data) => {
      queryClient.setQueryData(['modifiers'], (oldData: any) => {
        return {
          ...oldData,
          data: [...(oldData?.data || []), data.data]
        }
      })
      form.reset()
      setOpen(false)

      if (data.status === 'success') {
        toast.success('Modifier created')
      } else {
        toast.error((data.error as Error).message)
      }
      queryClient.invalidateQueries({ queryKey: ['modifiers'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create Modifier')
    }
  })

  function onSubmit(input: InsertModifierOptionWithoutIdOptSchema) {
    createModifierMutation.mutate(input)
  }

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="md">
            <PlusIcon className="mr-2 size-5" aria-hidden="true" />
            New Modifier
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Modifier</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new Modifier.
            </DialogDescription>
          </DialogHeader>
          <CreateModifierForm form={form} onSubmit={onSubmit}>
            <DialogFooter className="gap-2 pt-2 md:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={createModifierMutation.isPending} type="submit">
                {createModifierMutation.isPending && (
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Create
              </Button>
            </DialogFooter>
          </CreateModifierForm>
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          New Modifier
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Create Modifier</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create a new Modifier.
          </DrawerDescription>
        </DrawerHeader>
        <CreateModifierForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 md:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={createModifierMutation.isPending} type="submit">
              {createModifierMutation.isPending && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Create
            </Button>
          </DialogFooter>
        </CreateModifierForm>
      </DrawerContent>
    </Drawer>
  )
}
