import api from "./axios";

/**
 * Service pour gérer les recharges (Gérant)
 */
export const rechargeService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/gerant/recharges", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (recharge: any) => {
    const response = await api.post("/gerant/recharges", recharge);
    return response.data;
  },

  validate: async (id: number, gerantId: number) => {
    const response = await api.post(`/gerant/recharges/${id}/validate`, {
      gerantId,
    });
    return response.data;
  },
};
