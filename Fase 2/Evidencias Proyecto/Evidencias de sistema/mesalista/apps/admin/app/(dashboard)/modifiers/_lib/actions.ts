'use server'

import { api } from '@mesalista/api'
import { getCookie } from '@/actions/auth'
import { getErrorMessage } from '@/lib/handle-error'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import {
  InsertModifierOptionWithoutIdOptSchema,
  UpdateModifierDTOSchema
} from '@mesalista/database/src/schema'

// Create a new modifier
export async function createModifier(
  input: InsertModifierOptionWithoutIdOptSchema
) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.modifier.post(
      {
        ...input
      },
      {
        headers: { authorization }
      }
    )

    console.log('response', response)

    revalidatePath('/')

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      error: response.error?.value
    }
  } catch (err) {
    return {
      status: 'error',
      message: 'Failed to create Modifier',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Update a modifier
export async function updateModifier(
  id: number,
  input: UpdateModifierDTOSchema
) {
  noStore()
  try {
    const authorization = await getCookie()

    // Prepare update data with proper handling of options and products
    const updateData = {
      name: input.name,
      isMultipleChoice: input.isMultipleChoice,
      isRequired: input.isRequired,
      id,
      options:
        input.options?.map((opt) => ({
          name: opt.name,
          overcharge: opt.overcharge,
          ...(opt.idOption && { idOption: opt.idOption })
        })) || [],
      products:
        input.products?.map((prod) => ({
          name: prod.name,
          idProduct: prod.idProduct
        })) || []
    }

    console.log('Update data:', updateData)

    // First, update the modifier
    const response = await api.v1.modifier.modifier({ id }).put(updateData, {
      headers: { authorization }
    })

    // Then, fetch the updated data to ensure we have the latest state
    const updatedData = await api.v1.modifier({ id }).get({
      headers: { authorization }
    })

    revalidatePath('/')

    return {
      status: response.status,
      message: response.data?.message,
      data: updatedData.data?.data, // Return the fresh data
      error: response.error?.value
    }
  } catch (err) {
    console.error('Update error:', err)
    return {
      status: 'error',
      message: 'Failed to update Modifier',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Fetch all modifiers
export async function getModifiers({
  page,
  pageSize,
  orderBy,
  filters,
  select
}: {
  page: number
  pageSize: number
  orderBy: string
  filters: string
  select: string
}) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.modifier.all.get({
      query: {
        page,
        pageSize,
        orderBy,
        filters,
        select
      },
      headers: { authorization }
    })

    const pagination = response.data?.pagination
    let pageCount = 1

    if (pagination) {
      // Calculate pageCount based on the presence of 'next'
      pageCount = pagination.next ? page + 1 : page
    }

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      pagination: {
        ...pagination,
        pageCount
      }
    }
  } catch (err) {
    console.error('Error fetching modifiers:', err)
    return {
      status: 'error',
      message: 'Failed to fetch modifiers',
      data: null,
      pagination: null,
      error: getErrorMessage(err)
    }
  }
}

// Fetch a modifier by ID
export async function getModifierById(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.modifier({ id }).get({
      headers: { authorization }
    })

    // Ensure we return the complete data structure
    return {
      data: {
        ...response.data?.data,
        options: response.data?.data?.options || [],
        products: response.data?.data?.products || []
      },
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Delete a modifier
export async function deleteModifier(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.modifier({ id }).delete({
      headers: { authorization }
    })

    revalidatePath('/')

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      error: null // Important: Set error to null on success
    }
  } catch (err) {
    console.error('Delete error:', err)
    return {
      status: 'error',
      message: 'Failed to delete Modifier',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Bulk delete modifiers
export async function deleteModifiers(input: { ids: number[] }) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.modifier.bulk.delete(
      {
        ids: input.ids
      },
      { headers: { authorization } }
    )

    revalidatePath('/')

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      error: response.error?.value
    }
  } catch (err) {
    return {
      status: 'error',
      message: 'Failed to delete modifiers',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Bulk update modifiers
export async function updateModifiers(input: { ids: number[]; data: any }) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.modifier.bulk.put(
      {
        ids: input.ids,
        data: input.data
      },
      { headers: { authorization } }
    )

    revalidatePath('/')

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      error: response.error?.value
    }
  } catch (err) {
    return {
      status: 'error',
      message: 'Failed to update modifiers',
      data: null,
      error: getErrorMessage(err)
    }
  }
}
