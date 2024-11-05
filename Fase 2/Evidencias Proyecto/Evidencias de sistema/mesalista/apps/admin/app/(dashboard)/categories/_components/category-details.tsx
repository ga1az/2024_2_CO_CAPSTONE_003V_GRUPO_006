'use client'

import * as React from 'react'
import { SelectCategorySchema } from '@mesalista/database/src/schema'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ZoomIn, ZoomOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { getProductsByCategory } from '../_lib/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeftIcon,
  Pencil2Icon as PencilIcon,
  ImageIcon,
  ExternalLinkIcon,
  CheckCircledIcon,
  CrossCircledIcon
} from '@radix-ui/react-icons'
import { UpdateCategorySheet } from './update-category-sheet'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { useTransitionRouter } from 'next-view-transitions'

interface CategoryDetailsProps {
  category: SelectCategorySchema
  mode?: 'page' | 'sheet' | 'dialog'
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export function CategoryDetails({
  category,
  mode = 'page',
  onOpenChange,
  open
}: CategoryDetailsProps) {
  const router = useTransitionRouter()
  const [showUpdateSheet, setShowUpdateSheet] = React.useState(false)
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(1)

  // Add these functions inside your component
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['category-products', category.id],
    queryFn: () => getProductsByCategory(category.id as number),
    enabled: !!category.id
  })

  const content = (
    <div className="space-y-8">
      {/* Header Actions */}
      {mode === 'page' && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => router.push('/categories')}
          >
            <ArrowLeftIcon className="size-5" aria-hidden="true" />
            Back to Categories
          </Button>
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => setShowUpdateSheet(true)}
          >
            <PencilIcon className="size-5" aria-hidden="true" />
            Edit Category
          </Button>
        </div>
      )}

      {/* Category Image and Basic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            {category.bgImage ? (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img
                  src={category.bgImage}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  onClick={() => setShowImageDialog(true)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 gap-2"
                  onClick={() => setShowImageDialog(true)}
                >
                  <ImageIcon /> View Image
                </Button>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No image available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-6">
            {' '}
            {/* Increased space-y from 4 to 6 */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">{category.name}</h2>{' '}
              {/* Increased text size */}
              {category.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {' '}
                  {/* Increased text size and added leading */}
                  {category.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {' '}
              {/* Increased gap */}
              <Badge
                variant={category.isActive ? 'default' : 'secondary'}
                className="gap-1 text-sm py-1.5"
              >
                {category.isActive ? (
                  <>
                    <CheckCircledIcon /> Active
                  </>
                ) : (
                  <>
                    <CrossCircledIcon /> Inactive
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="gap-1 text-sm py-1.5">
                Sort: {category.sort}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-6 text-base">
              {' '}
              {/* Increased text size and gap */}
              <div>
                <p className="text-muted-foreground font-medium mb-1">
                  Created
                </p>
                <p className="font-medium">{formatDate(category.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">
                  Last Updated
                </p>
                <p className="font-medium">{formatDate(category.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Products */}
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
                  className="flex items-center gap-4 py-4 hover:bg-muted/50 rounded-lg px-2"
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
              No products found in this <b>Category</b>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Update Sheet */}
      <UpdateCategorySheet
        category={category}
        open={showUpdateSheet}
        onOpenChange={setShowUpdateSheet}
      />

      {/* Image Dialog */}
      {category.bgImage && (
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-[90vw] w-full max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Category Image</DialogTitle>
            </DialogHeader>
            <div className="relative mt-4">
              <div className="relative overflow-auto">
                <img
                  src={category.bgImage}
                  alt={category.name}
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )

  // Render different wrappers based on mode
  switch (mode) {
    case 'sheet':
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Category Details</SheetTitle>
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
              <DialogTitle>Category Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">{content}</ScrollArea>
          </DialogContent>
        </Dialog>
      )
    default:
      return content
  }
}
