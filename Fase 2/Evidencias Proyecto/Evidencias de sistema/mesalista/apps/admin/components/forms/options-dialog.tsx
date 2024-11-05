'use client'

import * as React from 'react'
import {
  ArrayPath,
  FieldValues,
  Path,
  useFieldArray,
  type UseFormReturn
} from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { CLPPriceInput } from '@/components/forms/clp-price-input'

interface Option {
  name: string
  overcharge: number
}

interface OptionsDialogProps<T extends FieldValues> {
  form: UseFormReturn<T>
  fieldName: ArrayPath<T>
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  defaultOption?: Option
}

export function OptionsDialog<T extends FieldValues>({
  form,
  fieldName,
  open,
  onOpenChange,
  title = 'Options',
  description = 'Add or modify options',
  defaultOption = { name: '', overcharge: 0 }
}: OptionsDialogProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {' '}
          {/* Add this wrapper */}
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <FormLabel>Options</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(defaultOption as any)}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`${fieldName}.${index}.name` as Path<T>}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Option Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Option name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${fieldName}.${index}.overcharge` as Path<T>}
                        render={({ field }) => (
                          <FormItem>
                            <CLPPriceInput
                              field={field}
                              label="Additional Cost"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-8"
                      onClick={() => remove(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Confirm</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
