'use client'

import * as React from 'react'
import { SelectModifierResponseSchema } from '@mesalista/database/src/schema'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  Pencil2Icon as PencilIcon
} from '@radix-ui/react-icons'
import { UpdateModifierSheet } from './update-modifier-sheet'
import { formatCLPPrice } from '@/config/format-price'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { ImageIcon } from 'lucide-react'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProductsByModifier } from '../../products/_lib/actions'
import { formatDate } from '@/lib/utils'
import { useTransitionRouter } from 'next-view-transitions'
import { getModifierById } from '../_lib/actions'
import { toUpdateModifierDTO } from '../_lib/validations'

interface ModifierDetailsProps {
  modifier: SelectModifierResponseSchema
  mode?: 'page' | 'sheet' | 'dialog'
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

interface ModifierOption {
  name: string
  idOption: number
  overcharge: number
}

export function ModifierDetails({
  modifier,
  mode = 'page',
  onOpenChange,
  open
}: ModifierDetailsProps) {
  const router = useTransitionRouter()
  const [showUpdateSheet, setShowUpdateSheet] = React.useState(false)

  const queryClient = useQueryClient()

  // Use the initial modifier data as initialData
  const { data: currentModifier } = useQuery({
    queryKey: ['modifier', modifier.id],
    queryFn: () => getModifierById(modifier.id as number),
    initialData: { data: modifier, error: null },
    refetchOnMount: false
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['modifier-products', modifier.id],
    queryFn: () => getProductsByModifier(modifier.id as number),
    enabled: !!modifier.id
  })

  const options = (modifier.options || []) as ModifierOption[]

  const content = (
    <div className="space-y-6">
      {/* Header Actions */}
      {mode === 'page' && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => router.push('/modifiers')}
          >
            <ArrowLeftIcon className="size-5" aria-hidden="true" />
            Back to Modifiers
          </Button>
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => setShowUpdateSheet(true)}
          >
            <PencilIcon className="size-5" aria-hidden="true" />
            Edit Modifier
          </Button>
        </div>
      )}

      {/* Basic Info and Options Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{modifier.name}</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={modifier.isRequired ? 'default' : 'secondary'}>
                {modifier.isRequired ? 'Required' : 'Optional'}
              </Badge>
              <Badge
                variant={modifier.isMultipleChoice ? 'default' : 'secondary'}
              >
                {modifier.isMultipleChoice
                  ? 'Multiple Choice'
                  : 'Single Choice'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(modifier.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(modifier.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Options</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Available options for this modifier
                </p>
              </div>
              <Badge variant="secondary">
                {options.length} option{options.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {options.length > 0 ? (
              <ScrollArea className="h-[200px]">
                {' '}
                {/* Add fixed height and ScrollArea */}
                <div className="divide-y pr-4">
                  {' '}
                  {/* Add right padding for scrollbar */}
                  {options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0" // Add padding adjustments
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          CLP {formatCLPPrice(option.overcharge)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No options available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Related Products</h3>
            <Badge variant="secondary">
              {productsData?.data?.length || 0} Products
            </Badge>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : productsData?.data?.length ? (
            <div className="divide-y">
              {productsData.data.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 mb-2 py-4 hover:bg-muted/50 rounded-lg px-2"
                >
                  <div className="relative h-16 w-16 flex-shrink-0">
                    {product.bgImage ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <img
                            src={product.bgImage}
                            alt={product.name}
                            className="h-full w-full rounded-md object-cover"
                          />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <img
                            src={product.bgImage}
                            alt={product.name}
                            className="h-full w-full rounded-md object-cover"
                          />
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{product.name}</p>
                      <Badge
                        variant={product.isActive ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {product.isActive ? (
                          <>
                            <CheckCircledIcon /> Active
                          </>
                        ) : (
                          <>
                            <CrossCircledIcon /> Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <ExternalLinkIcon /> View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No products found in this <b>Modifier</b>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Update Sheet */}
      <UpdateModifierSheet
        modifier={toUpdateModifierDTO.fromResponse.parse(currentModifier)}
        open={showUpdateSheet}
        onOpenChange={setShowUpdateSheet}
      />
    </div>
  )

  // Render different wrappers based on mode
  switch (mode) {
    case 'sheet':
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Modifier Details</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 pr-4">{content}</ScrollArea>
          </SheetContent>
        </Sheet>
      )
    case 'dialog':
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">{content}</ScrollArea>
          </DialogContent>
        </Dialog>
      )
    default:
      return content
  }
}
