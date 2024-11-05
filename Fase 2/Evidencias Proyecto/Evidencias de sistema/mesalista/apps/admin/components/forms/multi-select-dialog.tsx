'use client'

import * as React from 'react'
import {
  FieldValues,
  Path,
  PathValue,
  type UseFormReturn
} from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import isEqual from 'lodash/isEqual'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  MagnifyingGlassIcon,
  CheckCircledIcon,
  CrossCircledIcon
} from '@radix-ui/react-icons'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Item {
  id: number
  name: string
  [key: string]: any
}

interface MultiSelectDialogProps<T extends FieldValues> {
  form: UseFormReturn<T>
  fieldName: Path<T>
  items: Item[]
  isLoading?: boolean
  isError?: boolean
  title?: string
  description?: string
  searchPlaceholder?: string
  triggerText?: string
  noItemsText?: string
  errorText?: string
  loadingText?: string
  isArrayOfIds?: boolean // New prop to determine the type of array
}

// multi-select-dialog.tsx - Cambios principales manteniendo la estructura
export function MultiSelectDialog<T extends FieldValues>({
  form,
  fieldName,
  items,
  isArrayOfIds = false,
  ...props
}: MultiSelectDialogProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [localSelection, setLocalSelection] = React.useState<any[]>([])
  const [isDirty, setIsDirty] = React.useState(false)

  // Actualizar localSelection cuando cambian los valores del form
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === fieldName) {
        setLocalSelection(value[fieldName] || [])
      }
    })
    return () => subscription.unsubscribe()
  }, [form, fieldName])

  const filteredItems = React.useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  // Función para verificar si un item está seleccionado
  const isItemSelected = React.useCallback(
    (item: Item) => {
      if (isArrayOfIds) {
        return localSelection.includes(item.id)
      }
      return localSelection.some((val: any) => val.idProduct === item.id)
    },
    [localSelection, isArrayOfIds]
  )

  // Función para limpiar todas las selecciones
  const handleClearAll = React.useCallback(() => {
    setLocalSelection([])
    setIsDirty(true)
    form.setValue(fieldName, [] as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: false,
      shouldTouch: false
    })
  }, [form, fieldName])

  const formValue = form.watch(fieldName)

  // Sincronizar selectedItems con form values
  const selectedItems = React.useMemo(() => {
    const currentValue = (formValue || []) as number[]

    return items.filter((item) =>
      isArrayOfIds
        ? currentValue.includes(item.id)
        : currentValue.some((val: any) => val.idProduct === item.id)
    )
  }, [items, formValue, isArrayOfIds])

  function handleToggleSelect(item: Item) {
    let newSelection: any[]

    if (isArrayOfIds) {
      newSelection = (formValue as number[]).includes(item.id)
        ? (formValue as number[]).filter((id: number) => id !== item.id)
        : [...(formValue as number[]), item.id]
    } else {
      const exists = (formValue as FormValueItem[]).some(
        (val: FormValueItem) => val.idProduct === item.id
      )
      interface FormValueItem {
        name: string
        idProduct: number
      }

      newSelection = exists
        ? (formValue as FormValueItem[]).filter(
            (val) => val.idProduct !== item.id
          )
        : [
            ...(formValue as FormValueItem[]),
            { name: item.name, idProduct: item.id }
          ]
    }

    setLocalSelection(newSelection)
    form.setValue(fieldName, newSelection as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: false
    })
  }

  const handleBadgeRemove = React.useCallback(
    (item: Item) => {
      interface FormValueItem {
        name: string
        idProduct: number
      }

      const newSelection: number[] | FormValueItem[] = isArrayOfIds
        ? (formValue as number[]).filter((id: number) => id !== item.id)
        : (formValue as FormValueItem[]).filter(
            (val: FormValueItem) => val.idProduct !== item.id
          )

      setLocalSelection(newSelection)
      form.setValue(fieldName, newSelection as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: false
      })
    },
    [form, fieldName, formValue, isArrayOfIds]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setSearch('')
        }
        if (newOpen) {
          const currentValue = form.getValues(fieldName)
          setLocalSelection(currentValue || [])
          setIsDirty(false)
          // No limpiar errores al abrir
        }
        setOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" className="w-full justify-between">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
            <span>
              {selectedItems.length
                ? `${selectedItems.length} products selected`
                : props.triggerText}
            </span>
          </Button>
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {selectedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Badge variant="secondary">
                      {item.name}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleBadgeRemove(item)
                        }}
                      >
                        <CrossCircledIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder={props.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 mb-4"
          />
          <div className="max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {props.isLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  {props.loadingText}
                </div>
              ) : props.isError ? (
                <div className="flex items-center justify-center py-6 text-destructive">
                  {props.errorText}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  {props.noItemsText}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-between text-base font-normal h-12"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleToggleSelect(item)
                        }}
                      >
                        <span className="truncate">{item.name}</span>
                        {isItemSelected(item) && (
                          <CheckCircledIcon className="h-5 w-5 text-primary" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClearAll}>
            Clear
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Update form value and close dialog
              if (isDirty) {
                form.setValue(
                  fieldName,
                  localSelection as PathValue<T, Path<T>>,
                  {
                    shouldDirty: true,
                    shouldValidate: false
                  }
                )
              }
              setSearch('')
              setOpen(false)
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
