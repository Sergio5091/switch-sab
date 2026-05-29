import { activateLicenceService, getLicenceStatusService } from '../services/licence.service.js'

export const activateLicence = async (req, res) => {
  const { licenceCode } = req.body
  if (!licenceCode) {
    return res.status(400).json({ success: false, message: 'Licence requise' })
  }

  try {
    const licence = await activateLicenceService({
      licenceCode,
      userSalleId: req.user.salle_id,
      userRole: req.user.role,
    })
    return res.status(200).json({ success: true, licence })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const getLicenceStatus = async (req, res) => {
  try {
    const status = await getLicenceStatusService({ salleId: req.user.salle_id })
    return res.json({ success: true, status })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
