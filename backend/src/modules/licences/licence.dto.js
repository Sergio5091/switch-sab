/**
 * @typedef {Object} GenerateLicenceDto
 * @property {number} [salleId]   - id de la salle (optionnel si machineId fourni)
 * @property {string} [machineId] - identifiant machine (optionnel si salleId fourni)
 * @property {number} validDays
 */

/**
 * @typedef {Object} RenewLicenceDto
 * @property {string} licenceId
 * @property {number} validDays
 */

export const validateGenerateLicence = (payload) => {
  if (typeof payload !== 'object' || payload === null) return false
  if (typeof payload.validDays !== 'number' || payload.validDays <= 0) return false
  // salleId OU machineId doit être présent
  const hasSalleId   = Number.isInteger(payload.salleId) && payload.salleId > 0
  const hasMachineId = typeof payload.machineId === 'string' && payload.machineId.trim() !== ''
  return hasSalleId || hasMachineId
}

export const validateRenewLicence = (payload) => {
  return typeof payload === 'object' && payload !== null &&
    typeof payload.licenceId === 'string' &&
    payload.licenceId.trim() !== '' &&
    typeof payload.validDays === 'number' &&
    payload.validDays > 0
}
