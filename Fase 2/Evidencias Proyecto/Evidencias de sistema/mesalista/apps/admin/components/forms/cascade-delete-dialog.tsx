// components/forms/cascade-delete-dialog.tsx
'use client'

import * as React from 'react'
import { TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Link2Icon } from '@radix-ui/react-icons'

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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Icons } from '@/components/icons'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

interface RelatedItem {
  id: number
  name: string
  type: string
  url?: string
}

interface CascadeDeleteDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title: string
  description: string
  itemIds: number[]
  relatedItems?: RelatedItem[]
  showTrigger?: boolean
  onDelete: (ids: number[]) => Promise<{ error?: any }>
  onSuccess?: () => void
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
}

export function CascadeDeleteDialog({
  title,
  description,
  itemIds,
  relatedItems = [],
  showTrigger = true,
  onDelete,
  onSuccess,
  onOpenChange,
  isLoading = false,
  ...props
}: CascadeDeleteDialogProps) {
  const isDesktop = useMediaQuery()
  const [step, setStep] = React.useState<1 | 2>(1)
  const [isPending, startTransition] = React.useTransition()

  const handleDelete = React.useCallback(() => {
    if (relatedItems.length > 0 && step === 1) {
      setStep(2)
      return
    }

    startTransition(async () => {
      const result = await onDelete(itemIds)

      if (result.error) {
        toast.error('Failed to delete')
        return
      }

      toast.success('Deleted successfully')
      onSuccess?.()
      onOpenChange(false)
      setStep(1)
    })
  }, [itemIds, onDelete, onOpenChange, onSuccess, relatedItems.length, step])

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setStep(1)
      }
      onOpenChange(open)
    },
    [onOpenChange]
  )

  const dialogContent = (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="space-y-4">
          {step === 1 ? (
            <>
              <p>{description}</p>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Icons.spinner className="size-6 animate-spin" />
                </div>
              ) : (
                relatedItems.length > 0 && (
                  <div className="rounded-md bg-background border p-4">
                    <p className="text-sm font-medium text-destructive mb-3">
                      Warning: This will also delete the following items:
                    </p>
                    <div className="space-y-3">
                      {relatedItems.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="flex items-center justify-between group"
                        >
                          <span className="text-base">{item.name}</span>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden group-hover:flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Link2Icon className="size-4 mr-1" />
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </>
          ) : (
            <p>
              Are you absolutely sure you want to delete these items and all
              their related data? This action cannot be undone.
            </p>
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:space-x-0">
        {step === 1 ? (
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isLoading}
            >
              {(isPending || isLoading) && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Confirm Delete
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog {...props} onOpenChange={handleOpenChange}>
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
    <Drawer {...props} onOpenChange={handleOpenChange}>
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
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>{dialogContent}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
