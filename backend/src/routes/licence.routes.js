import { Router } from 'express'
import { verifyJwt, requireRole } from '../middlewares/auth.middleware.js'
import { activateLicence, getLicenceStatus } from '../controllers/licence.controller.js'

const router = Router()

router.post('/activer', verifyJwt, requireRole(['ADMIN', 'SUPERADMIN']), activateLicence)
router.get('/statut', verifyJwt, getLicenceStatus)

export default router
