import { Server } from 'socket.io'
import { corsOptions } from './config/cors.js'
import logger from './config/logger.js'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: corsOptions,
  })

  io.on('connection', (socket) => {
    logger.info(`Socket connecté : ${socket.id}`)
    socket.on('disconnect', () => {
      logger.info(`Socket déconnecté : ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io non initialisé')
  return io
}