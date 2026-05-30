import api from "./axios";

/**
 * Service pour gérer les licences (SuperAdmin génère, Client active)
 */
export const licenceService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/licences", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  generate: async (salleId: number, code: string) => {
    const response = await api.post("/superadmin/licences/generer", {
      salleId,
      code,
    });
    return response.data;
  },

  activate: async (code: string) => {
    const response = await api.post("/licence/activer", { code });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get("/licence/statut");
    return response.data;
  },
};
