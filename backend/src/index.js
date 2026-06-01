import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsOptions } from './config/cors.js'
import authRoutes from './modules/auth/auth.routes.js'
import salleRoutes from './modules/salles/salle.routes.js'
import licenceRoutes from './modules/licences/licence.routes.js'
import superAdminRoutes from './modules/superadmin/superadmin.routes.js'
import logger from './config/logger.js'

dotenv.config()

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

app.get('/', (req, res) => {
  res.json({ message: 'Licence Manager API opérationnelle ✅' })
})

app.use('/auth', authRoutes)
app.use('/salles', salleRoutes)
app.use('/licences', licenceRoutes)
app.use('/superadmin', superAdminRoutes)

export default app
