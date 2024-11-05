import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonItem() {
  return (
    <div className="grid gap-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="border rounded-lg p-5 flex flex-col max-w-[300px]"
        >
          <div className="flex flex-row justify-between items-center">
            <Skeleton className="h-6 w-24" /> {/* Order # */}
            <Skeleton className="h-8 w-28 rounded-full" /> {/* Status Badge */}
          </div>
          <Separator className="my-5" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-36" /> {/* Time */}
            <Skeleton className="h-5 w-28" /> {/* Table */}
          </div>
          <Separator className="my-5" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <Skeleton className="h-5 w-20" /> {/* Items count */}
              <Skeleton className="h-5 w-24" /> {/* Total amount */}
            </div>
            {[...Array(3)].map((_, itemIndex) => (
              <div key={itemIndex} className="flex flex-row justify-between">
                <Skeleton className="h-4 w-32" /> {/* Product name */}
                <Skeleton className="h-4 w-16" /> {/* Price */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
