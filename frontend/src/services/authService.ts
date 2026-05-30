import api from "./axios";

// Types pour les réponses d'authentification
export interface CurrentUser {
  id: number;
  pseudo: string;
  email: string;
  telephone?: string;
  role: "SUPERADMIN" | "ADMIN" | "GERANT" | "CLIENT";
  salleId: number;
  prenom?: string;
  nom?: string;
}

export interface CurrentUserResponse {
  success: boolean;
  user: CurrentUser;
}

export interface LoginResponse {
  token: string;
  role: "SUPERADMIN" | "ADMIN" | "GERANT" | "CLIENT";
  id: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion utilisateur
   */
  login: async (data: LoginData): Promise<LoginResponse> => {
    // Transformer password en motDePasse pour le backend
    const payload = {
      email: data.email,
      motDePasse: data.password,
    };
    const response = await api.post<LoginResponse>("/auth/login", payload);
    // Sauvegarder le token
    localStorage.setItem("access_token", response.data.token);
    return response.data;
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async (): Promise<void> => {
    // Nettoyer le stockage local
    localStorage.removeItem("access_token");
  },

  /**
   * Obtenir les données complètes de l'utilisateur actuel
   */
  getCurrentUser: async (): Promise<CurrentUser> => {
    const response = await api.get<CurrentUserResponse>("/auth/me");
    return response.data.user;
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated: (): boolean => {
    const accessToken = localStorage.getItem("access_token");
    return !!accessToken;
  },

  /**
   * Obtenir les informations de base de l'utilisateur depuis le token (décodage basique)
   */
  getCurrentUserFromToken: (): any => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      // Décodage basique JWT (sans validation)
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));
      return payload;
    } catch (e) {
      return null;
    }
  },
};

export default authService;