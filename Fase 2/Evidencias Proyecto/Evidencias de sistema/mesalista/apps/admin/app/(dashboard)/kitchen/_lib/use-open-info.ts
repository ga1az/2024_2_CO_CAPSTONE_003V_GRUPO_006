import { SelectOrderItemsDto } from '@mesalista/database/src/schema'
import { create } from 'zustand'

interface InfoModalStore {
  isOpen: boolean
  data: SelectOrderItemsDto | null
  onOpen: (data: SelectOrderItemsDto) => void
  onClose: () => void
}

const useInfoModal = create<InfoModalStore>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: null })
}))

export default useInfoModal
