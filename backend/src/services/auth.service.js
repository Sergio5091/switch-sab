import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prismaClient.js'

const JWT_SECRET = process.env.JWT_SECRET || 'switchsab_jwt_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10)
}

export const comparePassword = async (password, hashed) => {
  return bcrypt.compare(password, hashed)
}

export const loginService = async ({ email, motDePasse }) => {
  const user = await prisma.User.findUnique({
    where: { email },
  })
  if (!user || !user.active) {
    return null
  }

  const isValid = await comparePassword(motDePasse, user.motDePasse)
  if (!isValid) {
    return null
  }

  const payload = {
    id: user.id,
    role: user.role,
    salle_id: user.salleId ?? null,
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

  return {
    token,
    role: user.role,
    id: user.id,
  }
}

export const changePasswordService = async ({ userId, currentPassword, newPassword }) => {
  const user = await prisma.User.findUnique({ where: { id: userId } })
  if (!user) {
    throw new Error('Utilisateur introuvable')
  }

  const match = await comparePassword(currentPassword, user.motDePasse)
  if (!match) {
    throw new Error('Mot de passe actuel incorrect')
  }

  const motDePasse = await hashPassword(newPassword)
  await prisma.User.update({
    where: { id: userId },
    data: { motDePasse },
  })
  return true
}
