import { prisma } from '../../services/prismaClient.js'

export const createInstallation = async (data) => {
  return prisma.installation.create({ data })
}

export const findInstallationById = async (id) => {
  return prisma.installation.findUnique({ where: { id: Number(id) } })
}

export const findAllInstallations = async () => {
  return prisma.installation.findMany({ orderBy: { createdAt: 'desc' } })
}

export const updateInstallation = async (id, data) => {
  return prisma.installation.update({ where: { id: Number(id) }, data })
}

export const findInstallationByMachineId = async (machineId) => {
  return prisma.installation.findUnique({ where: { machineId } })
}
