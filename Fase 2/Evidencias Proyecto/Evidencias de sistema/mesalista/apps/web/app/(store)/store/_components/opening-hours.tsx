import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface OpeningHoursProps {
  hours: {
    [key: string]: {
      open: string
      close: string
    }[]
  }
}

const daysTranslation = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

export default function OpeningHours({ hours }: OpeningHoursProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Horarios</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(hours).map(([day, schedules]) => (
            <div key={day} className="flex justify-between">
              <span className="font-medium">
                {daysTranslation[day as keyof typeof daysTranslation]}
              </span>
              <div>
                {schedules.map((schedule, index) => (
                  <div key={index} className="text-gray-600">
                    {schedule.open} - {schedule.close}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
