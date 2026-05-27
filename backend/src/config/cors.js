/**
 * Configuration CORS centralisée.
 * Utilisée par Express (middleware cors) et Socket.io.
 */

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

export const corsOptions = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}
