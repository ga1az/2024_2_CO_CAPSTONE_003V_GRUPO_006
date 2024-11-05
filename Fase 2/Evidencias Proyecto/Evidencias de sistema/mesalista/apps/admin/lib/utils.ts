import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (typeof date === 'string') {
    // Create date in UTC
    const d = new Date(date.replace(' ', 'T').replace(' ', 'T'))
    // Convert to UTC timestamp
    const utcDate = Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    )
    date = new Date(utcDate)
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    day: '2-digit',
    timeZone: 'UTC', // Force UTC timezone
    ...opts
  }).format(date)
}

/**
 * Stole this from the @radix-ui/primitive
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event)
    }
  }
}

export type DirtyFieldsType =
  | boolean
  | null
  | {
      [key: string]: DirtyFieldsType
    }
  | DirtyFieldsType[]

export function getDirtyValues<T extends Record<string, any>>(
  dirtyFields: Partial<Record<keyof T, DirtyFieldsType>>,
  values: T,
  initialValues?: T
): Partial<T> {
  const dirtyValues = Object.keys(values).reduce((prev, key) => {
    const value = values[key]
    const isDirty =
      dirtyFields[key] || (initialValues && initialValues[key] !== value)

    if (!isDirty) {
      return prev
    }

    const isObject = typeof value === 'object'
    const isArray = Array.isArray(value)
    const nestedValue =
      isObject && !isArray
        ? getDirtyValues(
            (dirtyFields[key] as Record<string, any>) || {},
            value,
            initialValues?.[key]
          )
        : value

    return { ...prev, [key]: isArray ? value : nestedValue }
  }, {} as Partial<T>)

  return dirtyValues
}
