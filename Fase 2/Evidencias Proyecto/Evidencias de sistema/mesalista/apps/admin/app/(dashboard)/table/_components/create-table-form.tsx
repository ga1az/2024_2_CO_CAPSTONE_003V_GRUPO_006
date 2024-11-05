import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { createTable, updateTable } from '../_lib/action'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useTableModal from '../_lib/use-open-modal'

const formSchema = z.object({
  identifier: z.string().min(1, 'El identificador es requerido'),
  capacity: z.number().min(1, 'La capacidad mínima es 1').optional(),
  isActive: z.boolean().optional()
})

export default function CreateTableForm() {
  const queryClient = useQueryClient()
  const tableModal = useTableModal() // renamed from handleCloseModal
  const isEditMode = !!tableModal.data

  const validationSchema = isEditMode ? formSchema.partial() : formSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(validationSchema),
    values: {
      identifier: tableModal.data?.identifier || '',
      capacity: tableModal.data?.capacity || 1,
      isActive: tableModal.data?.isActive ?? true
    }
  })

  const createTableMutation = useMutation({
    mutationFn: createTable,
    onSuccess: (re) => {
      if (re.status === 201) {
        toast.success('Mesa creada correctamente')
        queryClient.invalidateQueries({ queryKey: ['tables'] })
        tableModal.onClose()
      } else {
        toast.error('Error al crear la mesa')
        tableModal.onClose()
      }
    }
  })

  const updateTableMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      updateTable(values, tableModal.data?.id!),
    onSuccess: (res) => {
      if (res.status === 200) {
        toast.success('Mesa actualizada correctamente')
        queryClient.invalidateQueries({ queryKey: ['tables'] })
        tableModal.onClose()
      } else {
        toast.error('Error al actualizar la mesa')
        tableModal.onClose()
      }
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    isEditMode
      ? updateTableMutation.mutate(values)
      : createTableMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificador</FormLabel>
              <FormControl>
                <Input placeholder="Mesa 1" {...field} />
              </FormControl>
              <FormDescription>
                Identificador único para la mesa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === '' ? 0 : Number(value))
                  }}
                />
              </FormControl>
              <FormDescription>
                Número de personas que pueden sentarse en la mesa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mesa Activa</FormLabel>
                <FormDescription>
                  Indica si la mesa está disponible para su uso
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {isEditMode ? 'Actualizar' : 'Crear'} Mesa
        </Button>
      </form>
    </Form>
  )
}
