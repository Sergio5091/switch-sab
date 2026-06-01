import { createSalle, findSalleById, findAllSalles, updateSalle, softDeleteSalle } from './salle.repository.js'

export const createSalleService = async (payload) => {
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
