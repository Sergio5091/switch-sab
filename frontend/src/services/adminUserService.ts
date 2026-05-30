import api from "./axios";

/**
 * Service pour gérer les utilisateurs Admin (SuperAdmin)
 */
export const adminUserService = {
  getAll: async () => {
    const response = await api.get("/superadmin/admins");
    return response.data.admins || [];
  },

  create: async (admin: any) => {
    const payload = {
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      telephone: admin.phone,
      salleId: admin.salleId,
      motDePasse: admin.password || "Admin123!",
    };
    const response = await api.post("/superadmin/admins", payload);
    return response.data.admin || response.data;
  },

  update: async (id: number, admin: any) => {
    const payload = {
      ...(admin.nom && { nom: admin.nom }),
      ...(admin.prenom && { prenom: admin.prenom }),
      ...(admin.email && { email: admin.email }),
      ...(admin.phone && { telephone: admin.phone }),
      ...(admin.salleId && { salleId: admin.salleId }),
      ...(admin.actif !== undefined && { actif: admin.actif }),
    };
    const response = await api.patch(`/superadmin/admins/${id}`, payload);
    return response.data.admin || response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/superadmin/admins/${id}`);
    return response.data;
  },
};
