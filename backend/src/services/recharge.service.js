import { prisma } from './prismaClient.js'

export const createRechargeService = async ({ clientId, montant, salleId }) => {
  return prisma.Transaction.create({
    data: {
      clientId: Number(clientId),
      montant: Number(montant),
      type: 'RECHARGE_CLIENT',
      salleId: Number(salleId),
    },
  })
}

export const listRechargesService = async (salleId) => {
  return prisma.Transaction.findMany({
    where: { type: 'RECHARGE_CLIENT', salleId: Number(salleId) },
    orderBy: { date: 'desc' },
    include: { client: true },
  })
}

export const validateRechargeService = async (id, gerantId) => {
  return prisma.Transaction.update({
    where: { id: Number(id) },
    data: { gerantId: Number(gerantId) },
  })
}