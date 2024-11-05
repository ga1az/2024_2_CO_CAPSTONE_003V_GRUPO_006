'use server'

import { getCookie } from '@/actions/auth'
import { getErrorMessage } from '@/lib/handle-error'
import { api } from '@mesalista/api'
import {
  InsertQRSchema,
  InsertTableDTO,
  UpdateQRSchema,
  UpdateTableDTO
} from '@mesalista/database/src/schema'

export async function getTables() {
  try {
    const authorization = await getCookie()
    const response = await api.v1.table.all.get({ headers: { authorization } })

    if (response.status === 200) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to get tables',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function createTable(data: InsertTableDTO) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.table.post(data, {
      headers: { authorization }
    })

    if (!response.data?.status) {
      return {
        status: 500,
        message: response.data?.message,
        data: null
      }
    }

    return {
      status: response.data?.status,
      message: response.data?.message,
      data: response.data?.data
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to create table',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function updateTable(data: UpdateTableDTO, id: number) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.table({ id }).put(data, {
      headers: { authorization }
    })

    if (response.status === 200) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to update table',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function getQr() {
  try {
    const authorization = await getCookie()
    const response = await api.v1.qr.index.get({ headers: { authorization } })

    if (response.status === 200) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to get qr',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function createQr(data: InsertQRSchema) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.qr.index.post(data, {
      headers: { authorization }
    })

    if (response.status === 201) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to create qr',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function updateQr(data: UpdateQRSchema, id: number) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.qr.id({ id }).put(data, {
      headers: { authorization }
    })

    if (response.status === 200) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to update qr',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function getTableById(id: number) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.table({ id }).get({
      headers: { authorization }
    })

    if (response.status === 200) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to get table by id',
      data: null,
      error: getErrorMessage(error)
    }
  }
}
