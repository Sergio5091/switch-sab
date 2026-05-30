import api from "./axios";

/**
 * Service pour gérer la configuration des promotions (Admin)
 */
export const promoConfigService = {
  get: async (salleId: number) => {
    const response = await api.get(`/admin/promo-config/${salleId}`);
    return response.data;
  },

  update: async (salleId: number, config: any) => {
    const response = await api.patch(`/admin/promo-config/${salleId}`, config);
    return response.data;
  },
};
