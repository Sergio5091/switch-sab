import api from "./axios";

const normalizeAdmin = (admin: any) => ({
  ...admin,
  phone: admin.telephone || admin.phone,
});

/**
 * Service pour gérer les salles
 */
export const salleService = {
  getAll: async () => {
    const response = await api.get("/salles");
    return response.data.salles || [];
  },

  create: async (salle: any) => {
    const response = await api.post("/salles", salle);
    return response.data.salle;
  },

  update: async (id: number, salle: any) => {
    const response = await api.patch(`/salles/${id}`, salle);
    return response.data.salle;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/salles/${id}`);
    return response.data.salle;
  },
};

/**
 * Service pour gérer les utilisateurs/admins
 */
/**
 * Service pour gérer les licences
 */
export const licenceService = {
  getAll: async () => {
    const response = await api.get("/licences");
    return response.data.licences || [];
  },

  generate: async (salleId: number, validDays: number) => {
    const response = await api.post("/licences/generer", { salleId, validDays });
    return response.data.licence || response.data;
  },

  renew: async (licenceId: string, validDays: number) => {
    const response = await api.post("/licences/renouveler", { licenceId, validDays });
    return response.data.licence || response.data;
  },

  revoke: async (licenceId: string) => {
    const response = await api.post(`/licences/revoquer/${licenceId}`);
    return response.data.licence || response.data;
  },

  export: async (licenceId: string) => {
    const response = await api.get(`/licences/${licenceId}/export`);
    return response.data;
  },
};
