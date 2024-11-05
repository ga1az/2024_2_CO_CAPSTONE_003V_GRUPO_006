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
import { QRCode } from '@/components/qr-code'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { createQr, getQr, getTableById, updateQr } from '../_lib/action'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useTableQRModal from '../_lib/use-open-qr-modal'
import { ImageUploadDialog } from '@/components/forms/image-upload-dialog'

const formSchema = z.object({
  fgColor: z.string().optional()
  // hideLogo: z.boolean().optional(),
  // bgImage: z.string().optional()
})

export default function CreateQRForm() {
  const qrModal = useTableQRModal()
  const queryClient = useQueryClient()
  const { data: qrData, isLoading } = useQuery({
    queryKey: ['qr'],
    queryFn: () => getQr()
  })

  const { data: tableData, isLoading: tableIsLoading } = useQuery({
    queryKey: ['table'],
    queryFn: () => getTableById(qrModal.tableId)
  })
  // const [dialogOpen, setDialogOpen] = React.useState(false)
  // const [previewImage, setPreviewImage] = React.useState<string | null>(
  //   qrData?.data?.logo ?? null
  // )
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fgColor: qrData?.data?.fgColor ?? '#000000'
      // hideLogo: qrData?.data?.hideLogo ?? true,
      // bgImage: qrData?.data?.logo ?? ''
    }
  })

  const createQrMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => createQr(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr'] })
      toast.success('QR creado correctamente')
      qrModal.onClose()
    }
  })

  const updateQrMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      updateQr(values, qrData?.data?.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr'] })
      toast.success('QR actualizado correctamente')
      qrModal.onClose()
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (qrData?.data?.id) {
      updateQrMutation.mutate(values)
    } else {
      createQrMutation.mutate(values)
    }
  }
  const formValues = form.watch()
  // const bgImageValue = form.watch('bgImage')
  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const urlValue = `http://localhost:4000/public/session/id/${qrModal.qrCode}`
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-center flex-col items-center">
          <p className="text-sm text-muted-foreground font-bold underline">
            <a href={urlValue} target="_blank" rel="noreferrer">
              Vista previa del QR
            </a>
          </p>
          <div className="border w-full p-3 rounded-lg flex justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#2f2f2f_1px,transparent_1px)] bg-[length:16px_16px]">
            <QRCode url={urlValue} {...formValues} />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="fgColor"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Color del QR</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Input
                      {...field}
                      type="color"
                      className="w-14 h-14 p-1 cursor-pointer rounded-lg"
                    />
                    <Input
                      {...field}
                      type="text"
                      placeholder="#000000"
                      className="uppercase flex-1"
                      onChange={(e) => {
                        const value = e.target.value.startsWith('#')
                          ? e.target.value
                          : `#${e.target.value}`
                        field.onChange(value)
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>Color del código QR</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="bgImage"
            render={({ field: { value, ...field } }) => (
              <FormItem className="space-y-2">
                <FormLabel>Logo del QR</FormLabel>
                <FormControl>
                  <ImageUploadDialog
                    form={form}
                    existingImage={qrData?.data?.logo}
                    dialogOpen={dialogOpen}
                    setDialogOpen={setDialogOpen}
                    title="Upload QR Image"
                    description="Choose an image for the QR"
                    onImageUploaded={(imageUrl) => {
                      if (imageUrl !== qrData?.data?.logo) {
                        setPreviewImage(imageUrl)
                        if (imageUrl && imageUrl.startsWith('data:image')) {
                          form.setValue('bgImage', imageUrl)
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Sube un logo para personalizar tu QR
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {bgImageValue && (
            <FormField
              control={form.control}
              name="hideLogo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <div className="flex items-center gap-5">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ocultar Logo</FormLabel>
                      <FormDescription>
                        Marcar para ocultar el logo en el QR
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          )} */}
        </div>
        {tableData?.data?.tmpCode && (
          <div
            className="flex w-full justify-center border p-3 rounded-lg cursor-pointer flex-col items-center gap-4 group"
            onClick={() => {
              navigator.clipboard.writeText(tableData?.data?.tmpCode ?? '')
              toast.success('Código de invitación copiado al portapapeles')
            }}
          >
            <p className="text-md font-bold">Código de invitación activo:</p>
            <p className="text-md font-bold font-mono tracking-widest group-hover:text-green-600 transition-all duration-300">
              {tableData?.data?.tmpCode}
            </p>
          </div>
        )}
        <div className="flex w-full gap-2">
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </div>
      </form>
      <div className="flex w-full">
        <Button
          variant="outline"
          onClick={() => qrModal.onClose()}
          className="w-full"
        >
          Cancelar
        </Button>
      </div>
    </Form>
  )
}
