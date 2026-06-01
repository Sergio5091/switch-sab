/**
 * @typedef {Object} CreateInstallationDto
 * @property {string} machineId
 * @property {string} raspberrySerial
 * @property {string} salleId
 * @property {string} statut
 */

/**
 * @typedef {Object} UpdateInstallationDto
 * @property {string} [machineId]
 * @property {string} [raspberrySerial]
 * @property {string} [statut]
 * @property {string} [dateActivation]
 */

export const validateCreateInstallation = (payload) => {
  const required = ['machineId', 'raspberrySerial', 'salleId', 'statut']
  return required.every((key) => {
    const value = payload[key]
    if (key === 'salleId') {
      return (typeof value === 'string' && value.trim() !== '') || Number.isInteger(value)
    }
    return typeof value === 'string' && value.trim() !== ''
  })
}

export const validateUpdateInstallation = (payload) => {
  return typeof payload === 'object' && payload !== null
}
