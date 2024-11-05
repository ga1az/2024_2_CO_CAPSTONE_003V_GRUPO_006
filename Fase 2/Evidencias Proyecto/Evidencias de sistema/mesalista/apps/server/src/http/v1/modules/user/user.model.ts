import { db, eq } from '@mesalista/database'
import {
  InsertOrgUserSchema,
  orgUserTable,
  SelectOrgUserSchema
} from '@mesalista/database/src/schema'
import {
  DatabaseError,
  NotFoundError
} from '../../../../middlewares/error.middleware'
import { handleError } from '../../../../utils'

// Get user by id
export async function getUserById(
  userId: number
): Promise<SelectOrgUserSchema> {
  try {
    const result = await db.query.orgUserTable.findFirst({
      where: eq(orgUserTable.id, userId),
      columns: {
        password: false
      }
    })

    if (!result) {
      console.log(`User with id ${userId} not found`)
      throw new NotFoundError(`User not found`)
    }

    return result
  } catch (error) {
    handleError(error, 'fetch user by id')
  }
}

// Get user by email
export async function getUserByEmail(
  email: string
): Promise<SelectOrgUserSchema> {
  try {
    const result = await db.query.orgUserTable.findFirst({
      where: eq(orgUserTable.email, email),
      columns: {
        password: false
      }
    })

    if (!result) {
      console.log(`User with email ${email} not found`)
      throw new NotFoundError(`User not found`)
    }

    return result
  } catch (error) {
    handleError(error, 'fetch user by email')
  }
}

// Create new user
export async function createUser(
  data: InsertOrgUserSchema
): Promise<SelectOrgUserSchema> {
  try {
    const result = await db
      .insert(orgUserTable)
      .values(data)
      .returning({
        id: orgUserTable.id,
        name: orgUserTable.name,
        email: orgUserTable.email,
        role: orgUserTable.role,
        image: orgUserTable.image,
        isActive: orgUserTable.isActive,
        createdAt: orgUserTable.createdAt,
        updatedAt: orgUserTable.updatedAt
      })
      .then((result) => result[0])

    if (!result.id) {
      console.log(
        `Failed to create user: no id returned for data ${JSON.stringify(data)}`
      )
      throw new DatabaseError('Failed to create user')
    }

    return result
  } catch (error) {
    handleError(error, 'create user')
  }
}

// Update user
export async function updateUser(
  id: number,
  data: Partial<InsertOrgUserSchema>
): Promise<SelectOrgUserSchema> {
  try {
    const result = await db
      .update(orgUserTable)
      .set(data)
      .where(eq(orgUserTable.id, id))
      .returning({
        id: orgUserTable.id,
        name: orgUserTable.name,
        email: orgUserTable.email,
        role: orgUserTable.role,
        image: orgUserTable.image,
        isActive: orgUserTable.isActive,
        createdAt: orgUserTable.createdAt,
        updatedAt: orgUserTable.updatedAt
      })
      .then((result) => result[0])

    if (!result.id) {
      console.log(`User with id ${id} not found for update`)
      throw new NotFoundError(`User not found`)
    }

    return result
  } catch (error) {
    handleError(error, 'update user')
  }
}

// Delete user
export async function deleteUser(id: number): Promise<number> {
  try {
    const result = await db
      .delete(orgUserTable)
      .where(eq(orgUserTable.id, id))
      .returning({ id: orgUserTable.id })
      .then((result) => result[0])

    if (!result) {
      console.log(`User with id ${id} not found for deletion`)
      throw new NotFoundError(`User not found`)
    }

    return result.id
  } catch (error) {
    handleError(error, 'delete user')
  }
}

// Get all users
export async function getAllUsers(): Promise<SelectOrgUserSchema[]> {
  try {
    const result = await db.query.orgUserTable.findMany()

    if (!result || result.length === 0) {
      console.log(`No users found`)
      throw new NotFoundError('No users found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch all users')
  }
}

export async function getUserForSignin(email: string) {
  try {
    const result = await db.query.orgUserTable.findFirst({
      where: eq(orgUserTable.email, email)
    })

    if (!result) {
      console.log(`User with email ${email} not found`)
      throw new NotFoundError('User not found')
    }

    return result
  } catch (error) {
    handleError(error, 'fetch user for signin')
  }
}
