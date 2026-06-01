import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUserByEmail, findUserById } from './auth.repository.js'

const JWT_SECRET = process.env.JWT_SECRET || 'licencemanager_jwt_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const hashPassword = async (password) => bcrypt.hash(password, 10)
export const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

export const loginService = async ({ email, motDePasse }) => {
  const user = await findUserByEmail(email)
  if (!user || !user.active) return null

  const isValid = await comparePassword(motDePasse, user.motDePasse)
  if (!isValid) return null

  const payload = {
    id: user.id,
    role: user.role,
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

  return {
    token,
    role: user.role,
    id: user.id,
  }
}

export const getUserById = async (id) => {
  return findUserById(id)
}
