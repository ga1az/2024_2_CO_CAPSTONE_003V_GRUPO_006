import * as crypto from 'crypto'
import { env } from '../../env'

// Secret key generation (should be stored securely and not hardcoded)
const secretKey = crypto
  .createHash('sha256')
  .update(String(env.SECRET))
  .digest('base64')
  .substring(0, 32)

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16) // Initialization vector
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    iv
  )
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  // Return the IV and encrypted data as a combined string
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(encryptedData: string): string {
  const textParts = encryptedData.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    iv
  )
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ])
  return decrypted.toString('utf8')
}

export function encryptJSON<T>(data: T): string {
  const jsonString = JSON.stringify(data)
  return encrypt(jsonString)
}

export function decryptJSON<T>(encryptedData: string): T {
  const jsonString = decrypt(encryptedData)
  return JSON.parse(jsonString) as T
}

// const originalJSON = { name: 'John', age: 30 }
// const encryptedJSON = encryptJSON(originalJSON)
// const decryptedJSON = decryptJSON(encryptedJSON)

// console.log('Original JSON:', originalJSON)
// console.log('Encrypted JSON:', encryptedJSON)
// console.log('Decrypted JSON:', decryptedJSON)
