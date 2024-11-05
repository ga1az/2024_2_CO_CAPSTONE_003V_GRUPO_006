'use client'

import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, ZoomIn, ZoomOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ImageUploadDialog } from '@/components/forms/image-upload-dialog'
import { cn } from '@/lib/utils'

import { getBranchInfo, updateBranchInfo } from '../_lib/actions'
import { OpeningHoursSchema } from '@mesalista/database/src/schema'
import { OpeningHoursForm } from '@/components/forms/opening-hours-form'
import { useFormChanges } from '@/hooks/use-form-changes'
import { Icons } from '@/components/icons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { DownloadIcon, ImageIcon } from '@radix-ui/react-icons'

const currencySymbols = [
  { value: '$', label: 'Dólar ($)' },
  { value: '€', label: 'Euro (€)' },
  { value: '£', label: 'Libra (£)' },
  { value: '¥', label: 'Yen (¥)' },
  { value: 'CLP$', label: 'Peso Chileno (CLP$)' }
] as const

const formSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  desc: z.string().optional(),
  bgImage: z.string().optional(),
  currency: z.enum(['CLP', 'USD']).optional(),
  currencySymbol: z.string().min(1, 'El símbolo es requerido'),
  address: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional(),
  openingHours: z
    .object({
      monday: z.array(z.object({ open: z.string(), close: z.string() })),
      tuesday: z.array(z.object({ open: z.string(), close: z.string() })),
      wednesday: z.array(z.object({ open: z.string(), close: z.string() })),
      thursday: z.array(z.object({ open: z.string(), close: z.string() })),
      friday: z.array(z.object({ open: z.string(), close: z.string() })),
      saturday: z.array(z.object({ open: z.string(), close: z.string() })),
      sunday: z.array(z.object({ open: z.string(), close: z.string() }))
    })
    .optional()
})

export default function BranchForm() {
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false)
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(1)

  // Add these functions inside your component
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const queryClient = useQueryClient()

  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branch-info'],
    queryFn: () => getBranchInfo()
  })

  const updateBranchMutation = useMutation({
    mutationFn: updateBranchInfo,
    onSuccess: () => {
      toast.success('Sucursal actualizada correctamente')
      queryClient.invalidateQueries({ queryKey: ['branch-info'] })
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      isActive: branchData?.data?.isActive ?? true,
      name: branchData?.data?.name ?? '',
      desc: branchData?.data?.desc ?? '',
      address: branchData?.data?.address ?? '',
      email: branchData?.data?.email ?? '',
      slug: branchData?.data?.slug ?? '',
      currency: (branchData?.data?.currency as 'CLP' | 'USD') ?? 'CLP',
      currencySymbol: branchData?.data?.currencySymbol ?? 'CLP$',
      bgImage: branchData?.data?.bgImage ?? '',
      openingHours: (branchData?.data?.openingHours as OpeningHoursSchema) ?? {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
  })

  // Use the useFormChanges hook
  const formValues = form.watch()
  const { changedFields, hasChanges } = useFormChanges(
    { ...formValues, id: branchData?.data?.id ?? 0 },
    { ...branchData?.data, id: branchData?.data?.id ?? 0 },
    { imageField: 'bgImage' }
  )

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { openingHours, bgImage, ...rest } = changedFields

    // Solo incluir bgImage si ha cambiado
    const updateData = {
      ...rest,
      ...(bgImage && { bgImage }),
      openingHours: openingHours as any
    }

    updateBranchMutation.mutate(updateData)
  }

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Status Banner - Full Width */}
          <Card className="lg:col-span-2">
            <CardContent
              className={cn(
                'p-6 transition-colors',
                form.watch('isActive')
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-red-500'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {form.watch('isActive') ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <h3 className="font-medium">Estado de la Sucursal: </h3>
                      <Badge
                        className="text-xs cursor-pointer select-none ml-2"
                        variant={
                          form.watch('isActive') ? 'default' : 'destructive'
                        }
                      >
                        {form.watch('isActive') ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        'text-sm',
                        form.watch('isActive')
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {form.watch('isActive')
                        ? 'La sucursal está visible para los clientes'
                        : 'La sucursal está oculta para los clientes'}
                    </p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className={cn(
                            'data-[state=checked]:bg-green-500',
                            'data-[state=unchecked]:bg-red-500'
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Imagen de la Sucursal</h2>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="bgImage"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    {form.watch('bgImage') && (
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <img
                          src={form.watch('bgImage')}
                          alt="Store"
                          className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowImageDialog(true)
                          }}
                        />
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowImageDialog(true)
                            }}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" /> View Image
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              try {
                                const imageUrl = form.watch('bgImage')

                                // Realizar una solicitud fetch para obtener la imagen
                                if (!imageUrl) {
                                  throw new Error('Image URL is undefined')
                                }
                                const response = await fetch(imageUrl, {
                                  mode: 'cors'
                                })

                                // Verificar que la respuesta sea exitosa
                                if (!response.ok) {
                                  throw new Error(
                                    'No se pudo descargar la imagen'
                                  )
                                }

                                // Obtener el blob de la imagen
                                const blob = await response.blob()

                                // Crear una URL para el blob
                                const url = window.URL.createObjectURL(blob)

                                // Crear un elemento <a> y simular un clic para descargar el blob
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `${form.watch('slug')}-${Math.random().toString(36).substr(2, 8)}.png`
                                document.body.appendChild(link)
                                link.click()

                                // Limpiar recursos
                                document.body.removeChild(link)
                                window.URL.revokeObjectURL(url)
                              } catch (error) {
                                console.error(
                                  'Error al descargar la imagen:',
                                  error
                                )
                              }
                            }}
                          >
                            <DownloadIcon className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </div>
                      </div>
                    )}
                    <div>
                      <ImageUploadDialog
                        form={form}
                        existingImage={field.value}
                        dialogOpen={imageDialogOpen}
                        setDialogOpen={setImageDialogOpen}
                        title="Imagen de la Sucursal"
                        description="Sube una imagen para tu sucursal"
                      />
                      <FormDescription className="mt-2">
                        Recomendado: 1200x630px o similar ratio
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Image Dialog */}
          {form.watch('bgImage') && (
            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
              <DialogContent className="max-w-[90vw] w-full max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Store Image</DialogTitle>
                </DialogHeader>
                <div className="relative mt-4">
                  <div className="relative overflow-auto">
                    <img
                      src={form.watch('bgImage')}
                      alt="Store"
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={handleZoomIn}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={handleZoomOut}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* General Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Información General</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Sucursal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="sucursal-1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único para URLs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción de la sucursal"
                        className="resize max-h-32 max-w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Información de Contacto</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese la dirección" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Configuración de Moneda</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Currency section - Fixed default values */}
                <FormField
                  control={form.control}
                  name="currency"
                  defaultValue={branchData?.data?.currency as 'CLP' | 'USD'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione moneda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CLP">
                            Peso Chileno (CLP)
                          </SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencySymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Símbolo de Moneda</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours - Full Width */}
          <div className="lg:col-span-2">
            <OpeningHoursForm form={form} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button
            disabled={updateBranchMutation.isPending || !hasChanges}
            type="submit"
          >
            {updateBranchMutation.isPending && (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
