import { Router } from 'express'
import { verifyJwt, requireRole } from '../../middlewares/auth.middleware.js'
import { getSuperAdminInfo } from './superadmin.controller.js'

const router = Router()

router.get('/me', verifyJwt, requireRole(['SUPERADMIN']), getSuperAdminInfo)

export default router
