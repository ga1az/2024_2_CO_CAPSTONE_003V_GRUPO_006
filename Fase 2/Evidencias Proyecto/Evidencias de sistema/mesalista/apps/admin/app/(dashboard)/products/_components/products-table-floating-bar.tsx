import * as React from 'react'
import { SelectProductSchema } from '@mesalista/database/src/schema'
import {
  Cross2Icon,
  DownloadIcon,
  ReloadIcon,
  TrashIcon
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { toast } from 'sonner'

import { exportTableToCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Kbd } from '@/components/kbd'

// import { deleteProducts } from '../_lib/actions'

interface productsTableFloatingBarProps {
  table: Table<SelectProductSchema>
}

export function ProductsTableFloatingBar({
  table
}: productsTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [isPending, startTransition] = React.useTransition()
  const [method, setMethod] = React.useState<
    'update-is-active' | 'export' | 'delete'
  >()

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        table.toggleAllRowsSelected(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [table])

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit px-4">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-card p-2 shadow-2xl">
          <div className="flex h-7 items-center rounded-md border border-dashed pl-2.5 pr-1">
            <span className="whitespace-nowrap text-xs">
              {rows.length} selected
            </span>
            <Separator orientation="vertical" className="ml-2 mr-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 hover:border"
                  onClick={() => table.toggleAllRowsSelected(false)}
                >
                  <Cross2Icon
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                <p className="mr-2">Clear selection</p>
                <Kbd abbrTitle="Escape" variant="outline">
                  Esc
                </Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="flex items-center gap-1.5">
            <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                  onClick={() => {
                    setMethod('export')

                    startTransition(() => {
                      exportTableToCSV(table, {
                        excludeColumns: ['select', 'actions'],
                        onlySelected: true
                      })
                    })
                  }}
                  disabled={isPending}
                >
                  {isPending && method === 'export' ? (
                    <ReloadIcon
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <DownloadIcon className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Export products</p>
              </TooltipContent>
            </Tooltip>
            {/* <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                  onClick={() => {
                    setMethod('delete')

                    startTransition(async () => {
                      const { error } = await deleteProducts({
                        ids: rows.map((row) => row.original.id)
                      })

                      if (error) {
                        toast.error(error)
                        return
                      }

                      table.toggleAllRowsSelected(false)
                    })
                  }}
                  disabled={isPending}
                >
                  {isPending && method === 'delete' ? (
                    <ReloadIcon
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrashIcon className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Delete products</p>
              </TooltipContent>
            </Tooltip> */}
          </div>
        </div>
      </div>
    </div>
  )
}
