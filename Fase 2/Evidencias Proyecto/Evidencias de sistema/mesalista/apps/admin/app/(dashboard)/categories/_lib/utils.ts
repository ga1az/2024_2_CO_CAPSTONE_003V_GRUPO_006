import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { InsertCategorySchema } from '@mesalista/database/src/schema'

/**
 * Returns the appropriate status icon based on the isActive property.
 * @param isActive - The active status of the category.
 * @returns A React component representing the status icon.
 */
export function getStatusIcon(isActive: InsertCategorySchema['isActive']) {
  return isActive ? CheckCircledIcon : CrossCircledIcon
}
