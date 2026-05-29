import {
  createSalleService,
  listSallesService,
  updateSalleService,
  disableSalleService,
  createAdminService,
  listAdminsService,
  updateAdminService,
  resetSalleService,
} from '../services/superadmin.service.js'
import { generateLicenceService } from '../services/licence.service.js'

export const createSalle = async (req, res) => {
  const { nom, pays, ville, quartier, telephone, switchType, switchConfig } = req.body
  if (!nom || !pays || !ville || !quartier || !telephone) {
    return res.status(400).json({ success: false, message: 'Tous les champs de la salle sont requis' })
  }

  try {
    const salle = await createSalleService({ nom, pays, ville, quartier, telephone, switchType, switchConfig })
    return res.status(201).json({ success: true, salle })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const listSalles = async (req, res) => {
  try {
    const salles = await listSallesService()
    return res.json({ success: true, salles })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateSalle = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  try {
    const salle = await updateSalleService(id, payload)
    return res.json({ success: true, salle })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteSalle = async (req, res) => {
  try {
    const salle = await disableSalleService(req.params.id)
    return res.json({ success: true, salle })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const generateLicence = async (req, res) => {
  const { salleId, validDays } = req.body
  if (!salleId) {
    return res.status(400).json({ success: false, message: 'salleId requis' })
  }

  try {
    const licence = await generateLicenceService({ salleId, validDays: validDays ?? 30 })
    return res.status(201).json({ success: true, licence })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const createAdmin = async (req, res) => {
  const { nom, prenom, email, telephone, motDePasse, salleId } = req.body
  if (!nom || !prenom || !email || !telephone || !motDePasse || !salleId) {
    return res.status(400).json({ success: false, message: 'Tous les champs admin sont requis' })
  }

  try {
    const admin = await createAdminService({ nom, prenom, email, telephone, motDePasse, salleId })
    return res.status(201).json({ success: true, admin })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listAdmins = async (req, res) => {
  try {
    const admins = await listAdminsService()
    return res.json({ success: true, admins })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateAdmin = async (req, res) => {
  const { id } = req.params
  try {
    const admin = await updateAdminService(id, req.body)
    return res.json({ success: true, admin })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const resetSalle = async (req, res) => {
  const { id } = req.params
  try {
    const result = await resetSalleService(id)
    return res.json({ success: true, ...result })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}
