import { db, eq } from '@mesalista/database'
import {
  SelectOrganizationSchema,
  UpdateOrganizationSchema,
  organizationTable
} from '@mesalista/database/src/schema'
import { NotFoundError } from '../../../../middlewares/error.middleware'
import { handleError } from '../../../../utils'
// Get organization by id
export async function getOrganizationById(
  organizationId: number
): Promise<SelectOrganizationSchema> {
  try {
    const result = await db.query.organizationTable.findFirst({
      where: eq(organizationTable.id, organizationId)
    })

    if (!result) {
      console.log(`Organization with id ${organizationId} not found`)
      throw new NotFoundError('Organization not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch organization by id')
  }
}

// Get organization by slug
export async function getOrganizationBySlug(
  slug: string
): Promise<SelectOrganizationSchema> {
  try {
    const result = await db.query.organizationTable.findFirst({
      where: eq(organizationTable.slug, slug)
    })

    if (!result) {
      console.log(`Organization with slug ${slug} not found`)
      throw new NotFoundError('Organization not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch organization by slug')
  }
}

// Update organization info
export async function updateOrganization(
  id: number,
  data: Partial<UpdateOrganizationSchema>
): Promise<SelectOrganizationSchema> {
  try {
    const result = await db
      .update(organizationTable)
      .set(data)
      .where(eq(organizationTable.id, id))
      .returning()
      .then((result) => result[0])

    if (!result.id) {
      console.log(`Organization with id ${id} not found for update`)
      throw new NotFoundError('Organization not found')
    }

    return result
  } catch (error) {
    handleError(error, 'update organization')
  }
}
