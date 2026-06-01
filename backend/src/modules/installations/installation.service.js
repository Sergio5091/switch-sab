import { createInstallation, findInstallationById, findAllInstallations, updateInstallation, findInstallationByMachineId } from './installation.repository.js'

export const createInstallationService = async (payload) => {
  const existing = await findInstallationByMachineId(payload.machineId)
  if (existing) {
    throw new Error('Une installation avec ce machineId existe déjà')
  }
  return createInstallation({
    ...payload,
    salleId: Number(payload.salleId),
    dateActivation: payload.dateActivation ? new Date(payload.dateActivation) : new Date(),
  })
}

export const getInstallationByIdService = async (id) => {
  return findInstallationById(id)
}

export const getAllInstallationsService = async () => {
  return findAllInstallations()
}

export const updateInstallationService = async (id, payload) => {
  const data = { ...payload }
  if (data.dateActivation) {
    data.dateActivation = new Date(data.dateActivation)
  }
  return updateInstallation(id, data)
}
