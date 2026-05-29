import jwt from 'jsonwebtoken'
import { prisma } from '../services/prismaClient.js'

const JWT_SECRET = process.env.JWT_SECRET || 'switchsab_jwt_secret'

export const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant ou format invalide' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable ou désactivé' })
    }

    req.user = {
      id: user.id,
      role: user.role,
      salle_id: user.salleId ?? null,
    }

    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' })
  }
}

export const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Accès refusé' })
  }
  next()
}