import { prisma } from '../../services/prismaClient.js'

export const createSalle = async (data) => {
  return prisma.salle.create({ data })
}

export const findSalleById = async (id) => {
  return prisma.salle.findUnique({ where: { id: Number(id) } })
}

export const findSalleByMachineId = async (machineId) => {
  return prisma.salle.findUnique({ where: { machineId } })
}


export const findAllSalles = async () => {
  return prisma.salle.findMany({ where: { disabled: false }, orderBy: { createdAt: 'desc' } })
}

export const updateSalle = async (id, data) => {
  return prisma.salle.update({ where: { id: Number(id) }, data })
}

export const hardDeleteSalle = async (id) => {
  // Supprime d'abord les licences liées par machineId
  const salle = await prisma.salle.findUnique({ where: { id: Number(id) } })
  if (salle) {
    await prisma.licence.deleteMany({ where: { machineId: salle.machineId } })
  }
  return prisma.salle.delete({ where: { id: Number(id) } })
}
