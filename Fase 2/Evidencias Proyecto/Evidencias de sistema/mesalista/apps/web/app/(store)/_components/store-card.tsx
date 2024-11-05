import { Card, CardContent } from '@/components/ui/card'
import { Store } from '../_lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from 'lucide-react'
import { useTransitionRouter } from 'next-view-transitions'
import { motion } from 'framer-motion'

interface StoreCardProps {
  store: Store
}

export function StoreCard({ store }: StoreCardProps) {
  const router = useTransitionRouter()

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className="relative aspect-video w-full">
          {store.bgImage ? (
            <motion.img
              src={store.bgImage}
              alt={store.name}
              className="object-cover w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{store.name}</h3>
                <Badge variant={store.isActive ? 'default' : 'secondary'}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {store.desc && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {store.desc}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() =>
                store.isActive && router.push(`/store/${store.id}`)
              }
              disabled={!store.isActive}
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
