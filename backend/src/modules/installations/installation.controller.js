import { createInstallationService, getAllInstallationsService, getInstallationByIdService, updateInstallationService } from './installation.service.js'
import { validateCreateInstallation, validateUpdateInstallation } from './installation.dto.js'

export const createInstallation = async (req, res) => {
  if (!validateCreateInstallation(req.body)) {
    return res.status(400).json({ success: false, message: 'Payload d installation invalide' })
  }

  try {
    const installation = await createInstallationService(req.body)
    return res.status(201).json({ success: true, installation })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listInstallations = async (req, res) => {
  try {
    const installations = await getAllInstallationsService()
    return res.json({ success: true, installations })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getInstallation = async (req, res) => {
  try {
    const installation = await getInstallationByIdService(req.params.id)
    if (!installation) {
      return res.status(404).json({ success: false, message: 'Installation introuvable' })
    }
    return res.json({ success: true, installation })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateInstallation = async (req, res) => {
  if (!validateUpdateInstallation(req.body)) {
    return res.status(400).json({ success: false, message: 'Payload de mise à jour invalide' })
  }

  try {
    const installation = await updateInstallationService(req.params.id, req.body)
    return res.json({ success: true, installation })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}
