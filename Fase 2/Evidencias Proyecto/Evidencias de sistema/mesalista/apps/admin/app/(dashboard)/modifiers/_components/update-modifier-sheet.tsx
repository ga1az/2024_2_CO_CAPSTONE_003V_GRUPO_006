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
import { Icons } from '@/components/icons'

import { updateModifier } from '../_lib/actions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { UpdateModifierDTOSchema } from '@mesalista/database/src/schema'
import { updateModifierResolver } from '../_lib/validations'
import { MultiSelectDialog } from '@/components/forms/multi-select-dialog'
import { OptionsDialog } from '@/components/forms/options-dialog'
import { getActiveProducts } from '../../products/_lib/actions'
import { Input } from '@/components/ui/input'
import { PlusIcon } from '@radix-ui/react-icons'

interface UpdateModifierSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  modifier: UpdateModifierDTOSchema
}

export function UpdateModifierSheet({
  modifier,
  ...props
}: UpdateModifierSheetProps) {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
  const [optionsDialogOpen, setOptionsDialogOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const form = useForm<UpdateModifierDTOSchema>({
    resolver: zodResolver(updateModifierResolver),
    defaultValues: {
      id: modifier.id,
      name: modifier.name,
      isMultipleChoice: modifier.isMultipleChoice,
      isRequired: modifier.isRequired,
      options: modifier.options || [],
      products: modifier.products || []
    },
    mode: 'onChange'
  })

  // Update the mutation
  const updateModifierMutation = useMutation({
    mutationFn: (values: UpdateModifierDTOSchema) => {
      return updateModifier(modifier.id, values)
    },
    onSuccess: (response) => {
      // Update the cache with the new data
      queryClient.setQueryData(['modifier', modifier.id], response.data)

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['modifiers']
      })
      queryClient.invalidateQueries({
        queryKey: ['modifier', modifier.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['modifier-products', modifier.id]
      })

      props.onOpenChange?.(false)
      toast.success('Modifier updated')
    },
    onError: (error) => {
      toast.error((error as Error).message || 'An error occurred')
    }
  })

  // Products Query
  const products = useQuery({
    queryKey: ['active-products'],
    queryFn: () => getActiveProducts(),
    initialData: [],
    staleTime: 0
  })

  const formValues = form.watch()
  const { hasChanges, changedFields } = useFormChanges(
    { ...formValues, id: formValues.id ?? 0 },
    { ...modifier, id: modifier.id ?? 0 }
  )

  const handleSheetOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open && hasChanges) {
        setShowConfirmDialog(true)
        return
      }
      if (!open) {
        form.reset({
          id: modifier.id,
          name: modifier.name,
          isMultipleChoice: modifier.isMultipleChoice,
          isRequired: modifier.isRequired,
          options: modifier.options,
          products: modifier.products
        })
      }
      props.onOpenChange?.(open)
    },
    [hasChanges, props, form, modifier]
  )

  const handleConfirm = React.useCallback(() => {
    form.reset({
      id: modifier.id,
      name: modifier.name,
      isMultipleChoice: modifier.isMultipleChoice,
      isRequired: modifier.isRequired,
      options: modifier.options,
      products: modifier.products
    })
    setShowConfirmDialog(false)
    props.onOpenChange?.(false)
  }, [form, props, modifier])

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

  // Watch options for changes
  const options = form.watch('options')

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
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>Update Modifier</SheetTitle>
            <SheetDescription>
              Update the Modifier details and save the changes
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                if (!hasChanges) return
                updateModifierMutation.mutate(values)
              })}
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
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
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
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
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

                      {options!.length > 0 && (
                        <div className="rounded-md border">
                          {options!.map(
                            (
                              option: any,
                              index: React.Key | null | undefined
                            ) => (
                              <div
                                key={index}
                                className={`flex items-center justify-between p-3 ${
                                  index !== options!.length - 1
                                    ? 'border-b'
                                    : ''
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">
                                    {option.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Additional cost:{' '}
                                    {(option.overcharge / 100).toLocaleString(
                                      'es-CL',
                                      {
                                        style: 'currency',
                                        currency: 'CLP'
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Products */}
              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Products</FormLabel>
                    <FormControl>
                      <MultiSelectDialog
                        form={form}
                        fieldName="products"
                        items={products.data}
                        isLoading={products.isLoading}
                        isError={products.isError}
                        isArrayOfIds={false} // Specify that this field uses array of objects
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
                  disabled={updateModifierMutation.isPending || !hasChanges}
                  type="submit"
                >
                  {updateModifierMutation.isPending && (
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

      <OptionsDialog
        form={form}
        fieldName="options"
        open={optionsDialogOpen}
        onOpenChange={setOptionsDialogOpen}
        title="Modifier Options"
        description="Add or modify options for this modifier"
      />
    </>
  )
}
