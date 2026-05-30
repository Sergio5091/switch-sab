import api from "./axios";

/**
 * Service pour gérer les salles
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

/**
 * Service pour gérer les utilisateurs/admins
 */
export const adminService = {
  getAll: async () => {
    const response = await api.get("/superadmin/admins");
    return response.data.admins || [];
  },

  create: async (admin: any) => {
    // Transformer les noms de champs pour correspondre au backend
    const payload = {
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      telephone: admin.phone, // "phone" -> "telephone"
      salleId: admin.salleId,
      motDePasse: admin.password || "Admin123!", // "password" -> "motDePasse"
    };
    const response = await api.post("/superadmin/admins", payload);
    return response.data.admin || response.data;
  },

  update: async (id: number, admin: any) => {
    // Transformer les noms de champs
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

/**
 * Service pour gérer les catégories
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

/**
 * Service pour gérer les durées et prix
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

/**
 * Service pour gérer les postes
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

/**
 * Service pour gérer les clients
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

/**
 * Service pour gérer les sessions
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

/**
 * Service pour gérer les recharges
 */
export const rechargeService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/gerant/recharges", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (recharge: any) => {
    const response = await api.post("/gerant/recharges", recharge);
    return response.data;
  },

  validate: async (id: number, gerantId: number) => {
    const response = await api.post(`/gerant/recharges/${id}/validate`, {
      gerantId,
    });
    return response.data;
  },
};

/**
 * Service pour gérer les coupons
 */
export const couponService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/coupons", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  generate: async (salleId: number, valeur: number, count: number) => {
    const response = await api.post("/admin/coupons/generate", {
      salleId,
      valeur,
      count,
    });
    return response.data;
  },

  use: async (code: string, clientId: number) => {
    const response = await api.post("/gerant/coupons/use", {
      code,
      clientId,
    });
    return response.data;
  },
};

/**
 * Service pour gérer les licences
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

/**
 * Service pour gérer les promotions
 */
export const promotionService = {
  getAll: async (salleId?: number) => {
    const response = await api.get("/admin/promotions", {
      params: salleId ? { salleId } : {},
    });
    return response.data;
  },

  create: async (promotion: any) => {
    const response = await api.post("/admin/promotions", promotion);
    return response.data;
  },

  send: async (id: number) => {
    const response = await api.post(`/admin/promotions/${id}/send`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/promotions/${id}`);
    return response.data;
  },
};

/**
 * Service pour gérer les configurations de bonus
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

/**
 * Service pour gérer les configurations de promotion
 */
export const promoConfigService = {
  get: async (salleId: number) => {
    const response = await api.get(`/admin/promo-config/${salleId}`);
    return response.data;
  },

  update: async (salleId: number, config: any) => {
    const response = await api.patch(`/admin/promo-config/${salleId}`, config);
    return response.data;
  },
};
