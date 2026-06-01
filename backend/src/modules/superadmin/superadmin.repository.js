import { prisma } from '../../services/prismaClient.js'

export const findSuperAdminByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } })
}

export const findSuperAdminById = async (id) => {
  return prisma.user.findUnique({ where: { id: Number(id) } })
}

export const createSuperAdmin = async ({ pseudo, email, telephone, motDePasse }) => {
  return prisma.user.create({
    data: {
      pseudo,
      email,
      telephone,
      motDePasse,
      role: 'SUPERADMIN',
      active: true,
    },
  })
}
