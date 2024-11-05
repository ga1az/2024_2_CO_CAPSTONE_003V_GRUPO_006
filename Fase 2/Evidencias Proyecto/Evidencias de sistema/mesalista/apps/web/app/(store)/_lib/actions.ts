import { api } from '@mesalista/api'
import { StoresResponse } from './types'

export async function getAllStores(): Promise<StoresResponse> {
  try {
    const response = await api.public.store.all.get()
    return {
      status: response.status,
      message: response.data?.message ?? 'Success',
      data: response.data?.data ?? []
    }
  } catch (error) {
    console.error('Error fetching stores:', error)
    return {
      status: 500,
      message: 'Failed to fetch stores',
      data: []
    }
  }
}

export async function validateTokenStore(qrCode: string, tmpCode?: string) {
  try {
    const result = await api.public.session.validate({ id: qrCode }).get({
      query: {
        code: tmpCode
      }
    })
    return result.data
  } catch (error) {
    return { valid: false, requiresCode: false, tableId: '' }
  }
}
