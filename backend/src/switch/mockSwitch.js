/**
 * MOCK SWITCH — Simulateur logiciel du switch physique
 *
 * Simule le vrai switch. Garde l'état de chaque poste en mémoire.
 * Les 6 postes correspondent exactement au seed.js :
 *   id 1 → PS4 Poste 1
 *   id 2 → PS4 Poste 2
 *   id 3 → PS5 Poste 1
 *   id 4 → PS5 Poste 2
 *   id 5 → XBOX Poste 1
 *   id 6 → XBOX Poste 2
 *
 * Tous démarrent ETEINTS.
 * Quand le vrai switch arrive → on change switchService.js uniquement.
 */

const POSTES_INITIAUX = [
  { id: 1, nom: 'PS4 — Poste 1' },
  { id: 2, nom: 'PS4 — Poste 2' },
  { id: 3, nom: 'PS5 — Poste 1' },
  { id: 4, nom: 'PS5 — Poste 2' },
  { id: 5, nom: 'XBOX — Poste 1' },
  { id: 6, nom: 'XBOX — Poste 2' },
]

// Map<posteId, { nom: string, allume: boolean }>
const etatsPostes = new Map(
  POSTES_INITIAUX.map(p => [p.id, { nom: p.nom, allume: false }])
)

export const mockAllumer = (posteId) => {
  const poste = etatsPostes.get(posteId)
  if (!poste) {
    return { success: false, posteId, message: `Poste ${posteId} inconnu du mock` }
  }
  poste.allume = true
  console.log(`[MOCK SWITCH] ▶ Allumage ${poste.nom}`)
  return { success: true, posteId, nom: poste.nom, statut: 'ALLUME', message: `${poste.nom} allumé (simulation)` }
}

export const mockEteindre = (posteId) => {
  const poste = etatsPostes.get(posteId)
  if (!poste) {
    return { success: false, posteId, message: `Poste ${posteId} inconnu du mock` }
  }
  poste.allume = false
  console.log(`[MOCK SWITCH] ■ Extinction ${poste.nom}`)
  return { success: true, posteId, nom: poste.nom, statut: 'ETEINT', message: `${poste.nom} éteint (simulation)` }
}

export const mockGetStatut = (posteId) => {
  const poste = etatsPostes.get(posteId)
  if (!poste) {
    return { success: false, posteId, message: `Poste ${posteId} inconnu du mock` }
  }
  return { success: true, posteId, nom: poste.nom, statut: poste.allume ? 'ALLUME' : 'ETEINT' }
}

export const mockGetStatuts = () => {
  const result = []
  for (const [posteId, poste] of etatsPostes.entries()) {
    result.push({ posteId, nom: poste.nom, statut: poste.allume ? 'ALLUME' : 'ETEINT' })
  }
  return result
}
