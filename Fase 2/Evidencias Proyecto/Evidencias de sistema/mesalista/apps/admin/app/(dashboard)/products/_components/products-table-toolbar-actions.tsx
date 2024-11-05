'use client'

import { DownloadIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { exportTableToCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { CreateProductDialog } from './create-product-dialog'
import { DeleteProductDialog } from './delete-product-dialog'
import { useState } from 'react'
import { SelectProductSchema } from '@mesalista/database/src/schema'

interface productsTableToolbarActionsProps {
  table: Table<SelectProductSchema>
}

export function ProductsTableToolbarActions({
  table
}: productsTableToolbarActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id!)

  return (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 && (
        <DeleteProductDialog
          ProductIds={selectedIds}
          onSuccess={() => table.toggleAllRowsSelected(false)}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          showTrigger={true}
        />
      )}
      <CreateProductDialog />
      <Button
        variant="outline"
        size="md"
        onClick={() =>
          exportTableToCSV(table, {
            filename: 'products',
            excludeColumns: ['select', 'actions']
          })
        }
      >
        <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  )
}
