import { createSalle, findSalleById, findAllSalles, updateSalle, softDeleteSalle } from './salle.repository.js'

export const createSalleService = async (payload) => {
  console.log('🏢 Service - Création salle avec payload:', JSON.stringify(payload, null, 2))
  return createSalle(payload)
}

export const getSalleByIdService = async (id) => {
  return findSalleById(id)
}

export const getAllSallesService = async () => {
  return findAllSalles()
}

export const updateSalleService = async (id, payload) => {
  return updateSalle(id, payload)
}

export const deleteSalleService = async (id) => {
  return softDeleteSalle(id)
}
