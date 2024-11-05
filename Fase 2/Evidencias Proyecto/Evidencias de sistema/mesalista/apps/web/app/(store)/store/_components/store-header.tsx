import { Store } from '../_lib/schemas'

interface StoreHeaderProps {
  store: Store
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <div className="relative h-[200px] md:h-[300px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${store.bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative container mx-auto px-4 h-full flex items-end pb-6">
        <div className="text-white flex-1">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          {store.desc && <p className="mt-2 text-gray-200">{store.desc}</p>}
        </div>
      </div>
    </div>
  )
}
