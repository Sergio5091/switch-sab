import { activateLicenceService, getLicenceStatusService } from '../services/licence.service.js'

// ─── LICENCES ─────────────────────────────────────────────
export const activateLicence = async (req, res) => {
  const { code } = req.body
  const clientId = req.user.id

  if (!code) {
    return res.status(400).json({ success: false, message: 'code requis' })
  }

  try {
    const licence = await activateLicenceService(code, clientId)
    return res.json({ success: true, licence })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const getLicenceStatus = async (req, res) => {
  const clientId = req.user.id

  try {
    const status = await getLicenceStatusService(clientId)
    return res.json({ success: true, status })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
