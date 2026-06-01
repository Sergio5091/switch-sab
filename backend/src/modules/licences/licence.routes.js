import { Router } from 'express'
import { verifyJwt, requireRole } from '../../middlewares/auth.middleware.js'
import { listLicences, getLicence, generateLicence, renewLicence, revokeLicence, exportLicence } from './licence.controller.js'

const router = Router()
const superAdminOnly = [verifyJwt, requireRole(['SUPERADMIN'])]

router.get('/', ...superAdminOnly, listLicences)
router.post('/generer', ...superAdminOnly, generateLicence)
router.post('/renouveler', ...superAdminOnly, renewLicence)
router.post('/revoquer/:id', ...superAdminOnly, revokeLicence)
router.get('/:id/export', ...superAdminOnly, exportLicence)
router.get('/:id', ...superAdminOnly, getLicence)

export default router
