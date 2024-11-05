import { Store } from '../_lib/types'
import { StoreCard } from './store-card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface StoreGridProps {
  stores: Store[]
  isLoading: boolean
}

export function StoreGrid({ stores, isLoading }: StoreGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="space-y-4"
          >
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (!stores.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground">No stores found</p>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {stores.map((store) => (
          <motion.div
            key={store.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <StoreCard store={store} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
