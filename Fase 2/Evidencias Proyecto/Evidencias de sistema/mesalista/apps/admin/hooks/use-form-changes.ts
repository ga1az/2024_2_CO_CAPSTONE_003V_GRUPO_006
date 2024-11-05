import * as React from 'react'
import isEqual from 'lodash/isEqual'

export function useFormChanges<T extends { id: number }>(
  formData: T,
  originalData: T,
  options?: {
    imageField?: keyof T
  }
): {
  changedFields: Partial<T>
  hasChanges: boolean
} {
  return React.useMemo(() => {
    // Initialize with only id
    const changedFields = {
      id: originalData.id
    } as Partial<T>

    // Explicitly type the keys and filter out internal fields
    const keys = Object.keys(formData).filter(
      (key) => !['id', 'createdAt', 'updatedAt'].includes(key)
    ) as (keyof T)[]

    keys.forEach((key) => {
      const formValue = formData[key]
      const originalValue = originalData[key]

      if (options?.imageField && key === options.imageField) {
        if (formValue !== originalValue) {
          if (
            formValue === null ||
            (typeof formValue === 'string' &&
              formValue.startsWith('data:image'))
          ) {
            changedFields[key] = formValue
          }
        }
      } else if (Array.isArray(formValue) && Array.isArray(originalValue)) {
        // Deep comparison for arrays
        if (!isEqual(formValue, originalValue)) {
          changedFields[key] = formValue
        }
      } else if (!isEqual(formValue, originalValue)) {
        // Deep comparison for other values
        changedFields[key] = formValue
      }
    })

    const imageField = options?.imageField
    const hasImageChange = Boolean(
      imageField &&
        imageField in changedFields &&
        ((changedFields[imageField] === null &&
          originalData[imageField] !== null) ||
          (typeof changedFields[imageField] === 'string' &&
            (changedFields[imageField] as string).startsWith('data:image')))
    )

    // Check if there are any changes besides the id
    const hasChanges = Object.keys(changedFields).length > 1 || hasImageChange

    return {
      changedFields,
      hasChanges
    }
  }, [formData, originalData, options])
}
