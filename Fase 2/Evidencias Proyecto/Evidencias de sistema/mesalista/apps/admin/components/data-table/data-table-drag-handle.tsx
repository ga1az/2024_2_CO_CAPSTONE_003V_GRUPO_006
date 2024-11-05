import { DragHandleDots2Icon } from '@radix-ui/react-icons'

export function DataTableDragHandle() {
  return (
    <div className="flex items-center justify-center h-full w-full cursor-move">
      <DragHandleDots2Icon className="h-4 w-4" />
    </div>
  )
}
