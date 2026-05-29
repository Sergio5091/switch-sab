import crypto from 'crypto'

const LICENCE_SECRET = process.env.LICENCE_SECRET || process.env.JWT_SECRET || 'switchsab_licence_secret'
const REQUEST_ALPHABET = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'

export const generateRequestCode = (length = 12) => {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * REQUEST_ALPHABET.length)
    code += REQUEST_ALPHABET[index]
  }
  return code
}

const buildSignaturePayload = (requestCode, salleId, expiresAtSeconds) => {
  return `${requestCode}|${salleId}|${expiresAtSeconds}`
}

export const createLicenceCode = ({ requestCode, salleId, expiresAt }) => {
  const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000)
  const payload = buildSignaturePayload(requestCode, salleId, expiresAtSeconds)
  const signature = crypto.createHmac('sha256', LICENCE_SECRET).update(payload).digest('hex')
  return `${requestCode}-${salleId}-${expiresAtSeconds}-${signature}`
}

export const parseLicenceCode = (licenceCode) => {
  if (typeof licenceCode !== 'string') {
    throw new Error('Licence invalide : format attendu string')
  }
  const parts = licenceCode.split('-')
  if (parts.length !== 4) {
    throw new Error('Licence invalide : format incorrect')
  }

  const [requestCode, salleIdRaw, expiresAtRaw, signature] = parts
  const salleId = Number(salleIdRaw)
  const expiresAtSeconds = Number(expiresAtRaw)

  if (!requestCode || Number.isNaN(salleId) || Number.isNaN(expiresAtSeconds) || !signature) {
    throw new Error('Licence invalide : valeurs manquantes')
  }

  const expiresAt = new Date(expiresAtSeconds * 1000)
  return { requestCode, salleId, expiresAt, signature }
}

export const verifyLicenceCode = (licenceCode) => {
  const { requestCode, salleId, expiresAt, signature } = parseLicenceCode(licenceCode)
  const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000)
  const payload = buildSignaturePayload(requestCode, salleId, expiresAtSeconds)
  const expected = crypto.createHmac('sha256', LICENCE_SECRET).update(payload).digest('hex')
  return expected === signature
}
