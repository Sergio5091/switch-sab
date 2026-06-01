import { prisma } from '../../services/prismaClient.js'

export const createSalle = async (data) => {
  return prisma.salle.create({ data })
}

export const findSalleById = async (id) => {
  return prisma.salle.findUnique({ where: { id: Number(id) } })
}

export const findAllSalles = async () => {
  return prisma.salle.findMany({ where: { disabled: false }, orderBy: { createdAt: 'desc' } })
}

export const updateSalle = async (id, data) => {
  return prisma.salle.update({ where: { id: Number(id) }, data })
}

export const softDeleteSalle = async (id) => {
  return prisma.salle.update({ where: { id: Number(id) }, data: { disabled: true } })
}
