import { randomUUID } from 'crypto'
import { createLicence, findLicenceById, findAllLicences, updateLicence } from './licence.repository.js'
import { findSalleById } from '../salles/salle.repository.js'
import { signLicencePayload } from '../../utils/crypto.js'

const buildLicencePayload = ({ licenceId, salleId, machineId, issuedAt, expiresAt }) => ({
  licenceId,
  salleId,
  machineId,
  issuedAt: issuedAt.toISOString(),
  expiresAt: expiresAt.toISOString(),
})

export const generateLicenceService = async ({ salleId, validDays }) => {
  const salle = await findSalleById(salleId)
  if (!salle) {
    throw new Error('Salle introuvable')
  }

  const issuedAt = new Date()
  const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
  const licenceId = `LIC-${randomUUID()}`
  const payload = buildLicencePayload({
    licenceId,
    salleId: salle.id,
    machineId: salle.machineId,
    issuedAt,
    expiresAt,
  })
  const signature = signLicencePayload(payload)

  return createLicence({
    licenceId,
    salleId: salle.id,
    machineId: salle.machineId,
    issuedAt,
    expiresAt,
    status: 'ACTIVE',
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
  if (!existing) {
    throw new Error('Licence introuvable')
  }
  if (existing.status === 'REVOKED') {
    throw new Error('Impossible de renouveler une licence révoquée')
  }

  await updateLicence(licenceId, { status: 'EXPIRED' })

  const issuedAt = new Date()
  const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
  const newLicenceId = `LIC-${randomUUID()}`
  const payload = buildLicencePayload({
    licenceId: newLicenceId,
    salleId: existing.salleId,
    machineId: existing.machineId,
    issuedAt,
    expiresAt,
  })
  const signature = signLicencePayload(payload)

  return createLicence({
    licenceId: newLicenceId,
    salleId: existing.salleId,
    machineId: existing.machineId,
    issuedAt,
    expiresAt,
    status: 'ACTIVE',
    signature,
  })
}

export const revokeLicenceService = async (licenceId) => {
  const existing = await findLicenceById(licenceId)
  if (!existing) {
    throw new Error('Licence introuvable')
  }
  if (existing.status === 'REVOKED') {
    throw new Error('Licence déjà révoquée')
  }
  return updateLicence(licenceId, { status: 'REVOKED' })
}

export const exportLicenceService = async (licenceId) => {
  const licence = await findLicenceById(licenceId)
  if (!licence) {
    throw new Error('Licence introuvable')
  }
  return {
    licenceId: licence.licenceId,
    salleId: licence.salleId,
    machineId: licence.machineId,
    issuedAt: licence.issuedAt.toISOString(),
    expiresAt: licence.expiresAt.toISOString(),
    status: licence.status,
    signature: licence.signature,
  }
}
