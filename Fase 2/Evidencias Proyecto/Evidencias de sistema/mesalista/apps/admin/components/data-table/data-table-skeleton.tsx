import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface DataTableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  columnCount: number
  rowCount?: number
  searchableColumnCount?: number
  filterableColumnCount?: number
  showViewOptions?: boolean
  cellWidths?: string[]
  withPagination?: boolean
  shrinkZero?: boolean
  enableSorting?: boolean
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  searchableColumnCount = 0,
  filterableColumnCount = 0,
  showViewOptions = true,
  cellWidths = ['auto'],
  withPagination = true,
  shrinkZero = false,
  enableSorting = false,
  className,
  ...skeletonProps
}: DataTableSkeletonProps) {
  return (
    <div
      className={cn('w-full space-y-4 overflow-auto', className)}
      {...skeletonProps}
    >
      <div className="flex w-full items-center justify-between space-x-2 overflow-auto px-1">
        <div className="flex flex-1 items-center space-x-2">
          {searchableColumnCount > 0 && <Skeleton className="h-9 w-[250px]" />}
          {filterableColumnCount > 0 && <Skeleton className="h-9 w-[120px]" />}
        </div>
        {showViewOptions && <Skeleton className="ml-auto h-9 w-[120px]" />}
      </div>
      <div
        className={cn(
          'rounded-md',
          enableSorting ? 'border-2 border-primary' : 'border'
        )}
      >
        <Table>
          <TableHeader>
            <TableRow
              className={cn(
                'hover:bg-transparent',
                enableSorting && 'bg-primary/10'
              )}
            >
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableHead
                  key={index}
                  style={{
                    width: cellWidths[index % cellWidths.length],
                    minWidth: shrinkZero
                      ? cellWidths[index % cellWidths.length]
                      : 'auto'
                  }}
                >
                  <Skeleton
                    className={cn('h-6 w-full', enableSorting && 'h-8')}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell
                    key={colIndex}
                    style={{
                      width: cellWidths[colIndex % cellWidths.length],
                      minWidth: shrinkZero
                        ? cellWidths[colIndex % cellWidths.length]
                        : 'auto'
                    }}
                  >
                    <Skeleton
                      className={cn('h-6 w-full', enableSorting && 'h-8')}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination && (
        <div className="flex w-full items-center justify-between gap-4 overflow-auto px-1 sm:gap-8">
          <Skeleton className="h-9 w-[250px]" />
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-[100px]" />
              <Skeleton className="h-9 w-[70px]" />
            </div>
            <Skeleton className="h-9 w-[100px]" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
