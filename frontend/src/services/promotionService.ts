import api from "./axios";

/**
 * Service pour gérer les promotions (Admin)
 */
export const promotionService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/promotions", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (promotion: any) => {
    const response = await api.post("/admin/promotions", promotion);
    return response.data;
  },

  send: async (id: number) => {
    const response = await api.post(`/admin/promotions/${id}/send`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/promotions/${id}`);
    return response.data;
  },
};
