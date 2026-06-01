import { Router } from 'express'
import { verifyJwt, requireRole } from '../../middlewares/auth.middleware.js'
import { createSalle, listSalles, getSalle, updateSalle, deleteSalle } from './salle.controller.js'

const router = Router()
const superAdminOnly = [verifyJwt, requireRole(['SUPERADMIN'])]

router.get('/', ...superAdminOnly, listSalles)
router.post('/', ...superAdminOnly, createSalle)
router.get('/:id', ...superAdminOnly, getSalle)
router.patch('/:id', ...superAdminOnly, updateSalle)
router.delete('/:id', ...superAdminOnly, deleteSalle)

export default router
