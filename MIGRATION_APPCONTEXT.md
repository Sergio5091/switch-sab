# Migration du AppContext - Mock vers API Réelle

## 📋 Résumé des Modifications

Le fichier `AppContext.tsx` a été complètement modernisé pour remplacer les données mock par des appels API réels. Toutes les opérations CRUD maintenant communiquent avec le backend via des services HTTP.

## 🔄 Changements Principaux

### 1. **Nouvelles Importations**
```typescript
// Tous les services API ont été créés/importés
import { salleService, adminService, categorieService, ... } from "../services/apiService";
import { authService } from "../services/authService";
```

### 2. **Service API Créé** (`apiService.ts`)
Un nouveau fichier `/src/services/apiService.ts` contient tous les services API :

- **Salles**: `salleService` - CRUD des salles de jeu
- **Utilisateurs/Admins**: `adminService` - Gestion des administrateurs
- **Catégories**: `categorieService` - Catégories de jeux
- **Durées et Prix**: `dureePrixService` - Tarification
- **Postes**: `posteService` - Gestion des postes de jeu
- **Clients**: `clientService` - Gestion des clients
- **Sessions**: `sessionService` - Sessions de jeu actives
- **Recharges**: `rechargeService` - Recharges de crédit
- **Coupons**: `couponService` - Génération et utilisation de coupons
- **Licences**: `licenceService` - Gestion des licences
- **Promotions**: `promotionService` - Promotions marketing
- **Configurations**: `bonusConfigService`, `promoConfigService` - Configurations

### 3. **Nouvelles Propriétés du Contexte**

```typescript
interface AppContextType {
  // États de chargement et erreurs
  isLoading: boolean;      // État global de chargement
  error: string | null;    // Message d'erreur général
  
  // ... reste des propriétés
}
```

### 4. **Toutes les Fonctions sont Maintenant Async**

Avant (Synchrone avec données mock):
```typescript
const addSalle = (s: Omit<Salle, "id">) => setSalles(prev => [...prev, ...]);
```

Après (Asynchrone avec API):
```typescript
const addSalle = async (s: Omit<Salle, "id">) => {
  try {
    const newSalle = await salleService.create(s);
    setSalles((prev) => [...prev, newSalle]);
  } catch (err) {
    setError(message);
    throw err;
  }
};
```

### 5. **Gestion des Erreurs Améliorée**

- Chaque opération définit `error` en cas de problème
- Les erreurs sont lancées pour être gérées au niveau de l'appelant
- Messages d'erreur français cohérents

### 6. **Authentification Réelle**

Avant:
```typescript
const login = (email: string, password: string): boolean => {
  const user = utilisateurs.find(u => u.email === email && u.password === password);
  // ... comparaison en mémoire
};
```

Après:
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  const response = await authService.login({ email, password });
  const user = await authService.getCurrentUser();
  setCurrentUser(user);
  return true;
};
```

### 7. **Chargement des Données Initiales**

À la connexion, le contexte charge automatiquement:
- Salles (tous les rôles)
- Utilisateurs/Admins (superadmin)
- Données spécifiques à la salle de l'utilisateur (catégories, postes, clients, sessions, etc.)
- Configurations (bonus, promo)

```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const sallesData = await salleService.getAll();
      setSalles(sallesData);
      
      // Charger les données spécifiques à la salle
      const [categoriesData, clientsData, ...] = await Promise.allSettled([...]);
      
    } catch (err) {
      setError(message);
    }
  };
  
  loadData();
}, [currentUser]);
```

## 🔌 Endpoints Backend Utilisés

### Authentification
- `POST /auth/login` - Connexion
- `GET /auth/me` - Récupérer l'utilisateur actuel
- `POST /auth/logout` - Déconnexion

### Superadmin
- `GET/POST /superadmin/salles` - Salles
- `PATCH/DELETE /superadmin/salles/:id` - Modification/suppression
- `GET/POST/PATCH /superadmin/admins` - Gestion des admins
- `POST /superadmin/licences/generer` - Génération de licences

### Admin
- `GET/POST/PATCH/DELETE /admin/categories` - Catégories
- `GET/POST/PATCH/DELETE /admin/durees-prix` - Durées/prix
- `GET/POST/PATCH/DELETE /admin/postes` - Postes
- `GET/POST /admin/coupons` - Coupons
- `GET/POST /admin/promotions` - Promotions
- `PATCH /admin/bonus-config/:salleId` - Configuration bonus
- `PATCH /admin/promo-config/:salleId` - Configuration promo

### Gérant
- `GET/POST /gerant/clients` - Clients
- `GET/POST /gerant/sessions` - Sessions
- `POST /gerant/sessions/:id/stop` - Arrêt session
- `GET/POST /gerant/recharges` - Recharges
- `POST /gerant/recharges/:id/validate` - Validation recharge
- `POST /gerant/coupons/use` - Utilisation coupon

### Licence
- `POST /licence/activer` - Activation licence
- `GET /licence/statut` - Statut licence

## 🛠️ Utilisation dans les Composants

### Avant (Données mock synchrones):
```typescript
const { salles, addSalle } = useApp();

const handleAddSalle = (data) => {
  addSalle(data);  // Synchrone, immédiat
};
```

### Après (API asynchrone):
```typescript
const { salles, addSalle, isLoading, error } = useApp();

const handleAddSalle = async (data) => {
  try {
    await addSalle(data);  // Asynchrone, appel API
    // Afficher succès
  } catch (err) {
    // Afficher erreur
  }
};

// Template
{isLoading && <Loader />}
{error && <ErrorAlert message={error} />}
{salles.map(s => <SalleCard key={s.id} salle={s} />)}
```

## ⚠️ Points d'Attention

### 1. **Toutes les Fonctions sont Async**
Vous devez utiliser `await` ou `.then()` pour toutes les opérations:
```typescript
await addSalle(data);  // ✅ Correct
await updateClient(id, data);  // ✅ Correct
addSalle(data);  // ❌ Erreur (oubli d'await)
```

### 2. **Gestion des Erreurs Obligatoire**
```typescript
try {
  await addSalle(data);
} catch (err) {
  // Gérer l'erreur
}
```

### 3. **Token d'Authentification**
Le token est automatiquement géré par axios via les intercepteurs:
```typescript
// Dans axios.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. **Chargement des Données**
Ne plus accéder aux données avant que le contexte soit chargé:
```typescript
const { salles, isLoading } = useApp();

if (isLoading) return <Loader />;
if (!salles.length) return <Empty />;
return <SalleList salles={salles} />;
```

## 📝 Notes de Développement

- Les données sont chargées au montage et à chaque changement d'utilisateur
- Le timer pour les sessions fonctionne toujours (décrémente `secondsRemaining`)
- Les configurations de bonus/promo utilisent la salle de l'utilisateur actuel
- Tous les appels API utilisent le `baseURL` défini dans `axios.ts`
- Les erreurs réseau/authentification sont automatiquement gérées

## ✅ Checklist de Migration

- [x] Services API créés
- [x] AppContext modifié pour utiliser les APIs
- [x] Authentification intégrée
- [x] Gestion des erreurs implémentée
- [x] Chargement des données au montage
- [x] États `isLoading` et `error` ajoutés
- [ ] Endpoints backend à créer selon les besoins
- [ ] Tests des composants utilisant AppContext à mettre à jour
- [ ] UI mise à jour pour afficher les états de chargement/erreur

## 🚀 Prochaines Étapes

1. **Créer les endpoints manquants du backend** (Admin, Gérant, Client routes)
2. **Tester chaque endpoint** avec Postman
3. **Mettre à jour les composants** pour gérer les appels asynchrones
4. **Ajouter les indicateurs de chargement** dans l'UI
5. **Implémenter la gestion des erreurs** dans les formulaires
