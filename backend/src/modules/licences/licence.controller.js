import { generateLicenceService, listLicencesService, getLicenceService, renewLicenceService, revokeLicenceService, exportLicenceService } from './licence.service.js'
import { validateGenerateLicence, validateRenewLicence } from './licence.dto.js'

export const listLicences = async (req, res) => {
  try {
    const licences = await listLicencesService(req.query)
    return res.json({ success: true, licences })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getLicence = async (req, res) => {
  try {
    const licence = await getLicenceService(req.params.id)
    if (!licence) {
      return res.status(404).json({ success: false, message: 'Licence introuvable' })
    }
    return res.json({ success: true, licence })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const generateLicence = async (req, res) => {
  if (!validateGenerateLicence(req.body)) {
    return res.status(400).json({ success: false, message: 'Payload de génération invalide' })
  }

  try {
    const licence = await generateLicenceService(req.body)
    return res.status(201).json({ success: true, licence })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const renewLicence = async (req, res) => {
  if (!validateRenewLicence(req.body)) {
    return res.status(400).json({ success: false, message: 'Payload de renouvellement invalide' })
  }

  try {
    const licence = await renewLicenceService(req.body)
    return res.json({ success: true, licence })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const revokeLicence = async (req, res) => {
  try {
    const licence = await revokeLicenceService(req.params.id)
    return res.json({ success: true, licence })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const exportLicence = async (req, res) => {
  try {
    const licence = await exportLicenceService(req.params.id)
    res.setHeader('Content-Disposition', 'attachment; filename="licence.json"')
    res.setHeader('Content-Type', 'application/json')
    return res.send(JSON.stringify(licence, null, 2))
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message })
  }
}
