import { prisma } from './prismaClient.js'
import { hashPassword } from './auth.service.js'

export const createClientService = async ({ pseudo, phone, enfant, codeEnfant, salleId }) => {
  const hashedPassword = codeEnfant ? await hashPassword(codeEnfant) : await hashPassword('client123')
  return prisma.User.create({
    data: {
      pseudo,
      telephone: phone,
      email: `${phone}@client.local`,
      motDePasse: hashedPassword,
      role: 'CLIENT',
      estEnfant: enfant || false,
      salleId: Number(salleId),
    },
  })
}

export const listClientsService = async (salleId) => {
  return prisma.User.findMany({
    where: { role: 'CLIENT', salleId: Number(salleId) },
    orderBy: { pseudo: 'asc' },
  })
}

export const updateClientService = async (id, payload) => {
  return prisma.User.update({
    where: { id: Number(id) },
    data: payload,
  })
}

export const deleteClientService = async (id) => {
  return prisma.User.delete({
    where: { id: Number(id) },
  })
}