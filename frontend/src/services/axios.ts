import axios from "axios";

// Créer une instance Axios avec la configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 30000, // 30s pour laisser le temps au serveur Render de se réveiller
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs courants
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion ou déconnecter l'utilisateur
      localStorage.removeItem("access_token");
      // Vous pouvez déclencher un événement ou rediriger ici
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;