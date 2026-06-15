/**
 * Configuration CORS centralisée.
 * Utilisée par Express (middleware cors).
 */

const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

// Origines par défaut en dev (5173 et 5174 car Vite peut choisir l'un ou l'autre)
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174']

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins

export const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: Postman, curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`Origin ${origin} non autorisée par CORS`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}
