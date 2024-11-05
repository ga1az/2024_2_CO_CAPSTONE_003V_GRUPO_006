'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Clock, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const DAYS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
} as const

interface OpeningHoursFormProps {
  form: UseFormReturn<any>
}

export function OpeningHoursForm({ form }: OpeningHoursFormProps) {
  const [selectedDay, setSelectedDay] =
    React.useState<keyof typeof DAYS>('monday')

  const handleDayChange = (day: keyof typeof DAYS) => {
    setSelectedDay(day)
  }

  const addTimeSlot = (day: keyof typeof DAYS) => {
    const currentHours = form.getValues(`openingHours.${day}`) || []
    form.setValue(`openingHours.${day}`, [
      ...currentHours,
      { open: '09:00', close: '18:00' }
    ])
  }

  const removeTimeSlot = (day: keyof typeof DAYS, index: number) => {
    const currentHours = form.getValues(`openingHours.${day}`)
    form.setValue(
      `openingHours.${day}`,
      currentHours.filter((_: any, i: number) => i !== index)
    )
  }

  const renderTimeSlots = (day: keyof typeof DAYS) => {
    const slots = form.watch(`openingHours.${day}`) || []
    return (
      <AnimatePresence>
        {slots.map((slot: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-secondary p-2 rounded-md"
          >
            <Input
              type="time"
              {...form.register(`openingHours.${day}.${index}.open`)}
              className="w-24"
            />
            <span>-</span>
            <Input
              type="time"
              {...form.register(`openingHours.${day}.${index}.close`)}
              className="w-24"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTimeSlot(day, index)}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Horario de Atención</h3>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border mb-4">
          <div className="flex p-4">
            {Object.entries(DAYS).map(([day, label]) => (
              <Button
                key={day}
                type="button" // Prevenir submit
                variant={selectedDay === day ? 'default' : 'secondary'}
                className="mr-2"
                onClick={(e) => {
                  e.preventDefault()
                  handleDayChange(day as keyof typeof DAYS)
                }}
              >
                {label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{DAYS[selectedDay]}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTimeSlot(selectedDay)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar horario
            </Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex p-4 gap-4">{renderTimeSlots(selectedDay)}</div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
