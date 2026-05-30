import api from "./axios";

/**
 * Service pour gérer les sessions (Gérant)
 */
export const sessionService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/gerant/sessions", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (session: any) => {
    const response = await api.post("/gerant/sessions", session);
    return response.data;
  },

  stop: async (id: number) => {
    const response = await api.post(`/gerant/sessions/${id}/stop`);
    return response.data;
  },

  getActive: async (salleId?: number) => {
    const response = await api.get("/gerant/sessions/active", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },
};
