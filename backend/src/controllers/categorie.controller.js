import { prisma } from './prismaClient.js'

export const categorieService = {
  getAll: async (salleId) => {
    const categories = await prisma.Categorie.findMany({
      where: { salleId: Number(salleId) },
    })
    return categories
  },
  create: async (categorie) => {
    return prisma.Categorie.create({ data: categorie })
  },
  update: async (id, categorie) => {
    return prisma.Categorie.update({ where: { id: Number(id) }, data: categorie })
  },
  delete: async (id) => {
    return prisma.Categorie.delete({ where: { id: Number(id) } })
  },
}