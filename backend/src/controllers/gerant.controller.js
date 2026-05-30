import {
  createClientService,
  listClientsService,
  updateClientService,
  deleteClientService,
} from '../services/client.service.js'
import {
  createSessionService,
  listSessionsService,
  stopSessionService,
} from '../services/session.service.js'
import {
  createRechargeService,
  listRechargesService,
  validateRechargeService,
} from '../services/recharge.service.js'
import { useCouponService } from '../services/coupon.service.js'

// ─── CLIENTS ─────────────────────────────────────────────
export const createClient = async (req, res) => {
  const { pseudo, phone, enfant, codeEnfant, salleId } = req.body
  if (!pseudo || !phone || !salleId) {
    return res.status(400).json({ success: false, message: 'Pseudo, téléphone et salleId requis' })
  }
  try {
    const client = await createClientService({ pseudo, phone, enfant: enfant || false, codeEnfant, salleId })
    return res.status(201).json({ success: true, client })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// export const listClients = async (req, res) => {
//   const { salleId } = req.query
//   try {
//     const clients = await listClientsService(salleId)
//     return res.json({ success: true, clients })
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message })
//   }
// }

export const listClients = async (req, res) => {
  const { salleId } = req.query
  try {
    const clients = await listClientsService(Number(salleId))
    return res.json({ success: true, clients })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateClient = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  try {
    const client = await updateClientService(Number(id), payload)
    return res.json({ success: true, client })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteClient = async (req, res) => {
  const { id } = req.params
  try {
    await deleteClientService(Number(id))
    return res.json({ success: true, message: 'Client supprimé' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── SESSIONS ─────────────────────────────────────────────
export const createSession = async (req, res) => {
  const { clientId, posteId, dureeAchetee, dureeMinutes, montant, estBonus, salleId } = req.body
  if (!clientId || !posteId || !dureeAchetee || !dureeMinutes || !salleId) {
    return res.status(400).json({ success: false, message: 'Tous les champs requis' })
  }
  try {
    const session = await createSessionService({
      clientId,
      posteId,
      gerantId: req.user.id,
      dureeAchetee,
      dureeMinutes,
      montant: montant || 0,
      estBonus: estBonus || false,
      salleId,
    })
    return res.status(201).json({ success: true, session })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listSessions = async (req, res) => {
  const { salleId } = req.query
  try {
    const sessions = await listSessionsService(Number(salleId))
    return res.json({ success: true, sessions })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const stopSession = async (req, res) => {
  const { id } = req.params
  try {
    const session = await stopSessionService(Number(id))
    return res.json({ success: true, session })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── RECHARGES ─────────────────────────────────────────────
export const createRecharge = async (req, res) => {
  const { clientId, montant, salleId } = req.body
  if (!clientId || !montant || !salleId) {
    return res.status(400).json({ success: false, message: 'clientId, montant et salleId requis' })
  }
  try {
    const recharge = await createRechargeService({ clientId, montant, salleId })
    return res.status(201).json({ success: true, recharge })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listRecharges = async (req, res) => {
  const { salleId } = req.query
  try {
    const recharges = await listRechargesService(Number(salleId))
    return res.json({ success: true, recharges })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const validateRecharge = async (req, res) => {
  const { id } = req.params
  try {
    const recharge = await validateRechargeService(Number(id), req.user.id)
    return res.json({ success: true, recharge })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── COUPONS ─────────────────────────────────────────────
export const useCoupon = async (req, res) => {
  const { code, clientId } = req.body
  if (!code || !clientId) {
    return res.status(400).json({ success: false, message: 'code et clientId requis' })
  }
  try {
    const coupon = await useCouponService(code, clientId)
    return res.json({ success: true, coupon })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}
