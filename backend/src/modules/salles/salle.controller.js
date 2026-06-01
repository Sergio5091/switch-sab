import { createSalleService, getAllSallesService, getSalleByIdService, updateSalleService, deleteSalleService } from './salle.service.js'
import { validateCreateSalle, validateUpdateSalle } from './salle.dto.js'

export const createSalle = async (req, res) => {
  if (!validateCreateSalle(req.body)) {
    return res.status(400).json({ success: false, message: 'Payload de salle invalide' })
  }

  try {
    const salle = await createSalleService(req.body)
    return res.status(201).json({ success: true, salle })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const listSalles = async (req, res) => {
  try {
    const salles = await getAllSallesService()
    return res.json({ success: true, salles })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getSalle = async (req, res) => {
  try {
    const salle = await getSalleByIdService(req.params.id)
    if (!salle || salle.disabled) {
      return res.status(404).json({ success: false, message: 'Salle introuvable' })
    }
    return res.json({ success: true, salle })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateSalle = async (req, res) => {
  if (!validateUpdateSalle(req.body)) {
    return res.status(400).json({ success: false, message: 'Payload de mise à jour invalide' })
  }

  try {
    const salle = await updateSalleService(req.params.id, req.body)
    return res.json({ success: true, salle })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteSalle = async (req, res) => {
  try {
    const salle = await deleteSalleService(req.params.id)
    return res.json({ success: true, salle })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}
