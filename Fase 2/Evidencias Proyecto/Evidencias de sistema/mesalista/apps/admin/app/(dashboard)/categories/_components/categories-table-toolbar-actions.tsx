'use client'

import { DownloadIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { exportTableToCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { CreateCategoryDialog } from './create-category-dialog'
import { DeleteCategoryDialog } from './delete-category-dialog'
import { useState } from 'react'
import { InsertCategorySchema } from '@mesalista/database/src/schema'

interface CategoriesTableToolbarActionsProps {
  table: Table<InsertCategorySchema>
}

export function CategoriesTableToolbarActions({
  table
}: CategoriesTableToolbarActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id!)

  return (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 && (
        <DeleteCategoryDialog
          categoryIds={selectedIds}
          onSuccess={() => table.toggleAllRowsSelected(false)}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          showTrigger={true}
        />
      )}
      <CreateCategoryDialog />
      <Button
        variant="outline"
        size="md"
        onClick={() =>
          exportTableToCSV(table, {
            filename: 'categories',
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
