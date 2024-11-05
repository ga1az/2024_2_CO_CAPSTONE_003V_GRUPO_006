import CreateQRDialog from './_components/create-qr-dialog'
import CreateTableDialog from './_components/create-table-dialog'
import TableList from './_components/table-list'

export default function TablePage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold mb-2">Mesas</h1>
      </div>
      <TableList />
      <CreateTableDialog />
      <CreateQRDialog />
    </div>
  )
}
