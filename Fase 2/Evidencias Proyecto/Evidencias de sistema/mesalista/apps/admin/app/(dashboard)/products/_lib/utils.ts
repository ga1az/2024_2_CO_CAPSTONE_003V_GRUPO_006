import {
  // ArrowDownIcon,
  // ArrowRightIcon,
  // ArrowUpIcon,
  CheckCircledIcon,
  // CircleIcon,
  CrossCircledIcon
  // QuestionMarkCircledIcon,
  // StopwatchIcon
} from '@radix-ui/react-icons'
import { InsertProductSchema } from '@mesalista/database/src/schema'

/**
 * Returns the appropriate status icon based on the isActive property.
 * @param isActive - The active status of the Product.
 * @returns A React component representing the status icon.
 */
export function getStatusIcon(isActive: InsertProductSchema['isActive']) {
  return isActive ? CheckCircledIcon : CrossCircledIcon
}
