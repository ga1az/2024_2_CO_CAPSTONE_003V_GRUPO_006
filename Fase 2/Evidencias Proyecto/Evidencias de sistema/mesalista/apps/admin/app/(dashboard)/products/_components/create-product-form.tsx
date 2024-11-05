'use client'

import * as React from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InsertProductDTO } from '@mesalista/database/src/schema'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getActiveCategories } from '../../categories/_lib/actions'
import { ImageUploadDialog } from '@/components/forms/image-upload-dialog'
import { RelationshipDialog } from '@/components/forms/relationship-dialog'
import { CLPPriceInput } from '@/components/forms/clp-price-input'

interface CreateProductFormProps
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: UseFormReturn<InsertProductDTO>
  onSubmit: (data: InsertProductDTO) => void
}

export function CreateProductForm({
  form,
  onSubmit,
  children
}: CreateProductFormProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)

  //Get the current active categories
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => getActiveCategories(),
    initialData: [],
    staleTime: 0
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                <Input placeholder="Product name" {...field} />
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
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
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
        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CLPPriceInput field={field} />
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
                onValueChange={(value) => field.onChange(value === 'true')}
                value={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
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
              </Select>
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
                  existingImage={previewImage}
                  dialogOpen={dialogOpen}
                  setDialogOpen={setDialogOpen}
                  title="Upload Product Image"
                  description="Choose an image for the product"
                  onImageUploaded={(imageUrl) => {
                    setPreviewImage(imageUrl)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  )
}
