import api from "./axios";

/**
 * Service pour gérer les postes (Admin, Gérant)
 */
export const posteService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/postes", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (poste: any) => {
    const response = await api.post("/admin/postes", poste);
    return response.data;
  },

  update: async (id: number, poste: any) => {
    const response = await api.patch(`/admin/postes/${id}`, poste);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/postes/${id}`);
    return response.data;
  },
};
