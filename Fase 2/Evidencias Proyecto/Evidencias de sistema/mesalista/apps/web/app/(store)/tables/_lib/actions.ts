import { api } from '@mesalista/api'
import { TableResponse } from './types'
import { getErrorMessage } from '@/lib/handle-error'

export async function getTableData(
  storeId: string | number,
  identifier?: string
): Promise<TableResponse> {
  try {
    // Convertir storeId a número
    const id = typeof storeId === 'string' ? parseInt(storeId, 10) : storeId

    if (isNaN(id)) {
      throw new Error('Invalid store ID')
    }

    const response = await api.public.store.tables({ id }).get()

    if (!response.data) {
      throw new Error('No data received from API')
    }

    return {
      status: response.status,
      message: response.data.message,
      data: response.data.data
    }
  } catch (err) {
    console.error('Error in getTableData:', err)
    return {
      status: 500,
      message: 'Failed to fetch table data',
      data: null,
      error: getErrorMessage(err)
    }
  }
}
