import { DownloadIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { exportTableToCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { CreateModifierDialog } from './create-modifier-dialog'
import { DeleteModifierDialog } from './delete-modifier-dialog'
import { useState } from 'react'
import { SelectModifierResponseSchema } from '@mesalista/database/src/schema'

interface ModifiersTableToolbarActionsProps {
  table: Table<SelectModifierResponseSchema>
}

export function ModifiersTableToolbarActions({
  table
}: ModifiersTableToolbarActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id!)

  return (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 && (
        <DeleteModifierDialog
          modifierIds={selectedIds}
          onSuccess={() => table.toggleAllRowsSelected(false)}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          showTrigger={true}
        />
      )}
      <CreateModifierDialog />
      <Button
        variant="outline"
        size="md"
        onClick={() =>
          exportTableToCSV(table, {
            filename: 'modifiers',
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
