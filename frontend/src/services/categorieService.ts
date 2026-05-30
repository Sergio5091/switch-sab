import api from "./axios";

/**
 * Service pour gérer les catégories (Admin)
 */
export const categorieService = {
  getAll: async (salleId: number) => {
    const response = await api.get(`/admin/categories`, {
      params: { salleId },
    });
    return response.data;
  },

  create: async (categorie: any) => {
    const response = await api.post("/admin/categories", categorie);
    return response.data;
  },

  update: async (id: number, categorie: any) => {
    const response = await api.patch(`/admin/categories/${id}`, categorie);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },
};
