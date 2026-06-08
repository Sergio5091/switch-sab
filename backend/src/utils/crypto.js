import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Charge une clé RSA.
 * En production : depuis une variable d'environnement encodée en base64.
 * En local      : depuis un fichier .pem.
 *
 * Pour encoder ta clé en base64 (à faire une seule fois) :
 *   Windows PowerShell :
 *     [Convert]::ToBase64String([IO.File]::ReadAllBytes("backend\keys\private-key.pem"))
 *   Git Bash / Linux :
 *     base64 -w 0 backend/keys/private-key.pem
 */

const loadKey = (envVarBase64, filePath) => {
  // Priorité 1 — variable d'env base64 (production Render)
  if (process.env[envVarBase64]) {
    return Buffer.from(process.env[envVarBase64], 'base64').toString('utf-8')
  }

  // Priorité 2 — fichier local (développement)
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath)

  if (fs.existsSync(resolvedPath)) {
    return fs.readFileSync(resolvedPath, 'utf-8')
  }

  return null
}

const privateKeyPath = process.env.LICENCE_PRIVATE_KEY_PATH || './keys/private-key.pem'
const publicKeyPath  = process.env.LICENCE_PUBLIC_KEY_PATH  || './keys/public-key.pem'

const privateKey = loadKey('LICENCE_PRIVATE_KEY_PEM', privateKeyPath)
const publicKey  = loadKey('LICENCE_PUBLIC_KEY_PEM',  publicKeyPath)

if (!privateKey) console.warn('[CRYPTO] ⚠️  Clé privée introuvable — génération de licence désactivée')
if (!publicKey)  console.warn('[CRYPTO] ⚠️  Clé publique introuvable — vérification de licence désactivée')

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
