'use client'

import * as React from 'react'
import { type UseFormReturn } from 'react-hook-form'
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
import { InsertCategorySchema } from '@mesalista/database/src/schema'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { ImageUploadDialog } from '@/components/forms/image-upload-dialog'

interface CreateCategoryFormProps
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: UseFormReturn<InsertCategorySchema>
  onSubmit: (data: InsertCategorySchema) => void
}

export function CreateCategoryForm({
  form,
  onSubmit,
  children
}: CreateCategoryFormProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)

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
                <Input placeholder="Category name" {...field} />
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
                  placeholder="Category description"
                  className="resize-none"
                  {...field}
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
                onValueChange={(value) => field.onChange(value === 'true')}
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
                  title="Upload Category Image"
                  description="Choose an image for the category"
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
