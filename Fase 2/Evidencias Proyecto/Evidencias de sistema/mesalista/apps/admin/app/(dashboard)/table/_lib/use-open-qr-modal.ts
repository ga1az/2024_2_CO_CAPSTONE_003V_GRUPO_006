import { create } from 'zustand'

interface TableQRModalStore {
  isOpen: boolean
  tableId: number
  qrCode: string
  onOpen: (tableId: number, qrCode: string) => void
  onClose: () => void
}

const useTableQRModal = create<TableQRModalStore>((set) => ({
  isOpen: false,
  tableId: 0,
  qrCode: '',
  onOpen: (tableId: number, qrCode: string) =>
    set({ isOpen: true, tableId, qrCode }),
  onClose: () => set({ isOpen: false, tableId: 0, qrCode: '' })
}))

export default useTableQRModal
