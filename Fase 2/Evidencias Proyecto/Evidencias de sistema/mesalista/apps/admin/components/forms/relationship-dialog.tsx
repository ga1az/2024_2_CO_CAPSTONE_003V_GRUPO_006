'use client'

import * as React from 'react'
import { Path, type UseFormReturn } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
import { MagnifyingGlassIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { Input } from '../ui/input'

interface RelationItem {
  id: number
  name: string
  [key: string]: any
}

interface RelationshipDialogProps<T extends { [key: string]: any }> {
  form: UseFormReturn<T>
  fieldName: Path<T>
  items: RelationItem[]
  isLoading?: boolean
  isError?: boolean
  title?: string
  description?: string
  searchPlaceholder?: string
  triggerText?: string
  noItemsText?: string
  errorText?: string
  loadingText?: string
}

export function RelationshipDialog<T extends { [key: string]: any }>({
  form,
  fieldName,
  items,
  isLoading = false,
  isError = false,
  title = 'Select Item',
  description = 'Choose from the list below',
  searchPlaceholder = 'Search...',
  triggerText = 'Select...',
  noItemsText = 'No items found.',
  errorText = 'Error loading items',
  loadingText = 'Loading items...'
}: RelationshipDialogProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<number | null>(
    form.getValues(fieldName) as number | null
  )

  const filteredItems = React.useMemo(() => {
    if (!Array.isArray(items)) return []
    if (!search) return items
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  const selectedItem = React.useMemo(
    () =>
      Array.isArray(items)
        ? items.find((item) => item.id === selectedId)
        : null,
    [items, selectedId]
  )

  function handleSelect(item: RelationItem) {
    setSelectedId(item.id)
    form.setValue(fieldName, item.id as any)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
          <span className="truncate max-w-[200px]">
            {selectedItem?.name || triggerText}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-full">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 mb-4"
          />
          <div className="max-h-[300px] overflow-y-auto relationship-dialog-list">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-base text-muted-foreground">
                  {loadingText}
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center py-6 text-base text-destructive">
                  {errorText}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-base text-muted-foreground">
                  {noItemsText}
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
                        variant="ghost"
                        className="w-full justify-between text-base font-normal h-12 hover:bg-primary/10 transition-colors"
                        onClick={() => handleSelect(item)}
                      >
                        <span className="truncate">{item.name}</span>
                        {item.id === selectedId && (
                          <CheckCircledIcon className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedId(null)
                form.setValue(fieldName, null as any)
                setSearch('')
                setOpen(false)
              }}
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                if (!selectedId) {
                  toast.error('Please select an item')
                  return
                }
                form.setValue(fieldName, selectedId as any)
                setSearch('')
                setOpen(false)
              }}
            >
              Confirm
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
