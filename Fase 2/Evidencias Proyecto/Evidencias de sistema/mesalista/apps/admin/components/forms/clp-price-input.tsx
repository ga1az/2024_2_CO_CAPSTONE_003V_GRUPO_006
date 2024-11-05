'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ControllerRenderProps } from 'react-hook-form'

interface CLPPriceInputProps {
  field: ControllerRenderProps<any, string>
  label?: string
}

export function CLPPriceInput({
  field,
  label = 'Price (CLP)'
}: CLPPriceInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    // Initialize display value from field value
    const value = field.value || 0 // Provide default value of 0
    setDisplayValue(formatPrice(value.toString()))
  }, [field.value])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Remove any non-digit characters
    setDisplayValue(formatPrice(value))
    field.onChange(parseInt(value) || 0) // Ensure we always have a number
  }

  const formatPrice = (value: string) => {
    const number = parseInt(value.replace(/\D/g, ''), 10)
    if (isNaN(number)) return '0' // Return '0' instead of empty string
    return number.toLocaleString('es-CL')
  }

  return (
    <div className="w-full">
      <Label htmlFor={field.name} className="mb-1 block text-sm font-medium">
        {label}
      </Label>
      <div className="relative rounded-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground sm:text-sm">CLP</span>
        </div>
        <Input
          {...field}
          type="text"
          className="pl-14 pr-12"
          placeholder="0"
          aria-describedby="price-currency"
          value={displayValue}
          onChange={handlePriceChange}
          onBlur={(e) => {
            field.onBlur()
            setDisplayValue(formatPrice(displayValue))
          }}
          onFocus={(e) =>
            e.target.setSelectionRange(
              e.target.value.length,
              e.target.value.length
            )
          }
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span
            className="text-muted-foreground sm:text-sm"
            id="price-currency"
          >
            Pesos
          </span>
        </div>
      </div>
    </div>
  )
}
