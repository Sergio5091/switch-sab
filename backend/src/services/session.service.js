import { prisma } from './prismaClient.js'

export const createSessionService = async ({ clientId, posteId, gerantId, dureeAchetee, dureeMinutes, montant, estBonus, salleId }) => {
  return prisma.Session.create({
    data: {
      clientId: Number(clientId),
      posteId: Number(posteId),
      gerantId: Number(gerantId),
      dureeId: 1, // à calculer selon la durée
      debut: new Date(),
      fin: new Date(Date.now() + dureeMinutes * 60000),
      tempsRestant: dureeMinutes * 60,
      statut: 'ACTIVE',
      estBonus: estBonus || false,
    },
  })
}

export const listSessionsService = async (salleId) => {
  return prisma.Session.findMany({
    where: { salleId: Number(salleId) },
    orderBy: { debut: 'desc' },
    include: { client: true, poste: true },
  })
}

export const stopSessionService = async (id) => {
  const session = await prisma.Session.findUnique({ where: { id: Number(id) } })
  if (!session) throw new Error('Session introuvable')
  return prisma.Session.update({
    where: { id: Number(id) },
    data: { statut: 'ARRETEE', fin: new Date(), tempsRestant: 0 },
  })
}