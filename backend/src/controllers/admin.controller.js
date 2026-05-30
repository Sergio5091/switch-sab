import {
  createCategorieService,
  listCategoriesService,
  updateCategorieService,
  deleteCategorieService,
} from '../services/categorie.service.js'
import {
  createDureePrixService,
  listDureesPrixService,
  updateDureePrixService,
  deleteDureePrixService,
} from '../services/dureeprix.service.js'
import {
  createPosteService,
  listPostesService,
  updatePosteService,
  deletePosteService,
} from '../services/poste.service.js'
import { generateCouponsService } from '../services/coupon.service.js'
import {
  createPromotionService,
  listPromotionsService,
  updatePromotionService,
  deletePromotionService,
} from '../services/promotion.service.js'
import {
  getBonusConfigService,
  updateBonusConfigService,
} from '../services/bonusconfig.service.js'
import {
  getPromoConfigService,
  updatePromoConfigService,
} from '../services/promoconfig.service.js'

// ─── CATÉGORIES ─────────────────────────────────────────────
export const createCategorie = async (req, res) => {
  const { nom, salleId } = req.body
  if (!nom || !salleId) {
    return res.status(400).json({ success: false, message: 'Nom et salleId requis' })
  }
  try {
    const categorie = await createCategorieService({ nom, salleId })
    return res.status(201).json({ success: true, categorie })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listCategories = async (req, res) => {
  const { salleId } = req.query
  try {
    const categories = await listCategoriesService(Number(salleId))
    return res.json({ success: true, categories })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateCategorie = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  try {
    const categorie = await updateCategorieService(Number(id), payload)
    return res.json({ success: true, categorie })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteCategorie = async (req, res) => {
  const { id } = req.params
  try {
    await deleteCategorieService(Number(id))
    return res.json({ success: true, message: 'Catégorie supprimée' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── DURÉES ET PRIX ─────────────────────────────────────────────
export const createDureePrix = async (req, res) => {
  const { categorieId, duree, dureeMinutes, prix } = req.body
  if (!categorieId || !duree || !dureeMinutes || !prix) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis' })
  }
  try {
    const dureeprix = await createDureePrixService({ categorieId, duree, dureeMinutes, prix })
    return res.status(201).json({ success: true, dureeprix })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listDureesPrix = async (req, res) => {
  const { salleId } = req.query
  try {
    const durees = await listDureesPrixService(Number(salleId))
    return res.json({ success: true, durees })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateDureePrix = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  try {
    const dureeprix = await updateDureePrixService(Number(id), payload)
    return res.json({ success: true, dureeprix })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteDureePrix = async (req, res) => {
  const { id } = req.params
  try {
    await deleteDureePrixService(Number(id))
    return res.json({ success: true, message: 'Durée/prix supprimée' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── POSTES ─────────────────────────────────────────────────────
export const createPoste = async (req, res) => {
  const { numero, categorieId, typeSwitch, salleId } = req.body
  if (!numero || !categorieId || !typeSwitch || !salleId) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis' })
  }
  try {
    const poste = await createPosteService({ numero, categorieId, typeSwitch, salleId })
    return res.status(201).json({ success: true, poste })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listPostes = async (req, res) => {
  const { salleId } = req.query
  try {
    const postes = await listPostesService(Number(salleId))
    return res.json({ success: true, postes })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updatePoste = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  try {
    const poste = await updatePosteService(Number(id), payload)
    return res.json({ success: true, poste })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deletePoste = async (req, res) => {
  const { id } = req.params
  try {
    await deletePosteService(Number(id))
    return res.json({ success: true, message: 'Poste supprimé' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── COUPONS ─────────────────────────────────────────────────
export const generateCoupons = async (req, res) => {
  const { salleId, valeur, count } = req.body
  if (!salleId || !valeur || !count) {
    return res.status(400).json({ success: false, message: 'salleId, valeur et count requis' })
  }
  try {
    const coupons = await generateCouponsService({ salleId, valeur, count })
    return res.status(201).json({ success: true, coupons })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── PROMOTIONS ─────────────────────────────────────────────
export const createPromotion = async (req, res) => {
  const { salleId, texte } = req.body
  if (!salleId || !texte) {
    return res.status(400).json({ success: false, message: 'salleId et texte requis' })
  }
  try {
    const promo = await createPromotionService({ salleId, texte })
    return res.status(201).json({ success: true, promo })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const listPromotions = async (req, res) => {
  const { salleId } = req.query
  try {
    const promos = await listPromotionsService(Number(salleId))
    return res.json({ success: true, promos })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updatePromotion = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  try {
    const promo = await updatePromotionService(Number(id), payload)
    return res.json({ success: true, promo })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const deletePromotion = async (req, res) => {
  const { id } = req.params
  try {
    await deletePromotionService(Number(id))
    return res.json({ success: true, message: 'Promotion supprimée' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

// ─── CONFIGURATIONS ─────────────────────────────────────────────
export const getBonusConfig = async (req, res) => {
  const { salleId } = req.params
  try {
    const config = await getBonusConfigService(Number(salleId))
    return res.json({ success: true, config })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updateBonusConfig = async (req, res) => {
  const { salleId } = req.params
  const payload = req.body
  try {
    const config = await updateBonusConfigService(Number(salleId), payload)
    return res.json({ success: true, config })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const getPromoConfig = async (req, res) => {
  const { salleId } = req.params
  try {
    const config = await getPromoConfigService(Number(salleId))
    return res.json({ success: true, config })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const updatePromoConfig = async (req, res) => {
  const { salleId } = req.params
  const payload = req.body
  try {
    const config = await updatePromoConfigService(Number(salleId), payload)
    return res.json({ success: true, config })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}
