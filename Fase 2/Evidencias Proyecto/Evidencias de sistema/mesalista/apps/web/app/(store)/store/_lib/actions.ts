'use server'

import { api } from '@mesalista/api'
import { unstable_noStore as noStore } from 'next/cache'
import { getErrorMessage } from '@/lib/handle-error'
import { APIResponse } from './types'
import { APIResponseSchema } from './schemas'

export async function getStoreData(storeId: string): Promise<APIResponse> {
  noStore()
  try {
    const id = parseInt(storeId, 10)
    if (isNaN(id)) {
      throw new Error('Invalid store ID')
    }
    console.log('Fetching store data for ID:', id)

    const response = await api.public.store.id({ id }).get()

    // Validate response against schema
    const validatedResponse = APIResponseSchema.safeParse({
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      error: response.error?.value
    })

    if (!validatedResponse.success) {
      console.error('Validation error:', validatedResponse.error)
      throw new Error('Invalid response format')
    }

    return validatedResponse.data
  } catch (err) {
    console.error('Error in getStoreData:', err)
    return {
      status: 500,
      message: 'Failed to fetch store data',
      data: null,
      error: getErrorMessage(err)
    }
  }
}
