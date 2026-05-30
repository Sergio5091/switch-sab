import api from "./axios";

/**
 * Service pour gérer la configuration des bonus (Admin)
 */
export const bonusConfigService = {
  get: async (salleId: number) => {
    const response = await api.get(`/admin/bonus-config/${salleId}`);
    return response.data;
  },

  update: async (salleId: number, config: any) => {
    const response = await api.patch(`/admin/bonus-config/${salleId}`, config);
    return response.data;
  },
};
