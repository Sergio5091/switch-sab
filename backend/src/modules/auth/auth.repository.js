import { prisma } from '../../services/prismaClient.js'

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } })
}

export const findUserById = async (id) => {
  return prisma.user.findUnique({ where: { id: Number(id) } })
}
