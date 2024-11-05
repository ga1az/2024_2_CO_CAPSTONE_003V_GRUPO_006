'use server'

import { api } from '@mesalista/api'
import { getCookie } from '@/actions/auth'
import { getErrorMessage } from '@/lib/handle-error'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import {
  InsertProductDTO,
  SelectProductSchema,
  UpdateProductDTO
} from '@mesalista/database/src/schema'

// Create a new Product
export async function createProduct(input: InsertProductDTO) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.product.post(
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
      message: 'Failed to create product',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Update a Product
export async function updateProduct(id: number, input: UpdateProductDTO) {
  noStore()
  try {
    const authorization = await getCookie()
    console.log('Updating product with id:', id, 'and input:', input)
    const response = await api.v1
      .product({ id })
      .put({ ...input }, { headers: { authorization } })

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
      message: 'Failed to update category',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Fetch all Products
export async function getProducts({
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
    const response = await api.v1.product.all.get({
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
    console.error('Error fetching Products:', err)
    return {
      status: 'error',
      message: 'Failed to fetch Products',
      data: null,
      pagination: null,
      error: getErrorMessage(err)
    }
  }
}

// Fetch a Product by ID
export async function getProductById(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.product({ id }).get({
      headers: { authorization },
      query: {
        withPrices: true
      }
    })

    return {
      data: response.data,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Delete a Product
export async function deleteProduct(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    await api.v1.product({ id }).delete({ headers: { authorization } })

    revalidatePath('/')

    return {
      status: null,
      message: null,
      data: null
    }
  } catch (err) {
    return {
      status: null,
      message: null,
      data: null,
      error: null
    }
  }
}

// Bulk delete Products
export async function deleteProducts(input: { ids: number[] }) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.product.bulk.delete(
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
      error: response.error?.status
    }
  } catch (err) {
    return {
      status: null,
      message: null,
      data: null,
      error: null
    }
  }
}

// Fetch all Products that are active
export async function getActiveProducts(): Promise<SelectProductSchema[]> {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.product.all.get({
      query: {
        filters: 'isActive:eq:true',
        select: 'id,name', // Make sure we select both id and name
        pageSize: 100 // Add pageSize to get all products
      },
      headers: { authorization }
    })

    return Array.isArray(response.data?.data) ? response.data.data : []
  } catch (err) {
    console.error('Error fetching products:', err)
    return []
  }
}

// Fetch all Products by Modifier ID
export async function getProductsByModifier(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.product.modifier({ modifierId: id }).get({
      headers: { authorization }
    })

    return {
      data: response.data?.data,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
}

export async function getProductCategory(productId: number) {
  noStore()
  try {
    const authorization = await getCookie()
    // Update the endpoint path to use 'id'
    const response = await api.v1.product({ id: productId }).category.get({
      headers: { authorization }
    })

    return {
      data: response.data?.data,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
}

export async function getProductModifiers(productId: number) {
  noStore()
  try {
    const authorization = await getCookie()
    // Update the endpoint path to use 'id'
    const response = await api.v1.product({ id: productId }).modifiers.get({
      headers: { authorization }
    })

    return {
      data: response.data?.data || [],
      error: null
    }
  } catch (err) {
    return {
      data: [],
      error: getErrorMessage(err)
    }
  }
}
