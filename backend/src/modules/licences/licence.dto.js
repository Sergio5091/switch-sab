/**
 * @typedef {Object} GenerateLicenceDto
 * @property {number} salleId
 * @property {number} validDays
 */

/**
 * @typedef {Object} RenewLicenceDto
 * @property {string} licenceId
 * @property {number} validDays
 */

export const validateGenerateLicence = (payload) => {
  return typeof payload === 'object' && payload !== null &&
    typeof payload.salleId === 'number' &&
    Number.isInteger(payload.salleId) &&
    typeof payload.validDays === 'number' &&
    payload.validDays > 0
}

export const validateRenewLicence = (payload) => {
  return typeof payload === 'object' && payload !== null &&
    typeof payload.licenceId === 'string' &&
    payload.licenceId.trim() !== '' &&
    typeof payload.validDays === 'number' &&
    payload.validDays > 0
}
