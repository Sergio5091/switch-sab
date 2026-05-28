import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsOptions } from './config/cors.js'
import switchRoutes from './routes/switch.routes.js'
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

// ─── Routes switch (mock + futur vrai switch) ─────────────────────────────────
app.use('/switch', switchRoutes)

// Les autres routes viendront ici
// app.use('/auth', authRoutes)

export default app