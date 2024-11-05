'use client'

import * as React from 'react'
import { type UseFormReturn, useFieldArray } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { getActiveProducts } from '../../products/_lib/actions'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InsertModifierOptionWithoutIdOptSchema } from '@mesalista/database/src/schema'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  PlusIcon
} from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { MultiSelectDialog } from '@/components/forms/multi-select-dialog'
import { OptionsDialog } from '@/components/forms/options-dialog'

interface CreateModifierFormProps
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: UseFormReturn<InsertModifierOptionWithoutIdOptSchema>
  onSubmit: (data: InsertModifierOptionWithoutIdOptSchema) => void
}

export function CreateModifierForm({
  form,
  onSubmit,
  children
}: CreateModifierFormProps) {
  const [optionsDialogOpen, setOptionsDialogOpen] = React.useState(false)
  // Watch the options field for changes
  const options = form.watch('options')

  const { fields } = useFieldArray({
    control: form.control,
    name: 'options'
  })

  // Update to match categories implementation exactly
  const products = useQuery({
    queryKey: ['active-products'],
    queryFn: () => getActiveProducts(),
    initialData: [],
    staleTime: 0
  })

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          // Solo enviar si hay datos válidos
          if (form.formState.isValid) {
            form.handleSubmit(onSubmit)(e)
          }
        }}
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
                <Input placeholder="Modifier name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* MultipleChoice */}
        <FormField
          control={form.control}
          name="isMultipleChoice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Multiple Choice</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'true')}
                defaultOpen={false}
                value={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select multiple choice" />
                    <SelectContent>
                      <SelectGroup className="capitalize">
                        <SelectItem value="true">
                          <span className="flex items-center">
                            <CheckCircledIcon className="mr-2" /> Multiple
                          </span>
                        </SelectItem>
                        <SelectItem value="false">
                          <span className="flex items-center">
                            <CrossCircledIcon className="mr-2" /> Single
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

        {/* Required */}
        <FormField
          control={form.control}
          name="isRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'true')}
                defaultOpen={false}
                value={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select if required" />
                    <SelectContent>
                      <SelectGroup className="capitalize">
                        <SelectItem value="true">
                          <span className="flex items-center">
                            <CheckCircledIcon className="mr-2" /> Required
                          </span>
                        </SelectItem>
                        <SelectItem value="false">
                          <span className="flex items-center">
                            <CrossCircledIcon className="mr-2" /> Optional
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

        {/* Options */}
        <FormField
          control={form.control}
          name="options"
          render={() => (
            <FormItem>
              <FormLabel>Options</FormLabel>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setOptionsDialogOpen(true)}
                >
                  <span className="flex items-center">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Manage Options
                  </span>
                  <span className="text-muted-foreground">
                    {options?.length || 0} option
                    {options?.length !== 1 ? 's' : ''} added
                  </span>
                </Button>

                {options?.length > 0 && (
                  <div className="rounded-md border">
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 ${
                          index !== options.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Additional cost:{' '}
                            {(option.overcharge! / 100).toLocaleString(
                              'es-CL',
                              {
                                style: 'currency',
                                currency: 'CLP'
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <OptionsDialog
          form={form}
          fieldName="options"
          open={optionsDialogOpen}
          onOpenChange={setOptionsDialogOpen}
          title="Modifier Options"
          description="Add or modify options for this modifier"
        />

        {/* Products */}
        <FormField
          control={form.control}
          name="idProducts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Products</FormLabel>
              <FormControl>
                <MultiSelectDialog
                  form={form}
                  fieldName="idProducts"
                  items={products.data}
                  isLoading={products.isLoading}
                  isError={products.isError}
                  isArrayOfIds={true} // Specify that this field uses array of IDs
                  title="Select Products"
                  description="Choose products to associate with this modifier"
                  searchPlaceholder="Search products..."
                  triggerText="Select Products"
                  noItemsText="No products found"
                  errorText="Error loading products"
                  loadingText="Loading products..."
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
