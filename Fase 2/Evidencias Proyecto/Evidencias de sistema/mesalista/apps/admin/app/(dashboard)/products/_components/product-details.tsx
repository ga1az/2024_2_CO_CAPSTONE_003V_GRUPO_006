'use client'

import * as React from 'react'
import {
  ProductDetailsResponse,
  SelectCategorySchema,
  UpdateProductDTO
} from '@mesalista/database/src/schema'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeftIcon,
  Pencil2Icon as PencilIcon,
  ImageIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  CircleIcon,
  ExternalLinkIcon
} from '@radix-ui/react-icons'
import { UpdateProductSheet } from './update-product-sheet'
import { useTransitionRouter } from 'next-view-transitions'
import { useQuery } from '@tanstack/react-query'
import { getProductCategory, getProductModifiers } from '../_lib/actions'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductDetailsProps {
  product: ProductDetailsResponse['data']
  mode?: 'page' | 'sheet' | 'dialog'
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export function ProductDetails({
  product: { product, product_price },
  mode = 'page',
  onOpenChange,
  open
}: ProductDetailsProps) {
  const router = useTransitionRouter()
  const [showUpdateSheet, setShowUpdateSheet] = React.useState(false)
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(1)

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  // Fetch category and modifiers
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['product-category', product.id],
    queryFn: () => getProductCategory(product.id)
  })

  const { data: modifiersData, isLoading: isModifiersLoading } = useQuery({
    queryKey: ['product-modifiers', product.id],
    queryFn: () => getProductModifiers(product.id)
  })

  const category = categoryData?.data
  const modifiers = modifiersData?.data || []

  console.log('category', category)

  const content = (
    <div className="space-y-8">
      {/* Header Actions */}
      {mode === 'page' && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => router.push('/products')}
          >
            <ArrowLeftIcon className="size-5" aria-hidden="true" />
            Back to Products
          </Button>
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => setShowUpdateSheet(true)}
          >
            <PencilIcon className="size-5" aria-hidden="true" />
            Edit Product
          </Button>
        </div>
      )}

      {/* Product Image and Basic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            {product.bgImage ? (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img
                  src={product.bgImage}
                  alt={product.name}
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
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
              {product.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant={product.isActive ? 'default' : 'secondary'}
                className="gap-1 text-sm py-1.5"
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
              <Badge variant="outline" className="gap-1 text-sm py-1.5">
                Price: ${product_price?.price}
              </Badge>
              {product.kcal && (
                <Badge variant="outline" className="gap-1 text-sm py-1.5">
                  {product.kcal} kcal
                </Badge>
              )}
            </div>

            {/* Product Attributes */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Gluten Free', value: product.isGlutenFree },
                { label: 'Vegan', value: product.isVegan },
                { label: 'New', value: product.isNew },
                { label: 'Popular', value: product.isPopular },
                { label: 'Spicy', value: product.isSpicy },
                { label: 'Solo Item', value: product.isSoloItem }
              ].map(
                (attribute) =>
                  attribute.value && (
                    <div
                      key={attribute.label}
                      className="flex items-center gap-2"
                    >
                      <CircleIcon className="size-2 text-primary" />
                      <span className="text-sm">{attribute.label}</span>
                    </div>
                  )
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 text-base">
              <div>
                <p className="text-muted-foreground font-medium mb-1">
                  Created
                </p>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">
                  Last Updated
                </p>
                <p className="font-medium">{formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Information */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Category Information</h3>
            <Badge variant="secondary">{category ? 1 : 0} Category</Badge>
          </div>

          {isCategoryLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-9 w-[70px]" />
              </div>
            </div>
          ) : category ? (
            <div className="divide-y">
              <div className="flex items-center gap-4 py-4 hover:bg-muted/50 rounded-lg px-2">
                <div className="relative h-16 w-16 flex-shrink-0">
                  {category.bgImage ? (
                    <HoverCard>
                      <HoverCardTrigger>
                        <img
                          src={category.bgImage}
                          alt={category.name}
                          className="h-full w-full rounded-md object-cover"
                        />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <img
                          src={category.bgImage}
                          alt={category.name}
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
                    <p className="font-medium">{category.name}</p>
                    <Badge
                      variant={category.isActive ? 'default' : 'secondary'}
                      className="gap-1"
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
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push(`/categories/${category.id}`)}
                >
                  <ExternalLinkIcon /> View
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No category assigned to this <b>Product</b>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modifiers */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Related Modifiers</h3>
            <Badge variant="secondary">
              {modifiers?.length || 0} Modifiers
            </Badge>
          </div>

          {isModifiersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : modifiers?.length ? (
            <div className="divide-y">
              {modifiers.map((modifier) => (
                <div
                  key={modifier.id}
                  className="flex items-center gap-4 py-4 hover:bg-muted/50 rounded-lg px-2"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{modifier.name}</p>
                      <Badge
                        variant={modifier.isRequired ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {modifier.isRequired ? 'Required' : 'Optional'}
                      </Badge>
                      <Badge
                        variant={
                          modifier.isMultipleChoice ? 'default' : 'secondary'
                        }
                        className="gap-1"
                      >
                        {modifier.isMultipleChoice ? 'Multiple' : 'Single'}
                      </Badge>
                    </div>
                    {modifier.options && (
                      <p className="text-sm text-muted-foreground">
                        {modifier.options.length} options available
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push(`/modifiers/${modifier.id}`)}
                  >
                    <ExternalLinkIcon /> View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No modifiers assigned to this <b>Product</b>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Update Sheet */}
      <UpdateProductSheet
        product={product as UpdateProductDTO}
        open={showUpdateSheet}
        onOpenChange={setShowUpdateSheet}
      />

      {/* Image Dialog */}
      {product.bgImage && (
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-[90vw] w-full max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Product Image</DialogTitle>
            </DialogHeader>
            <div className="relative mt-4">
              <div className="relative overflow-auto">
                <img
                  src={product.bgImage}
                  alt={product.name}
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
              <SheetTitle>Product Details</SheetTitle>
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
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">{content}</ScrollArea>
          </DialogContent>
        </Dialog>
      )
    default:
      return content
  }
}
