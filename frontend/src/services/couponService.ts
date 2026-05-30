import api from "./axios";

/**
 * Service pour gérer les coupons (Admin crée, Gérant utilise)
 */
export const couponService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/coupons", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  generate: async (salleId: number, valeur: number, count: number) => {
    const response = await api.post("/admin/coupons/generate", {
      salleId,
      valeur,
      count,
    });
    return response.data;
  },

  use: async (code: string, clientId: number) => {
    const response = await api.post("/gerant/coupons/use", {
      code,
      clientId,
    });
    return response.data;
  },
};
