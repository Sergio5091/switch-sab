import { Router } from 'express'
import { verifyJwt, requireRole } from '../middlewares/auth.middleware.js'
import {
  createClient,
  listClients,
  updateClient,
  deleteClient,
  createSession,
  listSessions,
  stopSession,
  createRecharge,
  listRecharges,
  validateRecharge,
  useCoupon,
} from '../controllers/gerant.controller.js'

const router = Router()
const gerantOnly = [verifyJwt, requireRole(['GERANT'])]

// CLIENTS
router.post('/clients', ...gerantOnly, createClient)
router.get('/clients', ...gerantOnly, listClients)
router.put('/clients/:id', ...gerantOnly, updateClient)
router.delete('/clients/:id', ...gerantOnly, deleteClient)

// SESSIONS
router.post('/sessions', ...gerantOnly, createSession)
router.get('/sessions', ...gerantOnly, listSessions)
router.post('/sessions/:id/stop', ...gerantOnly, stopSession)

// RECHARGES
router.post('/recharges', ...gerantOnly, createRecharge)
router.get('/recharges', ...gerantOnly, listRecharges)
router.post('/recharges/:id/validate', ...gerantOnly, validateRecharge)

// COUPONS
router.post('/coupons/use', ...gerantOnly, useCoupon)

export default router