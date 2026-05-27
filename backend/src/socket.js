import { Server } from 'socket.io'
import { corsOptions } from './config/cors.js'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: corsOptions,
  })

  io.on('connection', (socket) => {
    console.log(`Client connecté : ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`Client déconnecté : ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io non initialisé')
  return io
}