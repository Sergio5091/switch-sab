import { randomUUID } from 'crypto'
import { createLicence, findLicenceById, findAllLicences, updateLicence } from './licence.repository.js'
import { findSalleById, findSalleByMachineId } from '../salles/salle.repository.js'
import { signLicencePayload } from '../../utils/crypto.js'

const buildLicencePayload = ({ licenceId, nomSalle, machineId, issuedAt, expiresAt }) => ({
  licenceId,
  nomSalle,
  machineId,
  issuedAt: issuedAt.toISOString(),
  expiresAt: expiresAt.toISOString(),
})

export const generateLicenceService = async ({ salleId, machineId, validDays }) => {
  let salle

  if (machineId) {
    salle = await findSalleByMachineId(machineId)
    if (!salle) throw new Error(`Aucune salle trouvée pour machineId "${machineId}"`)
  } else {
    salle = await findSalleById(salleId)
    if (!salle) throw new Error('Salle introuvable')
  }

  const issuedAt  = new Date()
  const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
  const licenceId = `LIC-${randomUUID()}`

  const payload   = buildLicencePayload({
    licenceId,
    nomSalle:  salle.nom,
    machineId: salle.machineId,
    issuedAt,
    expiresAt,
  })
  const signature = signLicencePayload(payload)

  return createLicence({
    licenceId,
    nomSalle:  salle.nom,
    machineId: salle.machineId,
    issuedAt,
    expiresAt,
    status:    'ACTIVE',
    signature,
  })
}

export const getLicenceService = async (licenceId) => {
  return findLicenceById(licenceId)
}

export const listLicencesService = async (filters) => {
  return findAllLicences(filters)
}

export const renewLicenceService = async ({ licenceId, validDays }) => {
  const existing = await findLicenceById(licenceId)
  if (!existing) throw new Error('Licence introuvable')
  if (existing.status === 'REVOKED') throw new Error('Impossible de renouveler une licence révoquée')

  await updateLicence(licenceId, { status: 'EXPIRED' })

  const issuedAt  = new Date()
  const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
  const newLicenceId = `LIC-${randomUUID()}`

  const payload   = buildLicencePayload({
    licenceId: newLicenceId,
    nomSalle:  existing.nomSalle,
    machineId: existing.machineId,
    issuedAt,
    expiresAt,
  })
  const signature = signLicencePayload(payload)

  return createLicence({
    licenceId: newLicenceId,
    nomSalle:  existing.nomSalle,
    machineId: existing.machineId,
    issuedAt,
    expiresAt,
    status:    'ACTIVE',
    signature,
  })
}

export const revokeLicenceService = async (licenceId) => {
  const existing = await findLicenceById(licenceId)
  if (!existing) throw new Error('Licence introuvable')
  if (existing.status === 'REVOKED') throw new Error('Licence déjà révoquée')
  return updateLicence(licenceId, { status: 'REVOKED' })
}

export const exportLicenceService = async (licenceId) => {
  const licence = await findLicenceById(licenceId)
  if (!licence) throw new Error('Licence introuvable')
  return {
    licenceId: licence.licenceId,
    nomSalle:  licence.nomSalle,
    machineId: licence.machineId,
    issuedAt:  licence.issuedAt.toISOString(),
    expiresAt: licence.expiresAt.toISOString(),
    status:    licence.status,
    signature: licence.signature,
  }
}
