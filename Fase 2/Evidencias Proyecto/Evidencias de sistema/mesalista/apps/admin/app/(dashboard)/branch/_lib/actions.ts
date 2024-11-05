'use server'

import { getErrorMessage } from '@/lib/handle-error'
import { getCookie } from '@/actions/auth'
import { api } from '@mesalista/api'
import { UpdateStoreSchema } from '@mesalista/database/src/schema'

export async function getBranchInfo() {
  try {
    const authorization = await getCookie()

    const response = await api.v1.store.get({
      headers: { authorization }
    })

    if (!response.data?.data || !response.data?.data?.id) {
      return null
    }

    return {
      status: response.status,
      message: response.data!.message,
      data: response.data!.data
    }
  } catch (error) {
    return {
      status: 500,
      message: getErrorMessage(error)
    }
  }
}

export async function updateBranchInfo(body: UpdateStoreSchema) {
  try {
    const authorization = await getCookie()

    const response = await api.v1.store.put(body, {
      headers: { authorization }
    })

    if (response.status !== 200) {
      return {
        status: response.status,
        message: response.data!.message
      }
    }

    return true
  } catch (error) {
    return {
      status: 500,
      message: getErrorMessage(error)
    }
  }
}
