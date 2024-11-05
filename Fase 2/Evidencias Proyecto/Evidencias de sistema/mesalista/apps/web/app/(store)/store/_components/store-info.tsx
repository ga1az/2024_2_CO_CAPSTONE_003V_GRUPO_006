import { Store } from '../_lib/types'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface StoreInfoProps {
  store: Store
}

export default function StoreInfo({ store }: StoreInfoProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Información</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {store.address && (
          <div>
            <h3 className="font-medium">Dirección</h3>
            <p className="text-gray-600">{store.address}</p>
          </div>
        )}
        {store.email && (
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-gray-600">{store.email}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
