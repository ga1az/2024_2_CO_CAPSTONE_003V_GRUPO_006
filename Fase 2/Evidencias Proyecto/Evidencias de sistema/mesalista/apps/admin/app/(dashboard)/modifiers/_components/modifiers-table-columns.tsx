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

import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

// import { DeleteModifierDialog } from './delete-modifier-dialog'
import { UpdateModifierSheet } from './update-modifier-sheet'
import { SelectModifierResponseSchema } from '@mesalista/database/src/schema'
import { Badge } from '@/components/ui/badge'
import { formatCLPPrice } from '@/config/format-price'
import { useTransitionRouter } from 'next-view-transitions'
import { DeleteModifierDialog } from './delete-modifier-dialog'
import { toUpdateModifierDTO } from '../_lib/validations'

export function getColumns(): ColumnDef<SelectModifierResponseSchema>[] {
  return [
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
      cell: ({ row }) => <div className="w-40">{row.getValue('name')}</div>
    },
    {
      accessorKey: 'isMultipleChoice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue('isMultipleChoice') ? 'default' : 'secondary'}
        >
          {row.getValue('isMultipleChoice') ? 'Multiple' : 'Single'}
        </Badge>
      )
    },
    {
      accessorKey: 'options',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Options" />
      ),
      cell: ({ row }) => {
        const options = row.getValue('options') as Array<{
          name: string
          overcharge: number
        }>

        return (
          <div className="flex flex-wrap gap-1 truncate">
            {options?.map((option, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <span>{option.name}</span>
                <span className="text-muted-foreground">
                  CLP {formatCLPPrice(option.overcharge)}
                </span>
              </Badge>
            ))}
          </div>
        )
      }
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
        const [showUpdateModifierSheet, setShowUpdateModifierSheet] =
          React.useState(false)
        const [showDeleteModifierDialog, setShowDeleteModifierDialog] =
          React.useState(false)

        const router = useTransitionRouter()

        return (
          <>
            <UpdateModifierSheet
              open={showUpdateModifierSheet}
              onOpenChange={setShowUpdateModifierSheet}
              modifier={toUpdateModifierDTO.fromModifier.parse(row.original)}
            />
            <DeleteModifierDialog
              open={showDeleteModifierDialog}
              onOpenChange={setShowDeleteModifierDialog}
              modifierIds={
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
                  onSelect={() => router.push(`/modifiers/${row.original.id}`)}
                >
                  View
                  <DropdownMenuShortcut>⌘⏎</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowUpdateModifierSheet(true)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowDeleteModifierDialog(true)}
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
