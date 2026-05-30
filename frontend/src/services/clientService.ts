import api from "./axios";

/**
 * Service pour gérer les clients (Gérant)
 */
export const clientService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/gerant/clients", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (client: any) => {
    const response = await api.post("/gerant/clients", client);
    return response.data;
  },

  update: async (id: number, client: any) => {
    const response = await api.patch(`/gerant/clients/${id}`, client);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/gerant/clients/${id}`);
    return response.data;
  },
};
