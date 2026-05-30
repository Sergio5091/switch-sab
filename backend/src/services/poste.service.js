import { prisma } from './prismaClient.js'

export const createPosteService = async ({ numero, nom, categorieId, typeSwitch, salleId }) => {
  return prisma.Poste.create({
    data: { numero, nom, categorieId: Number(categorieId), typeSwitch: typeSwitch || 'WIFI', salleId: Number(salleId) },
  })
}

export const listPostesService = async (salleId) => {
  return prisma.Poste.findMany({
    where: { salleId: Number(salleId) },
    orderBy: { numero: 'asc' },
  })
}

export const updatePosteService = async (id, payload) => {
  return prisma.Poste.update({
    where: { id: Number(id) },
    data: payload,
  })
}

export const deletePosteService = async (id) => {
  return prisma.Poste.delete({
    where: { id: Number(id) },
  })
}