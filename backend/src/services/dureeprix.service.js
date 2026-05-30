import { prisma } from './prismaClient.js'

export const createDureePrixService = async ({ categorieId, duree, dureeMinutes, prix }) => {
  return prisma.Duree.create({
    data: {
      libelle: duree,
      secondes: Number(dureeMinutes) * 60,
      prix: Number(prix),
      categorieId: Number(categorieId),
    },
  })
}

export const listDureesPrixService = async (salleId) => {
  return prisma.Duree.findMany({
    where: { categorie: { salleId: Number(salleId) } },
    orderBy: { categorie: { nom: 'asc' } },
  })
}

export const updateDureePrixService = async (id, payload) => {
  return prisma.Duree.update({
    where: { id: Number(id) },
    data: payload,
  })
}

export const deleteDureePrixService = async (id) => {
  return prisma.Duree.delete({
    where: { id: Number(id) },
  })
}