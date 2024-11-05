'use client'

import * as React from 'react'
import { Path, type UseFormReturn } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageIcon, UploadIcon, Trash2Icon } from 'lucide-react'

interface ImageUploadDialogProps<T extends { bgImage?: string | null }> {
  form: UseFormReturn<T>
  existingImage?: string | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onImageUploaded?: (imageUrl: string | null) => void
  title?: string
  description?: string
}

export function ImageUploadDialog<T extends { bgImage?: string | null }>({
  form,
  existingImage,
  dialogOpen,
  setDialogOpen,
  onImageUploaded,
  title = 'Upload an Image',
  description = 'Choose an image to upload'
}: ImageUploadDialogProps<T>) {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [tempImage, setTempImage] = React.useState<string | null>(null)

  // Load existing image if it exists
  React.useEffect(() => {
    if (existingImage) {
      setPreviewImage(existingImage)
    }
  }, [existingImage])

  const handleImageUpload = (file: File) => {
    if (file) {
      setIsUploading(true)
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreviewImage(base64String) // Set preview first
        form.setValue('bgImage' as Path<T>, base64String as any)
        onImageUploaded?.(base64String)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setIsUploading(false)
        toast.error('Failed to load image')
        setSelectedFile(null)
        setPreviewImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const getDisplayName = () => {
    if (isUploading) return 'Uploading...'
    if (selectedFile) return selectedFile.name
    if (previewImage) {
      if (previewImage.startsWith('data:image')) return 'Change Image'
      if (previewImage.includes('supabase.co')) return 'Change Image'
      return 'Current Image'
    }
    return form.getValues('bgImage' as Path<T>)
      ? 'Change Image'
      : 'Upload Image'
  }

  const handleDeleteImage = () => {
    setPreviewImage(null)
    setTempImage(null)
    setSelectedFile(null)
    form.setValue('bgImage' as Path<T>, null as any)
    form.trigger('bgImage' as Path<T>)
    onImageUploaded?.(null)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleImageUpload(file)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ImageIcon className="mr-2 h-4 w-4" />
          <span className="truncate max-w-[200px]">{getDisplayName()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-label="Upload Image">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-full">
            {selectedFile ? (
              <span className="flex items-center">
                <span className="text-sm text-muted-foreground">
                  Selected:{' '}
                </span>
                <span
                  className="ml-1 truncate text-sm"
                  title={selectedFile.name}
                >
                  {selectedFile.name.length > 40
                    ? `${selectedFile.name.slice(0, 40)}...`
                    : selectedFile.name}
                </span>
              </span>
            ) : (
              description
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            className="flex flex-col items-center gap-4"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <AnimatePresence mode="wait">
              {isUploading ? (
                <Skeleton className="w-full h-48 rounded-lg" />
              ) : previewImage ? (
                <motion.img
                  key="preview"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 rounded-lg object-contain bg-secondary"
                  onError={() => {
                    setPreviewImage(null)
                    toast.error('Failed to load image')
                  }}
                />
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <p className="text-gray-500">
                    {isDragging ? 'Drop image here' : 'Drag & drop image here'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 w-full justify-center">
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    handleImageUpload(file)
                  }
                }}
                className="hidden"
                ref={fileInputRef}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Select Image'}
                </Button>
              </motion.div>
              {previewImage && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="destructive" onClick={handleDeleteImage}>
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete Image
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null)
              setPreviewImage(tempImage)
              form.setValue('bgImage' as Path<T>, tempImage as any)
              setDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTempImage(previewImage)
              form.setValue('bgImage' as Path<T>, previewImage ?? (null as any))
              setDialogOpen(false)
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
