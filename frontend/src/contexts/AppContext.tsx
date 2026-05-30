import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  salleService,
  adminService,
  categorieService,
  dureePrixService,
  posteService,
  clientService,
  sessionService,
  rechargeService,
  couponService,
  licenceService,
  promotionService,
  bonusConfigService,
  promoConfigService,
} from "../services/apiService";
import { authService, type CurrentUser } from "../services/authService";

export type Role = "SUPERADMIN" | "ADMIN" | "GERANT" | "CLIENT";

export interface Utilisateur extends CurrentUser {
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
  disabled?: boolean;
  switchType?: string;
  switchConfig?: string;
  users?: Utilisateur[];
  licences?: Licence[];
}

export interface Categorie {
  id: number;
  nom: string;
  salleId: number;
  couleur: string;
}

export interface DureePrix {
  id: number;
  categorieId: number;
  duree: string;
  dureeMinutes: number;
  prix: number;
}

export interface Poste {
  id: number;
  numero: number;
  categorieId: number;
  typeSwitch: "USB" | "WIFI";
  salleId: number;
  actif: boolean;
}

export interface Client {
  id: number;
  pseudo: string;
  phone: string;
  enfant: boolean;
  codeEnfant?: string;
  creditMonetaire: number;
  bonusTempsDispo: number;
  creditPromo: number;
  salleId: number;
  codePromo: string;
  totalAchats: number;
}

export interface Session {
  id: number;
  clientId: number;
  posteId: number;
  gerantId: number;
  dureeAchetee: string;
  dureeMinutes: number;
  heureDebut: string;
  heureFin: string | null;
  montant: number;
  estBonus: boolean;
  salleId: number;
  actif: boolean;
  secondsRemaining: number;
}

export interface Recharge {
  id: number;
  clientId: number;
  montant: number;
  statut: "en_attente" | "validee";
  heureCreation: string;
  gerantValidateur?: number;
}

export interface Coupon {
  id: number;
  code: string;
  valeur: number;
  statut: "actif" | "utilise";
  salleId: number;
  utilisePar?: number;
}

export interface Licence {
  id: number;
  salleId: number;
  code: string;
  requestCode: string;
  signature?: string;
  expiresAt?: string;
  daysRemaining?: number;
  actif?: boolean;
}

export interface Promotion {
  id: number;
  salleId: number;
  texte: string;
  dateCreation: string;
  envoye: boolean;
}

export interface BonusConfig {
  salleId: number;
  ratioJeu: number;
  ratioBonus: number;
  seuilMinutes: number;
  validiteMois: number;
}

export interface PromoConfig {
  salleId: number;
  bonusParrainPct: number;
  reductionInvitePct: number;
}

interface AppContextType {
  // Authentication
  currentUser: Utilisateur | null;
  login: (email: string, password: string) => Promise<Utilisateur | null>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;

  // Salles
  salles: Salle[];
  addSalle: (s: Omit<Salle, "id">) => Promise<void>;
  updateSalle: (id: number, s: Partial<Salle>) => Promise<void>;
  deleteSalle: (id: number) => Promise<void>;

  // Utilisateurs
  utilisateurs: Utilisateur[];
  addUtilisateur: (u: Omit<Utilisateur, "id">) => Promise<void>;
  updateUtilisateur: (id: number, u: Partial<Utilisateur>) => Promise<void>;
  deleteUtilisateur: (id: number) => Promise<void>;

  // Catégories
  categories: Categorie[];
  addCategorie: (c: Omit<Categorie, "id">) => Promise<void>;
  updateCategorie: (id: number, c: Partial<Categorie>) => Promise<void>;
  deleteCategorie: (id: number) => Promise<void>;

  // Durées et Prix
  dureesPrix: DureePrix[];
  addDureePrix: (d: Omit<DureePrix, "id">) => Promise<void>;
  updateDureePrix: (id: number, d: Partial<DureePrix>) => Promise<void>;
  deleteDureePrix: (id: number) => Promise<void>;

  // Postes
  postes: Poste[];
  addPoste: (p: Omit<Poste, "id">) => Promise<void>;
  updatePoste: (id: number, p: Partial<Poste>) => Promise<void>;
  deletePoste: (id: number) => Promise<void>;

  // Clients
  clients: Client[];
  addClient: (c: Omit<Client, "id" | "codePromo" | "totalAchats">) => Promise<void>;
  updateClient: (id: number, c: Partial<Client>) => Promise<void>;

  // Sessions
  sessions: Session[];
  addSession: (s: Omit<Session, "id">) => Promise<Session>;
  stopSession: (id: number) => Promise<void>;
  tickSessions: () => void;

  // Recharges
  recharges: Recharge[];
  addRecharge: (r: Omit<Recharge, "id">) => Promise<void>;
  validerRecharge: (id: number, gerantId: number) => Promise<void>;

  // Coupons
  coupons: Coupon[];
  genererCoupons: (salleId: number, valeur: number, count: number) => Promise<void>;
  utiliserCoupon: (code: string, clientId: number) => Promise<boolean>;

  // Licences
  licences: Licence[];
  genererLicence: (salleId: number, code: string) => Promise<void>;

  // Promotions
  promotions: Promotion[];
  addPromotion: (p: Omit<Promotion, "id" | "dateCreation" | "envoye">) => Promise<void>;
  envoyerPromotion: (id: number) => Promise<void>;

  // Configurations
  bonusConfigs: BonusConfig[];
  updateBonusConfig: (salleId: number, c: Partial<BonusConfig>) => Promise<void>;

  promoConfigs: PromoConfig[];
  updatePromoConfig: (salleId: number, c: Partial<PromoConfig>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // States
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salles, setSalles] = useState<Salle[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [dureesPrix, setDureesPrix] = useState<DureePrix[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [licences, setLicences] = useState<Licence[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [bonusConfigs, setBonusConfigs] = useState<BonusConfig[]>([]);
  const [promoConfigs, setPromoConfigs] = useState<PromoConfig[]>([]);

  // Charger l'utilisateur actuel au montage
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
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

// Charger les données initiales en fonction du rôle
   useEffect(() => {
     const loadData = async () => {
       try {
         setError(null);
         if (!currentUser) return;

         // SUPERADMIN: Charger les salles et les utilisateurs (admins)
         if (currentUser.role === "SUPERADMIN") {
           const [sallesData, utilisateursData] = await Promise.allSettled([
             salleService.getAll(),
             adminService.getAll(),
           ]);

           if (sallesData.status === "fulfilled") {
             setSalles(sallesData.value);
             const allLicences = sallesData.value.flatMap((s: any) => s.licences || []);
             setLicences(allLicences);
           }
           if (utilisateursData.status === "fulfilled") setUtilisateurs(utilisateursData.value);
         }
         // ADMIN: Charger les données de sa salle (catégories, durées, postes, coupons, promotions, configs)
         else if (currentUser.role === "ADMIN") {
           const userSalleId = currentUser.salleId;
           if (userSalleId) {
             const [categoriesData, dureesPrixData, postesData, couponsData, promotionsData, bonusConfigData, promoConfigData] =
               await Promise.allSettled([
                 categorieService.getAll(userSalleId),
                 dureePrixService.getAll(userSalleId),
                 posteService.getAll(userSalleId),
                 couponService.getAll(userSalleId),
                 promotionService.getAll(userSalleId),
                 bonusConfigService.get(userSalleId),
                 promoConfigService.get(userSalleId),
               ]);

             if (categoriesData.status === "fulfilled") setCategories(categoriesData.value);
             if (dureesPrixData.status === "fulfilled") setDureesPrix(dureesPrixData.value);
             if (postesData.status === "fulfilled") setPostes(postesData.value);
             if (couponsData.status === "fulfilled") setCoupons(couponsData.value);
             if (promotionsData.status === "fulfilled") setPromotions(promotionsData.value);
             if (bonusConfigData.status === "fulfilled") setBonusConfigs([bonusConfigData.value]);
             if (promoConfigData.status === "fulfilled") setPromoConfigs([promoConfigData.value]);
           }
         }
         // GÉRANT: Charger les données de sa salle (clients, sessions, recharges, coupons)
         else if (currentUser.role === "GERANT") {
           const userSalleId = currentUser.salleId;
           if (userSalleId) {
             const [clientsData, sessionsData, rechargesData, couponsData] = await Promise.allSettled([
               clientService.getAll(userSalleId),
               sessionService.getAll(userSalleId),
               rechargeService.getAll(userSalleId),
               couponService.getAll(userSalleId),
             ]);

             if (clientsData.status === "fulfilled") setClients(clientsData.value);
             if (sessionsData.status === "fulfilled") setSessions(sessionsData.value);
             if (rechargesData.status === "fulfilled") setRecharges(rechargesData.value);
             if (couponsData.status === "fulfilled") setCoupons(couponsData.value);
           }
         }
         // CLIENT: Pas de chargement de données globales (données chargées page par page)
       } catch (err) {
         const message = err instanceof Error ? err.message : "Erreur lors du chargement des données";
         setError(message);
         console.error("Erreur lors du chargement des données:", err);
       }
     };

     loadData();
   }, [currentUser]);

  // Timer pour les sessions
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (!s.actif || s.secondsRemaining <= 0) return s;
          const newSecs = s.secondsRemaining - 1;
          if (newSecs <= 0) {
            return { ...s, secondsRemaining: 0, actif: false, heureFin: new Date().toISOString() };
          }
          return { ...s, secondsRemaining: newSecs };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Authentification
  const login = useCallback(
    async (email: string, password: string): Promise<Utilisateur | null> => {
      try {
        setError(null);
        const response = await authService.login({ email, password });
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur de connexion";
        setError(message);
        return null;
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setSalles([]);
      setUtilisateurs([]);
      setCategories([]);
      setDureesPrix([]);
      setPostes([]);
      setClients([]);
      setSessions([]);
      setRecharges([]);
      setCoupons([]);
      setLicences([]);
      setPromotions([]);
      setBonusConfigs([]);
      setPromoConfigs([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(message);
    }
  }, []);

  // Salles
  const addSalle = useCallback(
    async (s: Omit<Salle, "id">) => {
      try {
        setError(null);
        const newSalle = await salleService.create(s);
        setSalles((prev) => [...prev, newSalle]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la salle";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateSalle = useCallback(
    async (id: number, s: Partial<Salle>) => {
      try {
        setError(null);
        const updated = await salleService.update(id, s);
        setSalles((prev) => prev.map((x) => (x.id === id ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la salle";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteSalle = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await salleService.delete(id);
        setSalles((prev) => prev.filter((x) => x.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la salle";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Utilisateurs
  const addUtilisateur = useCallback(
    async (u: Omit<Utilisateur, "id">) => {
      try {
        setError(null);
        const newUser = await adminService.create(u);
        setUtilisateurs((prev) => [...prev, newUser]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateUtilisateur = useCallback(
    async (id: number, u: Partial<Utilisateur>) => {
      try {
        setError(null);
        const updated = await adminService.update(id, u);
        setUtilisateurs((prev) => prev.map((x) => (x.id === id ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'utilisateur";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteUtilisateur = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await adminService.delete(id);
        setUtilisateurs((prev) => prev.filter((x) => x.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Catégories
  const addCategorie = useCallback(
    async (c: Omit<Categorie, "id">) => {
      try {
        setError(null);
        const newCat = await categorieService.create(c);
        setCategories((prev) => [...prev, newCat]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la catégorie";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateCategorie = useCallback(
    async (id: number, c: Partial<Categorie>) => {
      try {
        setError(null);
        const updated = await categorieService.update(id, c);
        setCategories((prev) => prev.map((x) => (x.id === id ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la catégorie";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteCategorie = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await categorieService.delete(id);
        setCategories((prev) => prev.filter((x) => x.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la catégorie";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Durées et Prix
  const addDureePrix = useCallback(
    async (d: Omit<DureePrix, "id">) => {
      try {
        setError(null);
        const newDP = await dureePrixService.create(d);
        setDureesPrix((prev) => [...prev, newDP]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la durée/prix";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateDureePrix = useCallback(
    async (id: number, d: Partial<DureePrix>) => {
      try {
        setError(null);
        const updated = await dureePrixService.update(id, d);
        setDureesPrix((prev) => prev.map((x) => (x.id === id ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la durée/prix";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteDureePrix = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await dureePrixService.delete(id);
        setDureesPrix((prev) => prev.filter((x) => x.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la durée/prix";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Postes
  const addPoste = useCallback(
    async (p: Omit<Poste, "id">) => {
      try {
        setError(null);
        const newPoste = await posteService.create(p);
        setPostes((prev) => [...prev, newPoste]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création du poste";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updatePoste = useCallback(
    async (id: number, p: Partial<Poste>) => {
      try {
        setError(null);
        const updated = await posteService.update(id, p);
        setPostes((prev) => prev.map((x) => (x.id === id ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du poste";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deletePoste = useCallback(
    async (id: number) => {
      try {
        setError(null);
        await posteService.delete(id);
        setPostes((prev) => prev.filter((x) => x.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression du poste";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Clients
  const addClient = useCallback(
    async (c: Omit<Client, "id" | "codePromo" | "totalAchats">) => {
      try {
        setError(null);
        const newClient = await clientService.create(c);
        setClients((prev) => [...prev, newClient]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création du client";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateClient = useCallback(
    async (id: number, c: Partial<Client>) => {
      try {
        setError(null);
        const updated = await clientService.update(id, c);
        setClients((prev) => prev.map((x) => (x.id === id ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du client";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Sessions
  const addSession = useCallback(
    async (s: Omit<Session, "id">): Promise<Session> => {
      try {
        setError(null);
        const newSession = await sessionService.create(s);
        setSessions((prev) => [...prev, newSession]);
        return newSession;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la session";
        setError(message);
        throw err;
      }
    },
    []
  );

  const stopSession = useCallback(
    async (id: number) => {
      try {
        setError(null);
        const updated = await sessionService.stop(id);
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'arrêt de la session";
        setError(message);
        throw err;
      }
    },
    []
  );

  const tickSessions = () => {
    // Cette fonction est appelée par le timer qui décrémente déjà secondsRemaining
  };

  // Recharges
  const addRecharge = useCallback(
    async (r: Omit<Recharge, "id">) => {
      try {
        setError(null);
        const newRecharge = await rechargeService.create(r);
        setRecharges((prev) => [...prev, newRecharge]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la recharge";
        setError(message);
        throw err;
      }
    },
    []
  );

  const validerRecharge = useCallback(
    async (id: number, gerantId: number) => {
      try {
        setError(null);
        const updated = await rechargeService.validate(id, gerantId);
        setRecharges((prev) => prev.map((x) => (x.id === id ? updated : x)));

        // Mettre à jour le crédit du client
        const recharge = recharges.find((x) => x.id === id);
        if (recharge) {
          setClients((prev) =>
            prev.map((c) => (c.id === recharge.clientId ? { ...c, creditMonetaire: c.creditMonetaire + recharge.montant } : c))
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la validation de la recharge";
        setError(message);
        throw err;
      }
    },
    [recharges]
  );

  // Coupons
  const genererCoupons = useCallback(
    async (salleId: number, valeur: number, count: number) => {
      try {
        setError(null);
        const newCoupons = await couponService.generate(salleId, valeur, count);
        setCoupons((prev) => [...prev, ...newCoupons]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la génération des coupons";
        setError(message);
        throw err;
      }
    },
    []
  );

  const utiliserCoupon = useCallback(
    async (code: string, clientId: number): Promise<boolean> => {
      try {
        setError(null);
        const result = await couponService.use(code, clientId);
        
        // Mettre à jour le coupon
        const coupon = coupons.find((c) => c.code === code);
        if (coupon) {
          setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, statut: "utilise", utilisePar: clientId } : c)));
          
          // Mettre à jour le crédit du client
          setClients((prev) =>
            prev.map((c) => (c.id === clientId ? { ...c, creditMonetaire: c.creditMonetaire + coupon.valeur } : c))
          );
        }
        
        return result.success || true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'utilisation du coupon";
        setError(message);
        return false;
      }
    },
    [coupons]
  );

// Licences
   const genererLicence = useCallback(
     async (salleId: number) => {
       const newLicence = await licenceService.generate(salleId);
       // Mettre à jour les salles localement sans refetch
       setSalles((prev) => prev.map((s) =>
         s.id === salleId
           ? { ...s, licences: [...(s.licences || []), newLicence] }
           : s
       ));
       return newLicence;
     },
     []
   );

  // Promotions
  const addPromotion = useCallback(
    async (p: Omit<Promotion, "id" | "dateCreation" | "envoye">) => {
      try {
        setError(null);
        const newPromo = await promotionService.create(p);
        setPromotions((prev) => [...prev, newPromo]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la promotion";
        setError(message);
        throw err;
      }
    },
    []
  );

  const envoyerPromotion = useCallback(
    async (id: number) => {
      try {
        setError(null);
        const updated = await promotionService.send(id);
        setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'envoi de la promotion";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Configurations
  const updateBonusConfig = useCallback(
    async (salleId: number, c: Partial<BonusConfig>) => {
      try {
        setError(null);
        const updated = await bonusConfigService.update(salleId, c);
        setBonusConfigs((prev) => prev.map((x) => (x.salleId === salleId ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la configuration de bonus";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updatePromoConfig = useCallback(
    async (salleId: number, c: Partial<PromoConfig>) => {
      try {
        setError(null);
        const updated = await promoConfigService.update(salleId, c);
        setPromoConfigs((prev) => prev.map((x) => (x.salleId === salleId ? updated : x)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la configuration de promotion";
        setError(message);
        throw err;
      }
    },
    []
  );

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
        utilisateurs,
        addUtilisateur,
        updateUtilisateur,
        deleteUtilisateur,
        categories,
        addCategorie,
        updateCategorie,
        deleteCategorie,
        dureesPrix,
        addDureePrix,
        updateDureePrix,
        deleteDureePrix,
        postes,
        addPoste,
        updatePoste,
        deletePoste,
        clients,
        addClient,
        updateClient,
        sessions,
        addSession,
        stopSession,
        tickSessions,
        recharges,
        addRecharge,
        validerRecharge,
        coupons,
        genererCoupons,
        utiliserCoupon,
        licences,
        genererLicence,
        promotions,
        addPromotion,
        envoyerPromotion,
        bonusConfigs,
        updateBonusConfig,
        promoConfigs,
        updatePromoConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
