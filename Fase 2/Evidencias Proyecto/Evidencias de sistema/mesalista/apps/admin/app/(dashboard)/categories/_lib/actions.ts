'use server'

import { api } from '@mesalista/api'
import { getCookie } from '@/actions/auth'
import { getErrorMessage } from '@/lib/handle-error'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import {
  InsertCategorySchema,
  SelectCategorySchema,
  UpdateCategorySchema
} from '@mesalista/database/src/schema'

// Create a new category
export async function createCategory(input: InsertCategorySchema) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.category.post(
      {
        ...input
      },
      {
        headers: { authorization }
      }
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
      message: 'Failed to create category',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Update a category
export async function updateCategory(id: number, input: UpdateCategorySchema) {
  noStore()
  try {
    const authorization = await getCookie()
    console.log('Updating category with id:', id, 'and input:', input)
    const response = await api.v1.category({ id }).put(
      {
        ...input
      },
      {
        headers: { authorization }
      }
    )

    // Add proper cache invalidation
    revalidatePath(`/modifiers/${id}`)
    revalidatePath('/modifiers')

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

// Fetch all categories
export async function getCategories({
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
    const response = await api.v1.category.all.get({
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
    console.error('Error fetching categories:', err)
    return {
      status: 'error',
      message: 'Failed to fetch categories',
      data: null,
      pagination: null,
      error: getErrorMessage(err)
    }
  }
}

// Fetch a category by ID
export async function getCategoryById(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.category({ id }).get({
      headers: { authorization }
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

// Fetch products by category ID
export async function getProductsByCategory(categoryId: number) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.product.category({ categoryId }).get({
      headers: { authorization },
      query: {}
    })

    return {
      status: response.status,
      message: response.data?.message,
      data: response.data?.data,
      error: null
    }
  } catch (err) {
    return {
      status: 'error',
      message: 'Failed to fetch products',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Delete categories
export async function deleteCategories(input: { ids: number[] }) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.category.bulk.delete(
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
      status: null,
      message: null,
      data: null,
      error: null
    }
  }
}

// Delete a category
export async function deleteCategory(id: number) {
  noStore()
  try {
    const authorization = await getCookie()
    await api.v1.category({ id }).delete({ headers: { authorization } })

    // Add proper cache invalidation
    revalidatePath(`/modifiers/${id}`)
    revalidatePath('/modifiers')
  } catch (err) {
    return {
      status: null,
      message: null,
      data: null,
      error: null
    }
  }
}

// Update categories
export async function updateCategories(input: {
  ids: number[]
  data: { isActive: boolean }
}) {
  noStore()
  try {
    const authorization = await getCookie()
    await api.v1.category.bulk.put(
      {
        ids: input.ids,
        data: { isActive: input.data.isActive }
      },
      { headers: { authorization } }
    )

    revalidatePath('/')

    return {
      data: null,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Reorder categories
export async function reorderCategories(input: {
  order: Array<{ id: number; sort: number }>
}) {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.category.reorder.put(
      {
        order: input.order
      },
      { headers: { authorization } }
    )

    revalidatePath('/')

    return {
      status: response.status,
      message: response.data?.message ?? 'Categories reordered successfully',
      data: response.data?.data,
      error: null
    }
  } catch (err) {
    return {
      status: 'error',
      message: 'Failed to reorder categories',
      data: null,
      error: getErrorMessage(err)
    }
  }
}

// Get all Active Categories
export async function getActiveCategories(): Promise<SelectCategorySchema[]> {
  noStore()
  try {
    const authorization = await getCookie()
    const response = await api.v1.category.all.get({
      query: {
        filters: 'isActive:eq:true'
      },
      headers: { authorization }
    })

    return Array.isArray(response.data?.data) ? response.data.data : []
  } catch (err) {
    console.error('Error fetching categories:', err)
    return []
  }
}
