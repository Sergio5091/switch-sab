import { Router } from 'express'
import { verifyJwt, requireRole } from '../../middlewares/auth.middleware.js'
import { createInstallation, listInstallations, getInstallation, updateInstallation } from './installation.controller.js'

const router = Router()
const superAdminOnly = [verifyJwt, requireRole(['SUPERADMIN'])]

router.get('/', ...superAdminOnly, listInstallations)
router.post('/', ...superAdminOnly, createInstallation)
router.get('/:id', ...superAdminOnly, getInstallation)
router.patch('/:id', ...superAdminOnly, updateInstallation)

export default router
