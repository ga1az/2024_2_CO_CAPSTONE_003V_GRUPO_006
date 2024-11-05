import { createClient } from '@supabase/supabase-js'
import { env } from '../../env'

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

const removeDataImagePrefix = (base64RemovePrefix: string): string => {
  return base64RemovePrefix.replace(/^data:image\/(png|jpeg);base64,/i, '')
}

const getFileExtension = (base64: string): string => {
  const match = base64.match(/^data:image\/(png|jpeg);base64,/i)
  return match ? match[1] : 'png' // default to png if no match
}

export const uploadBase64 = async (
  base64: string,
  name: string
): Promise<string> => {
  const base64StringWithoutPrefix = removeDataImagePrefix(base64)

  const buffer = Buffer.from(base64StringWithoutPrefix, 'base64')

  const fileExtension = getFileExtension(base64)
  const filePath = `${name}.${fileExtension}`

  try {
    const isExists = await supabase.storage.from('mesalista').exists(filePath)

    if (isExists.data) {
      await supabase.storage.from('mesalista').remove([filePath])
    }

    await supabase.storage.from('mesalista').upload(filePath, buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: `image/${fileExtension}`
    })

    const { data } = await supabase.storage
      .from('mesalista')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.log('Error uploading base64:', error)
    throw error
  }
}
