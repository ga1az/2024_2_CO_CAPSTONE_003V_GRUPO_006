'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ConfirmationDialog } from '@/components/forms/confirmation-dialog'
import { useFormChanges } from '@/hooks/use-form-changes'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/icons'

import { updateProduct } from '../_lib/actions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { UpdateProductDTO } from '@mesalista/database/src/schema'
import { updateProductResolver } from '../_lib/validations'
import { ImageUploadDialog } from '@/components/forms/image-upload-dialog'
import { RelationshipDialog } from '@/components/forms/relationship-dialog'
import { getActiveCategories } from '../../categories/_lib/actions'

interface UpdateProductSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  product: UpdateProductDTO
}

export function UpdateProductSheet({
  product,
  ...props
}: UpdateProductSheetProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | null>(
    product?.bgImage ?? null
  )
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)

  const form = useForm<UpdateProductDTO>({
    resolver: zodResolver(updateProductResolver),
    defaultValues: {
      id: product.id,
      name: product.name,
      description: product.description,
      idCategory: product.idCategory,
      isActive: product.isActive,
      bgImage: product.bgImage
    }
  })

  const formValues = form.watch()
  const { hasChanges, changedFields } = useFormChanges(
    { ...formValues, id: formValues.id ?? 0 },
    { ...product, id: product.id ?? 0 },
    {
      imageField: 'bgImage'
    }
  )

  const queryClient = useQueryClient()

  const updateProductMutation = useMutation({
    mutationFn: () => updateProduct(product.id ?? 0, changedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      props.onOpenChange?.(false)
      toast.success('Product updated')
    },
    onError: (error) => {
      toast.error((error as Error).message || 'An error occurred')
    }
  })

  const handleSheetOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open && hasChanges) {
        setShowConfirmDialog(true)
        return
      }
      props.onOpenChange?.(open)
    },
    [hasChanges, props]
  )

  const handleConfirm = React.useCallback(() => {
    form.reset()
    setShowConfirmDialog(false)
    props.onOpenChange?.(false)
  }, [form, props])

  const handleCancel = React.useCallback(
    (e: React.MouseEvent) => {
      if (hasChanges) {
        e.preventDefault()
        setShowConfirmDialog(true)
      } else {
        form.reset()
      }
    },
    [hasChanges, form]
  )

  //Get the current active categories
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => getActiveCategories(),
    initialData: [],
    staleTime: 0
  })

  return (
    <>
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        onConfirm={handleConfirm}
      />

      <Sheet {...props} onOpenChange={handleSheetOpenChange}>
        <SheetContent>
          <SheetHeader className="text-left">
            <SheetTitle>Update Product</SheetTitle>
            <SheetDescription>
              Update the Product details and save the changes
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(() => updateProductMutation.mutate())}
              className="flex flex-col gap-4"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product name"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value || null)
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
                      defaultOpen={false}
                      value={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder="Select a status" />
                          <SelectContent>
                            <SelectGroup className="capitalize">
                              <SelectItem value="true">
                                <span className="flex items-center">
                                  <CheckCircledIcon className="mr-2" /> Active
                                </span>
                              </SelectItem>
                              <SelectItem value="false">
                                <span className="flex items-center">
                                  <CrossCircledIcon className="mr-2" /> Inactive
                                </span>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Category */}
              <FormField
                control={form.control}
                name="idCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <RelationshipDialog
                        form={form}
                        fieldName="idCategory"
                        items={categories.data}
                        isLoading={categories.isLoading}
                        isError={categories.isError}
                        title="Select a Category"
                        description="Choose a category for this product"
                        searchPlaceholder="Search categories..."
                        triggerText="Select category..."
                        noItemsText="No categories found"
                        errorText="Error loading categories"
                        loadingText="Loading categories..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Image */}
              <FormField
                control={form.control}
                name="bgImage"
                render={() => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <ImageUploadDialog
                        form={form}
                        existingImage={product?.bgImage}
                        dialogOpen={dialogOpen}
                        setDialogOpen={setDialogOpen}
                        title="Upload Product Image"
                        description="Choose an image for the product"
                        onImageUploaded={(imageUrl) => {
                          if (imageUrl !== product.bgImage) {
                            setPreviewImage(imageUrl)
                            if (imageUrl && imageUrl.startsWith('data:image')) {
                              form.setValue('bgImage', imageUrl)
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 pt-2 sm:space-x-0">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  disabled={updateProductMutation.isPending || !hasChanges}
                  type="submit"
                >
                  {updateProductMutation.isPending && (
                    <Icons.spinner
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  )
}
