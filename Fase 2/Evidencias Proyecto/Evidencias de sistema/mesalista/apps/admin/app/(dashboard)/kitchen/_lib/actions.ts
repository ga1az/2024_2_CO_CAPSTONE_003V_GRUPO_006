'use server'

import { api } from '@mesalista/api'
import { getCookie } from '@/actions/auth'
import { getErrorMessage } from '@/lib/handle-error'
import { RoundStatus } from '@mesalista/database/src/schema'

export async function getKitchenItemsOrders(
  startDate: string,
  endDate: string,
  status?: string
) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.order.item.all.get({
      query: {
        ...(status && { status }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
      headers: { authorization }
    })

    if (response.data?.data?.length === 0 || !response.data?.data) {
      return {
        status: 404,
        message: 'No data found',
        data: []
      }
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data.data
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to get kitchen items orders',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function updateRoundStatus(roundId: number, status: RoundStatus) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.order.round({ roundId }).put(
      {
        status
      },
      {
        headers: { authorization }
      }
    )

    if (response.status === 200) {
      return {
        status: response.status,
        message: response.data?.message,
        data: response.data?.data
      }
    }

    return {
      status: 400,
      message: 'Failed to update round status',
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to update round status',
      data: null,
      error: getErrorMessage(error)
    }
  }
}

export async function getDetailedInformationByRoundId(roundId: number) {
  try {
    const authorization = await getCookie()
    const response = await api.v1.order.round.detail({ roundId }).get({
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
      status: 400,
      message: 'Failed to get detailed information by round id',
      data: null
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to get detailed information by round id',
      data: null,
      error: getErrorMessage(error)
    }
  }
}
