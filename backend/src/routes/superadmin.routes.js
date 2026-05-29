import { Router } from 'express'
import { verifyJwt, requireRole } from '../middlewares/auth.middleware.js'
import {
  createSalle,
  listSalles,
  updateSalle,
  deleteSalle,
  generateLicence,
  createAdmin,
  listAdmins,
  updateAdmin,
  resetSalle,
} from '../controllers/superadmin.controller.js'
import { changePassword } from '../controllers/AuthController.js'

const router = Router()
const superadminOnly = [verifyJwt, requireRole(['SUPERADMIN'])]

router.post('/salles', ...superadminOnly, createSalle)
router.get('/salles', ...superadminOnly, listSalles)
router.patch('/salles/:id', ...superadminOnly, updateSalle)
router.delete('/salles/:id', ...superadminOnly, deleteSalle)
router.post('/salles/:id/reset', ...superadminOnly, resetSalle)
router.patch('/password', ...superadminOnly, changePassword)
router.post('/licences/generer', ...superadminOnly, generateLicence)
router.post('/admins', ...superadminOnly, createAdmin)
router.get('/admins', ...superadminOnly, listAdmins)
router.patch('/admins/:id', ...superadminOnly, updateAdmin)

export default router
