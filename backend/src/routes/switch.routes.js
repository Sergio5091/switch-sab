/**
 * ROUTES SWITCH — API HTTP pour contrôler les postes
 *
 * Mathieu envoie juste { posteId: 3 }
 * Le switchService lit la BDD et choisit USB ou WIFI tout seul.
 */

import { Router } from 'express'
import { allumerPoste, eteindrePoste, getStatutPoste, getTousLesStatuts } from '../switch/switchService.js'

const router = Router()

// POST /switch/allumer  →  { posteId: 3 }
router.post('/allumer', async (req, res) => {
  const { posteId } = req.body
  if (!posteId || typeof posteId !== 'number') {
    return res.status(400).json({ success: false, message: 'posteId (number) est requis' })
  }
  try {
    const result = await allumerPoste(posteId)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// POST /switch/eteindre  →  { posteId: 3 }
router.post('/eteindre', async (req, res) => {
  const { posteId } = req.body
  if (!posteId || typeof posteId !== 'number') {
    return res.status(400).json({ success: false, message: 'posteId (number) est requis' })
  }
  try {
    const result = await eteindrePoste(posteId)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// GET /switch/statut/:posteId
router.get('/statut/:posteId', async (req, res) => {
  const posteId = parseInt(req.params.posteId)
  if (isNaN(posteId)) {
    return res.status(400).json({ success: false, message: 'posteId doit être un nombre' })
  }
  try {
    const result = await getStatutPoste(posteId)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// GET /switch/statuts  →  tous les postes
router.get('/statuts', (req, res) => {
  const statuts = getTousLesStatuts()
  return res.json({ success: true, postes: statuts })
})

export default router
