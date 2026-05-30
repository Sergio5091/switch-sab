import { prisma } from './prismaClient.js'

// Note: PromoConfig n'existe pas dans le schéma actuel, utiliser une config simple
export const getPromoConfigService = async () => {
  // Retourner une config par défaut vide
  return {
    reductionInvite: 20,
    bonusParrain: 10,
  }
}

export const updatePromoConfigService = async (payload) => {
  // Ignorer car le modèle n'existe pas
  return {
    reductionInvite: payload.reductionInvite || 20,
    bonusParrain: payload.bonusParrain || 10,
  }
}