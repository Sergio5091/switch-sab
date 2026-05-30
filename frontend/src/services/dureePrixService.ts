import api from "./axios";

/**
 * Service pour gérer les durées et prix (Admin)
 */
export const dureePrixService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/durees-prix", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (dureePrix: any) => {
    const response = await api.post("/admin/durees-prix", dureePrix);
    return response.data;
  },

  update: async (id: number, dureePrix: any) => {
    const response = await api.patch(`/admin/durees-prix/${id}`, dureePrix);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/durees-prix/${id}`);
    return response.data;
  },
};
