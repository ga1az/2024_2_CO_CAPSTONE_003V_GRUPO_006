import * as React from 'react'
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import { Row } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { getCommonPinningStyles } from '@/lib/data-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>
  floatingBar?: React.ReactNode | null
  enableSorting?: boolean
}

export function DataTable<TData>({
  table,
  floatingBar = null,
  enableSorting = false,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn('w-full space-y-2.5 overflow-auto', className)}
      {...props}
    >
      {children}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    ...getCommonPinningStyles({ column: header.column })
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) =>
              enableSorting ? (
                <SortableTableRow key={row.id} row={row} table={table} />
              ) : (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="lg:py-5"
                      style={{
                        ...getCommonPinningStyles({ column: cell.column })
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}

interface SortableTableRowProps<TData> {
  row: Row<TData>
  table: TanstackTable<TData>
}

function SortableTableRow<TData>({ row }: SortableTableRowProps<TData>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: (row.original as { id: string }).id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && 'selected'}
      className="hover:bg-primary/5 transition-colors"
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === 'drag') {
          return (
            <TableCell
              key={cell.id}
              style={{
                ...getCommonPinningStyles({ column: cell.column })
              }}
              {...attributes}
              {...listeners}
              className="cursor-move"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        }
        return (
          <TableCell
            key={cell.id}
            className="lg:py-5"
            style={{
              ...getCommonPinningStyles({ column: cell.column })
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}
