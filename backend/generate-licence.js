/**
 * Script de génération de licence pour un machineId donné.
 * Usage : node generate-licence.js <machineId> [validDays]
 * Exemple : node generate-licence.js 1197637109c1de39 365
 */

import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import { randomUUID } from 'crypto'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { readFileSync } from 'fs'

// --- Chargement manuel du .env (même pattern que seed.js) ---
const envFile = readFileSync(path.join(process.cwd(), '.env'), 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=')
    if (idx > -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
    }
  }
})

const MACHINE_ID = process.argv[2]
const VALID_DAYS  = parseInt(process.argv[3] ?? '365', 10)

if (!MACHINE_ID) {
  console.error('Usage : node generate-licence.js <machineId> [validDays]')
  process.exit(1)
}

// --- Chargement de la clé privée ---
const loadPrivateKey = () => {
  if (env.LICENCE_PRIVATE_KEY_PEM) {
    return Buffer.from(env.LICENCE_PRIVATE_KEY_PEM, 'base64').toString('utf-8')
  }
  const keyPath = path.resolve(process.cwd(), env.LICENCE_PRIVATE_KEY_PATH || './keys/private-key.pem')
  if (fs.existsSync(keyPath)) return fs.readFileSync(keyPath, 'utf-8')
  throw new Error(`Clé privée introuvable : ${keyPath}`)
}

const signPayload = (payload) => {
  const key = loadPrivateKey()
  // Format pipe-séparé — identique au format de vérification du client
  const data = `${payload.licenceId}|${payload.salleId}|${payload.machineId}|${payload.issuedAt}|${payload.expiresAt}`
  const signer = crypto.createSign('SHA256')
  signer.update(data)
  signer.end()
  return signer.sign(key, 'base64')
}

// --- Prisma avec driver adapter (même config que le projet) ---
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

try {
  // 1. Trouver ou créer la salle par machineId
  let salle = await prisma.salle.findUnique({ where: { machineId: MACHINE_ID } })
  if (!salle) {
    console.log(`ℹ️   Aucune salle trouvée pour machineId "${MACHINE_ID}", création automatique...`)
    salle = await prisma.salle.create({
      data: {
        nom:          'Salle Switch',
        proprietaire: null,
        telephone:    '+00000000000',
        pays:         'Bénin',
        ville:        'Cotonou',
        quartier:     'Centre',
        machineId:    MACHINE_ID,
      },
    })
    console.log(`✅  Salle créée : [${salle.id}] ${salle.nom}`)
  } else {
    console.log(`✅  Salle trouvée : [${salle.id}] ${salle.nom} — ${salle.ville}, ${salle.pays}`)
  }

  // 2. Construire le payload
  const licenceId = `LIC-${randomUUID()}`
  const issuedAt  = new Date()
  const expiresAt = new Date(Date.now() + VALID_DAYS * 24 * 60 * 60 * 1000)

  const payload = {
    licenceId,
    salleId:   salle.id,
    machineId: MACHINE_ID,
    issuedAt:  issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  // 3. Signer
  const signature = signPayload(payload)

  // 4. Persister en base
  const licence = await prisma.licence.create({
    data: {
      licenceId,
      salleId:   salle.id,
      machineId: MACHINE_ID,
      issuedAt,
      expiresAt,
      status:    'ACTIVE',
      signature,
    },
  })

  console.log('\n🎉  Licence générée avec succès !')
  console.log('─'.repeat(60))
  console.log(JSON.stringify({
    licenceId:  licence.licenceId,
    salleId:    licence.salleId,
    machineId:  licence.machineId,
    issuedAt:   licence.issuedAt.toISOString(),
    expiresAt:  licence.expiresAt.toISOString(),
    status:     licence.status,
    signature:  licence.signature,
  }, null, 2))
  console.log('─'.repeat(60))
} finally {
  await prisma.$disconnect()
}
