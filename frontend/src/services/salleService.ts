import api from "./axios";

/**
 * Service pour gérer les salles (SuperAdmin)
 */
export const salleService = {
  getAll: async () => {
    const response = await api.get("/superadmin/salles");
    return response.data.salles || [];
  },

  create: async (salle: any) => {
    const response = await api.post("/superadmin/salles", salle);
    return response.data;
  },

  update: async (id: number, salle: any) => {
    const response = await api.patch(`/superadmin/salles/${id}`, salle);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/superadmin/salles/${id}`);
    return response.data;
  },

  reset: async (id: number) => {
    const response = await api.post(`/superadmin/salles/${id}/reset`);
    return response.data;
  },
};
