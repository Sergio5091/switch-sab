import { createServer } from 'http'
import app from './src/index.js'
import { initSocket } from './src/socket.js'
import logger from './src/config/logger.js'

const httpServer = createServer(app)

const io = initSocket(httpServer)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`)
  logger.info(`Environnement : ${process.env.NODE_ENV || 'development'}`)
})

export { io }