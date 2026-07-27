import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
// Racine du projet backend = deux niveaux au-dessus de src/utils/
const PROJECT_ROOT = path.resolve(__dirname, '..', '..')

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
  // Priorité 2 — fichier local
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8')
  }
  return null
}

const privateKeyPath = process.env.LICENCE_PRIVATE_KEY_PATH || './keys/private-key.pem'
const publicKeyPath  = process.env.LICENCE_PUBLIC_KEY_PATH  || './keys/public-key.pem'

// Résoudre le chemin depuis PROJECT_ROOT (fiable quel que soit le cwd)
const resolveKeyPath = (keyPath) => {
  if (path.isAbsolute(keyPath)) return keyPath
  // Depuis la racine du projet backend
  const fromRoot = path.join(PROJECT_ROOT, keyPath)
  if (fs.existsSync(fromRoot)) return fromRoot
  // Fallback : depuis process.cwd()
  return path.join(process.cwd(), keyPath)
}

const resolvedPrivatePath = resolveKeyPath(privateKeyPath)
const resolvedPublicPath  = resolveKeyPath(publicKeyPath)

console.log('[CRYPTO] PROJECT_ROOT:', PROJECT_ROOT)
console.log('[CRYPTO] private key path:', resolvedPrivatePath, '| exists:', fs.existsSync(resolvedPrivatePath))
console.log('[CRYPTO] public key path:', resolvedPublicPath,  '| exists:', fs.existsSync(resolvedPublicPath))

const privateKey = loadKey('LICENCE_PRIVATE_KEY_PEM', resolvedPrivatePath)
const publicKey  = loadKey('LICENCE_PUBLIC_KEY_PEM',  resolvedPublicPath)

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

// Format pipe-séparé — identique au format de vérification du client
const buildSignatureData = (payload) =>
  `${payload.licenceId}|${payload.nomSalle}|${payload.machineId}|${payload.issuedAt}|${payload.expiresAt}`

export const signLicencePayload = (payload) => {
  const key = getPrivateKey()
  const signer = crypto.createSign('SHA256')
  signer.update(buildSignatureData(payload))
  signer.end()
  return signer.sign(key, 'base64')
}

export const verifyLicencePayload = (payload, signature) => {
  const key = getPublicKey()
  const verifier = crypto.createVerify('SHA256')
  verifier.update(buildSignatureData(payload))
  verifier.end()
  return verifier.verify(key, signature, 'base64')
}
