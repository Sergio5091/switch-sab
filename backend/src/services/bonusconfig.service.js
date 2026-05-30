import { prisma } from './prismaClient.js'

export const getBonusConfigService = async () => {
  const config = await prisma.ConfigBonus.findFirst()
  if (!config) {
    return prisma.ConfigBonus.create({
      data: {
        ratioSecondes: 300,
        seuilDeblocage: 3600,
        validitejours: 30,
        reductionInvite: 20,
        bonusParrain: 10,
      },
    })
  }
  return config
}

export const updateBonusConfigService = async (payload) => {
  const existing = await prisma.ConfigBonus.findFirst()
  if (existing) {
    return prisma.ConfigBonus.update({
      where: { id: existing.id },
      data: payload,
    })
  }
  return prisma.ConfigBonus.create({ data: payload })
}