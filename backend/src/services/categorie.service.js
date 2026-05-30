import { prisma } from './prismaClient.js'

export const createCategorieService = async ({ nom, couleur, salleId }) => {
  return prisma.Categorie.create({
    data: { nom, couleur: couleur || '#3B82F6', salleId: Number(salleId) },
  })
}

export const listCategoriesService = async (salleId) => {
  return prisma.Categorie.findMany({
    where: { salleId: Number(salleId) },
    orderBy: { nom: 'asc' },
    include: { durees: true },
  })
}

export const updateCategorieService = async (id, payload) => {
  return prisma.Categorie.update({
    where: { id: Number(id) },
    data: payload,
  })
}

export const deleteCategorieService = async (id) => {
  return prisma.Categorie.delete({
    where: { id: Number(id) },
  })
}