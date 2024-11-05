'use client'

import * as React from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'

// Extend TableMeta to include updateData method
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    updateData: (rowIndex: number, newData: Partial<TData>) => void
  }
}
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/handle-error'
import { debounce } from 'lodash'

import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { DeleteCategoryDialog } from './delete-category-dialog'
import { UpdateCategorySheet } from './update-category-sheet'
import { InsertCategorySchema } from '@mesalista/database/src/schema'
import { getStatusIcon } from '../_lib/utils'
import { updateCategory } from '../_lib/actions'
import { DataTableDragHandle } from '@/components/data-table/data-table-drag-handle'
import { useTransitionRouter } from 'next-view-transitions'

export function getColumns(): ColumnDef<InsertCategorySchema>[] {
  return [
    {
      id: 'drag',
      header: () => <span className="sr-only">Drag handle</span>,
      cell: () => <DataTableDragHandle />,
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5 lg:ml-6 mx-2"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5 lg:ml-6 mx-2"
        />
      ),
      enableSorting: false,
      enableHiding: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div className="w-40">{row.getValue('name')}</div>,
      enableSorting: false,
      enableHiding: true
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="w-40 truncate">{row.getValue('description')}</div>
      ),
      enableSorting: false,
      enableHiding: true
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div
          className={`w-40 flex items-center gap-3 ${!row.getValue('isActive') ? 'opacity-50' : ''}`}
        >
          {React.createElement(getStatusIcon(row.getValue('isActive')))}{' '}
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </div>
      ),
      enableSorting: false,
      enableHiding: true
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as string),
      enableSorting: false,
      enableHiding: true
    },
    {
      id: 'actions',
      cell: function Cell({ row, table }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition()
        const [showUpdateCategorySheet, setShowUpdateCategorySheet] =
          React.useState(false)
        const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] =
          React.useState(false)

        const router = useTransitionRouter()

        const optimisticUpdate = React.useCallback(
          (newValue: boolean) => {
            // Update the local state immediately
            row.toggleSelected(false)
            table.options.meta?.updateData(row.index, {
              isActive: newValue
            })

            // Perform the actual update
            startUpdateTransition(() => {
              toast.promise(
                updateCategory(row.original.id as number, {
                  isActive: newValue,
                  name: row.original.name,
                  idStore: row.original.idStore
                }),
                {
                  loading: 'Updating...',
                  success: 'Label updated',
                  error: (err) => {
                    // Revert the optimistic update on error
                    table.options.meta?.updateData(row.index, {
                      isActive: !newValue
                    })
                    return getErrorMessage(err)
                  }
                }
              )
            })
          },
          [row, table, startUpdateTransition]
        )

        const debouncedUpdate = React.useMemo(
          () => debounce(optimisticUpdate, 300),
          [optimisticUpdate]
        )

        return (
          <>
            <UpdateCategorySheet
              open={showUpdateCategorySheet}
              onOpenChange={setShowUpdateCategorySheet}
              category={{
                ...row.original
              }}
            />
            <DeleteCategoryDialog
              open={showDeleteCategoryDialog}
              onOpenChange={setShowDeleteCategoryDialog}
              categoryIds={
                row.original.id !== undefined ? [row.original.id] : []
              }
              showTrigger={false}
              onSuccess={() => row.toggleSelected(false)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <DotsHorizontalIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={() => router.push(`/categories/${row.original.id}`)}
                >
                  View
                  <DropdownMenuShortcut>⌘⏎</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowUpdateCategorySheet(true)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.isActive!.toString()}
                      onValueChange={(value) =>
                        debouncedUpdate(value === 'true')
                      }
                    >
                      {['true', 'false'].map((label) => (
                        <DropdownMenuRadioItem
                          key={label}
                          value={label}
                          className="capitalize"
                          disabled={isUpdatePending}
                        >
                          {label === 'true' ? 'Active' : 'Inactive'}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowDeleteCategoryDialog(true)}
                >
                  Delete
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )
      },
      size: 40
    }
  ]
}
