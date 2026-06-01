import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { salleService, licenceService } from "@/services/apiService";
import { authService, type CurrentUser } from "@/services/authService";

export type Role = "SUPERADMIN" | "ADMIN" | "GERANT" | "CLIENT";

export interface Utilisateur extends CurrentUser {
  // Ensure these common fields exist on Utilisateur for components
  id: number;
  role: Role;
  phone?: string;
  actif?: boolean;
}

export interface Salle {
  id: number;
  nom: string;
  pays: string;
  ville: string;
  quartier: string;
  telephone: string;
  machineId: string;
  disabled?: boolean;
  users?: Utilisateur[];
}

export interface Licence {
  id: number;
  licenceId: string;
  salleId: number;
  machineId: string;
  issuedAt: string;
  expiresAt: string;
  status: string;
  signature: string;
  daysRemaining: number;
}

interface AppContextType {
  currentUser: Utilisateur | null;
  login: (email: string, password: string) => Promise<Utilisateur | null>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  salles: Salle[];
  addSalle: (s: Omit<Salle, "id">) => Promise<void>;
  updateSalle: (id: number, s: Partial<Salle>) => Promise<void>;
  deleteSalle: (id: number) => Promise<void>;
  licences: Licence[];
  genererLicence: (salleId: number, validDays: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const normalizeUtilisateur = (user: any): Utilisateur => ({
  ...user,
  phone: user.telephone || user.phone,
});

const computeDaysRemaining = (expiresAt?: string) => {
  if (!expiresAt) return 0;
  const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [licences, setLicences] = useState<Licence[]>([]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setCurrentUser(normalizeUtilisateur(user));
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur:", err);
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setSalles([]);
        setLicences([]);
        return;
      }

      try {
        setError(null);

        const [sallesData, licencesData] = await Promise.all([
          salleService.getAll(),
          licenceService.getAll(),
        ]);

        setSalles(sallesData);
        setLicences(
          licencesData.map((lic: any) => ({
            ...lic,
            daysRemaining: computeDaysRemaining(lic.expiresAt),
          }))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement des données";
        setError(message);
        console.error("Erreur lors du chargement des données:", err);
      }
    };

    loadData();
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await authService.login({ email, password });
      const user = await authService.getCurrentUser();
      setCurrentUser(normalizeUtilisateur(user));
      return normalizeUtilisateur(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      setError(message);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
    setSalles([]);
    setLicences([]);
  }, []);

  const addSalle = useCallback(async (s: Omit<Salle, "id">) => {
    try {
      setError(null);
      const newSalle = await salleService.create(s);
      setSalles((prev) => [...prev, newSalle]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de la salle";
      setError(message);
      throw err;
    }
  }, []);

  const updateSalle = useCallback(async (id: number, s: Partial<Salle>) => {
    try {
      setError(null);
      const updated = await salleService.update(id, s);
      setSalles((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la salle";
      setError(message);
      throw err;
    }
  }, []);

  const deleteSalle = useCallback(async (id: number) => {
    try {
      setError(null);
      await salleService.delete(id);
      setSalles((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la salle";
      setError(message);
      throw err;
    }
  }, []);


  const genererLicence = useCallback(async (salleId: number, validDays: number) => {
    try {
      setError(null);
      const newLicence = await licenceService.generate(salleId, validDays);
      setLicences((prev) => [
        ...prev.filter((licence) => licence.licenceId !== newLicence.licenceId),
        {
          ...newLicence,
          daysRemaining: computeDaysRemaining(newLicence.expiresAt),
        },
      ]);
      return newLicence;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération de la licence";
      setError(message);
      throw err;
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isLoading,
        error,
        salles,
        addSalle,
        updateSalle,
        deleteSalle,
        licences,
        genererLicence,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
