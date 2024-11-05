import FullscreenButton from '../kitchen/_components/fullscreen-button'
import OrderList from '../kitchen/_components/order-list'

export default function WaiterPage() {
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
