import { Router } from 'express'
import { login, getCurrentUser } from '../controllers/AuthController.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.get('/me', verifyJwt, getCurrentUser)

export default router
