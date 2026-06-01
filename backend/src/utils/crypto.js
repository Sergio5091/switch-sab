import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const privateKeyPath = process.env.LICENCE_PRIVATE_KEY_PATH || path.join(process.cwd(), 'private.key')
const publicKeyPath = process.env.LICENCE_PUBLIC_KEY_PATH || path.join(process.cwd(), 'public.key')

console.log('PrivateKey', privateKeyPath)
console.log('PublicKey', publicKeyPath)

let privateKey
let publicKey

try {
  if (fs.existsSync(privateKeyPath)) {
    privateKey = fs.readFileSync(privateKeyPath, 'utf-8')
  }
  if (fs.existsSync(publicKeyPath)) {
    publicKey = fs.readFileSync(publicKeyPath, 'utf-8')
  }
} catch (error) {
  console.warn('Impossible de charger les clés de licence:', error.message)
}

export const getPrivateKey = () => {
  if (!privateKey) throw new Error('Clé privée de licence introuvable')
  return privateKey
}

export const getPublicKey = () => {
  if (!publicKey) throw new Error('Clé publique de licence introuvable')
  return publicKey
}

export const signLicencePayload = (payload) => {
  const key = getPrivateKey()
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(JSON.stringify(payload))
  signer.end()
  return signer.sign(key, 'base64')
}

export const verifyLicencePayload = (payload, signature) => {
  const key = getPublicKey()
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(JSON.stringify(payload))
  verifier.end()
  return verifier.verify(key, signature, 'base64')
}
