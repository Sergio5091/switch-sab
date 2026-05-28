/**
 * SWITCH SERVICE — Point d'entrée unique pour toutes les commandes switch
 *
 * Alessio appelle juste :  allumerPoste(posteId)
 * Ce service se charge de :
 *   1. Trouver la salle du poste dans la BDD
 *   2. Lire salle.switchType (USB ou WIFI)
 *   3. Router vers le bon driver automatiquement
 *
 * Alessio et Mathieu ne savent jamais si c'est USB ou WIFI.
 * C'est ce fichier qui décide.
 */

import { PrismaClient } from '@prisma/client'
import { mockAllumer, mockEteindre, mockGetStatut, mockGetStatuts } from './mockSwitch.js'

const prisma = new PrismaClient()

// ─── DRIVERS ──────────────────────────────────────────────────────────────────
// Chaque driver expose la même interface : { allumer, eteindre, getStatut, getStatuts }
// Quand le vrai switch arrive, on ajoute le fichier et on change ici uniquement.

const drivers = {
  MOCK: {
    allumer: mockAllumer,
    eteindre: mockEteindre,
    getStatut: mockGetStatut,
    getStatuts: mockGetStatuts,
  },
  USB: {
    // TODO Phase 6.1 — remplacer par usbSwitch.js
    allumer: mockAllumer,
    eteindre: mockEteindre,
    getStatut: mockGetStatut,
    getStatuts: mockGetStatuts,
  },
  WIFI: {
    // TODO Phase 6.2 — remplacer par wifiSwitch.js
    allumer: mockAllumer,
    eteindre: mockEteindre,
    getStatut: mockGetStatut,
    getStatuts: mockGetStatuts,
  },
}

// ─── RÉCUPÉRER LE TYPE DE SWITCH D'UN POSTE ───────────────────────────────────
// On lit la BDD : poste → catégorie → salle → switchType
const getSwitchTypeduPoste = async (posteId) => {
  const poste = await prisma.poste.findUnique({
    where: { id: posteId },
    include: {
      categorie: {
        include: { salle: true }
      }
    }
  })

  if (!poste) throw new Error(`Poste ${posteId} introuvable en BDD`)

  const switchType = poste.categorie.salle.switchType // "USB" ou "WIFI"
  const switchConfig = poste.categorie.salle.switchConfig // IP ou port COM

  return { switchType, switchConfig }
}

// ─── API PUBLIQUE ─────────────────────────────────────────────────────────────
// C'est tout ce qu'Alessio utilise. Il ne passe jamais switchType.

/**
 * Allume un poste. Lit automatiquement le type de switch depuis la BDD.
 * @param {number} posteId
 */
export const allumerPoste = async (posteId) => {
  const { switchType } = await getSwitchTypeduPoste(posteId)
  const driver = drivers[switchType] ?? drivers.MOCK
  console.log(`[SWITCH SERVICE] Allumage poste ${posteId} via ${switchType}`)
  return driver.allumer(posteId)
}

/**
 * Éteint un poste. Lit automatiquement le type de switch depuis la BDD.
 * @param {number} posteId
 */
export const eteindrePoste = async (posteId) => {
  const { switchType } = await getSwitchTypeduPoste(posteId)
  const driver = drivers[switchType] ?? drivers.MOCK
  console.log(`[SWITCH SERVICE] Extinction poste ${posteId} via ${switchType}`)
  return driver.eteindre(posteId)
}

/**
 * Retourne l'état d'un poste précis.
 * @param {number} posteId
 */
export const getStatutPoste = async (posteId) => {
  const { switchType } = await getSwitchTypeduPoste(posteId)
  const driver = drivers[switchType] ?? drivers.MOCK
  return driver.getStatut(posteId)
}

/**
 * Retourne l'état de tous les postes (toujours via le mock pour l'instant).
 */
export const getTousLesStatuts = () => {
  return drivers.MOCK.getStatuts()
}
