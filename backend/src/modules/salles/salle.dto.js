/**
 * @typedef {Object} CreateSalleDto
 * @property {string} nom
 * @property {string} proprietaire
 * @property {string} telephone
 * @property {string} pays
 * @property {string} ville
 * @property {string} quartier
 * @property {string} machineId
 */

/**
 * @typedef {Object} UpdateSalleDto
 * @property {string} [nom]
 * @property {string} [proprietaire]
 * @property {string} [telephone]
 * @property {string} [pays]
 * @property {string} [ville]
 * @property {string} [quartier]
 * @property {string} [machineId]
 * @property {boolean} [disabled]
 */

export const validateCreateSalle = (payload) => {
  const required = ['nom', 'telephone', 'pays', 'ville', 'quartier', 'machineId']
  return required.every((key) => typeof payload[key] === 'string' && payload[key].trim() !== '')
}

export const validateUpdateSalle = (payload) => {
  return typeof payload === 'object' && payload !== null
}
