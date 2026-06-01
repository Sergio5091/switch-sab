import { prisma } from '../../services/prismaClient.js'

export const createLicence = async (data) => {
  return prisma.licence.create({ data })
}

export const findLicenceById = async (id) => {
  return prisma.licence.findUnique({ where: { licenceId: String(id) } })
}

export const findLicenceByDatabaseId = async (id) => {
  return prisma.licence.findUnique({ where: { id: Number(id) } })
}

export const findAllLicences = async (filters = {}) => {
  const where = {}
  if (filters.salleId) where.salleId = Number(filters.salleId)
  return prisma.licence.findMany({ where, orderBy: { issuedAt: 'desc' } })
}

export const updateLicence = async (licenceId, data) => {
  return prisma.licence.update({ where: { licenceId }, data })
}

export const markLicenceExpired = async (licenceId) => {
  return updateLicence(licenceId, { status: 'EXPIRED' })
}
