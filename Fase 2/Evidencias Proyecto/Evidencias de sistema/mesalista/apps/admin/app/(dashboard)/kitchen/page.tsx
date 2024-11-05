import FullscreenButton from './_components/fullscreen-button'
import OrderList from './_components/order-list'

export default function KitchenPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold mb-2">Lista de órdenes</h1>
      </div>
      <OrderList />
      <FullscreenButton />
    </div>
  )
}
