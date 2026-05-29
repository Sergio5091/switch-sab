import { prisma } from './prismaClient.js'
import { hashPassword } from './auth.service.js'

export const createSalleService = async ({ nom, pays, ville, quartier, telephone, switchType = 'WIFI', switchConfig = null }) => {
  return prisma.salle.create({
    data: { nom, pays, ville, quartier, telephone, switchType, switchConfig },
  })
}

export const listSallesService = async () => {
  return prisma.salle.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export const updateSalleService = async (salleId, payload) => {
  const data = { ...payload }
  delete data.id
  return prisma.salle.update({
    where: { id: Number(salleId) },
    data,
  })
}

export const disableSalleService = async (salleId) => {
  return prisma.salle.update({
    where: { id: Number(salleId) },
    data: { disabled: true },
  })
}

export const createAdminService = async ({ nom, prenom, email, telephone, motDePasse, salleId }) => {
  const pseudo = email ?? telephone
  const hashedPassword = await hashPassword(motDePasse)
  return prisma.user.create({
    data: {
      pseudo,
      nom,
      prenom,
      email,
      telephone,
      motDePasse: hashedPassword,
      role: 'ADMIN',
      salleId: Number(salleId),
      active: true,
    },
  })
}

export const listAdminsService = async () => {
  return prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
  })
}

export const updateAdminService = async (adminId, payload) => {
  const data = { ...payload }
  if (data.motDePasse) {
    data.motDePasse = await hashPassword(data.motDePasse)
  }
  if (data.nom === undefined) delete data.nom
  if (data.prenom === undefined) delete data.prenom
  if (data.email === undefined) delete data.email
  if (data.telephone === undefined) delete data.telephone
  if (data.active === undefined) delete data.active
  if (data.salleId !== undefined) data.salleId = Number(data.salleId)
  return prisma.user.update({
    where: { id: Number(adminId) },
    data,
  })
}

export const resetSalleService = async (salleId) => {
  const salle = await prisma.salle.findUnique({ where: { id: Number(salleId) } })
  if (!salle) {
    throw new Error('Salle introuvable')
  }

  await prisma.session.deleteMany({
    where: {
      poste: {
        categorie: {
          salleId: Number(salleId),
        },
      },
    },
  })

  await prisma.credit.deleteMany({
    where: {
      categorie: {
        salleId: Number(salleId),
      },
    },
  })

  await prisma.transaction.deleteMany({
    where: {
      client: {
        salleId: Number(salleId),
      },
    },
  })

  await prisma.licence.deleteMany({ where: { salleId: Number(salleId) } })

  return { success: true, message: 'Réinstallation de la salle terminée' }
}
