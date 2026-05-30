import { prisma } from './prismaClient.js'

export const createPromotionService = async ({ salleId, texte }) => {
  return prisma.Promo.create({
    data: { titre: 'Promotion', message: texte, salleId: Number(salleId) },
  })
}

export const listPromotionsService = async (salleId) => {
  return prisma.Promo.findMany({
    where: { salleId: Number(salleId) },
    orderBy: { createdAt: 'desc' },
  })
}

export const updatePromotionService = async (id, payload) => {
  return prisma.Promo.update({
    where: { id: Number(id) },
    data: payload,
  })
}

export const deletePromotionService = async (id) => {
  return prisma.Promo.delete({
    where: { id: Number(id) },
  })
}