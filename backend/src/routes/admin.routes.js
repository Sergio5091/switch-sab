import { Router } from 'express'
import { verifyJwt, requireRole } from '../middlewares/auth.middleware.js'
import {
  createCategorie,
  listCategories,
  updateCategorie,
  deleteCategorie,
  createDureePrix,
  listDureesPrix,
  updateDureePrix,
  deleteDureePrix,
  createPoste,
  listPostes,
  updatePoste,
  deletePoste,
  generateCoupons,
  createPromotion,
  listPromotions,
  updatePromotion,
  deletePromotion,
  getBonusConfig,
  updateBonusConfig,
  getPromoConfig,
  updatePromoConfig,
} from '../controllers/admin.controller.js'

const router = Router()
const adminOnly = [verifyJwt, requireRole(['ADMIN'])]

// Catégories
router.post('/categories', ...adminOnly, createCategorie)
router.get('/categories', ...adminOnly, listCategories)
router.patch('/categories/:id', ...adminOnly, updateCategorie)
router.delete('/categories/:id', ...adminOnly, deleteCategorie)

// Durées et Prix
router.post('/durees-prix', ...adminOnly, createDureePrix)
router.get('/durees-prix', ...adminOnly, listDureesPrix)
router.patch('/durees-prix/:id', ...adminOnly, updateDureePrix)
router.delete('/durees-prix/:id', ...adminOnly, deleteDureePrix)

// Postes
router.post('/postes', ...adminOnly, createPoste)
router.get('/postes', ...adminOnly, listPostes)
router.patch('/postes/:id', ...adminOnly, updatePoste)
router.delete('/postes/:id', ...adminOnly, deletePoste)

// Coupons
router.post('/coupons/generate', ...adminOnly, generateCoupons)

// Promotions
router.post('/promotions', ...adminOnly, createPromotion)
router.get('/promotions', ...adminOnly, listPromotions)
router.patch('/promotions/:id', ...adminOnly, updatePromotion)
router.delete('/promotions/:id', ...adminOnly, deletePromotion)

// Configurations
router.get('/bonus-config/:salleId', ...adminOnly, getBonusConfig)
router.patch('/bonus-config/:salleId', ...adminOnly, updateBonusConfig)
router.get('/promo-config/:salleId', ...adminOnly, getPromoConfig)
router.patch('/promo-config/:salleId', ...adminOnly, updatePromoConfig)

export default router