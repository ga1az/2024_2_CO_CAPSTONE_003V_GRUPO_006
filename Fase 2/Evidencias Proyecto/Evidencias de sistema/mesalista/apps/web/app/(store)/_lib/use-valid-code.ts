import { create } from 'zustand'
import { validateTokenStore } from './actions'

interface ValidStoreCode {
  isValid: boolean
  needsCode: boolean
  tableId: string
  onValidateCode: (qrCode: string, tmpCode?: string) => void
}

const useValidStoreCode = create<ValidStoreCode>((set) => ({
  isValid: false,
  needsCode: false,
  tableId: '',
  onValidateCode: async (code: string, tmpCode?: string) => {
    const isValid = await validateTokenStore(code, tmpCode)
    if (isValid) {
      set({
        isValid: isValid.valid,
        needsCode: isValid.requiresCode,
        tableId: isValid.tableId
      })
    } else {
      set({ isValid: false, needsCode: false, tableId: '' })
    }
  }
}))

export default useValidStoreCode
