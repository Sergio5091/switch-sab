import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsOptions } from './config/cors.js'
import switchRoutes from './routes/switch.routes.js'
import authRoutes from './routes/auth.routes.js'
import superAdminRoutes from './routes/superadmin.routes.js'
import licenceRoutes from './routes/licence.routes.js'
import adminRoutes from './routes/admin.routes.js'
import gerantRoutes from './routes/gerant.routes.js'
import logger from './config/logger.js'

dotenv.config()

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

// Logger chaque requête HTTP
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

app.get('/', (req, res) => {
  res.json({ message: 'Switch SAB API opérationnelle ✅' })
})

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/superadmin', superAdminRoutes)
app.use('/admin', adminRoutes)
app.use('/gerant', gerantRoutes)
app.use('/licences', licenceRoutes)
app.use('/switch', switchRoutes)

// Les autres routes viendront ici

export default app