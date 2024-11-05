import { SelectTableSchema } from '@mesalista/database/src/schema'
import { create } from 'zustand'

interface TableModalStore {
  isOpen: boolean
  data?: SelectTableSchema
  onOpen: (data?: SelectTableSchema) => void
  onClose: () => void
}

const useTableModal = create<TableModalStore>((set) => ({
  isOpen: false,
  onOpen: (data?: SelectTableSchema) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false })
}))

export default useTableModal
