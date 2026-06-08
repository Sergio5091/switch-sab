# Projet 2 — Switch SAB App Salle
## Contexte complet pour démarrage rapide

---

## 1. Vue d'ensemble

Le Projet 2 est l'application installée dans **chaque salle de jeux physique**.
Il est distinct du Projet 1 (Switch SAB — Super Admin) qui gère les licences et les salles.

### Qui utilise quoi

| Rôle | Application | Accès |
|---|---|---|
| Super Admin | Projet 1 (switch-sab) | Gestion salles + licences |
| Admin | Projet 2 | Gestion de SA salle uniquement |
| Gérant | Projet 2 | Opérations du jour (sessions, recharges) |
| Client | Projet 2 | Self-service (recharge, coupon, bonus) |

---

## 2. Stack technique

- **Backend** : Node.js / Express (ESM — `"type": "module"`)
- **BDD** : PostgreSQL via Prisma ORM (adapter `@prisma/adapter-pg`)
- **Auth** : JWT (jsonwebtoken + bcryptjs)
- **Frontend** : React 18 + Vite + TypeScript
- **Routing frontend** : Wouter
- **UI** : Tailwind CSS v4 + Radix UI + shadcn/ui
- **Requêtes** : Axios avec intercepteur JWT
- **Temps réel** : Socket.io (décompte sessions, statut postes)
- **PDF coupons** : PDFKit ou Puppeteer (à choisir)
- **SMS/WhatsApp** : Twilio (à intégrer Phase 2.8)

---

## 3. Schéma de base de données complet

Le schéma Prisma du Projet 2 doit contenir ces modèles (différent du Projet 1) :

```prisma
enum Role {
  CLIENT
  GERANT
  ADMIN
  SUPERADMIN  // pas utilisé dans Projet 2, mais présent pour cohérence
}

enum StatutSession { ACTIVE, ARRETEE, TERMINEE }
enum StatutPoste   { LIBRE, OCCUPE }
enum TypeTransaction {
  RECHARGE_GERANT, RECHARGE_CLIENT, RECHARGE_COUPON, SESSION, BONUS
}

model Salle {
  id           Int      @id @default(autoincrement())
  nom          String
  pays         String
  ville        String
  quartier     String
  telephone    String
  disabled     Boolean  @default(false)
  switchType   String   @default("WIFI")   // "USB" ou "WIFI"
  switchConfig String?                      // IP ou port COM
  createdAt    DateTime @default(now())

  users      User[]
  categories Categorie[]
  promos     Promo[]
  licences   LicenceLocale[]
}

model User {
  id           Int      @id @default(autoincrement())
  pseudo       String   @unique
  email        String?  @unique
  nom          String?
  prenom       String?
  telephone    String   @unique
  motDePasse   String
  role         Role     @default(CLIENT)
  estEnfant    Boolean  @default(false)
  codeParental String?
  telUrgence   String?                      // pour les gérants
  salleId      Int?
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())

  salle          Salle?        @relation(...)
  sessions       Session[]     @relation("ClientSessions")
  sessionsGerant Session[]     @relation("GerantSessions")
  credits        Credit[]
  transactions   Transaction[]
  bonus          Bonus?
  promoCode      PromoCode?
}

model Categorie {
  id      Int    @id @default(autoincrement())
  nom     String                              // "PS4", "PS5", "XBOX"
  salleId Int

  salle   Salle    @relation(...)
  durees  Duree[]
  postes  Poste[]
  credits Credit[]
}

model Duree {
  id          Int    @id @default(autoincrement())
  libelle     String                          // "30min", "1H", "2H"
  secondes    Int                             // durée en secondes
  prix        Float
  categorieId Int

  categorie Categorie @relation(...)
  sessions  Session[]
}

model Poste {
  id          Int         @id @default(autoincrement())
  nom         String
  image       String?                         // URL image personnalisée
  statut      StatutPoste @default(LIBRE)
  categorieId Int

  categorie Categorie @relation(...)
  sessions  Session[]
}

model Session {
  id           Int           @id @default(autoincrement())
  clientId     Int
  gerantId     Int
  posteId      Int
  dureeId      Int
  debut        DateTime      @default(now())
  fin          DateTime?
  tempsRestant Int                            // en secondes
  statut       StatutSession @default(ACTIVE)
  estBonus     Boolean       @default(false)
  createdAt    DateTime      @default(now())
}

model Credit {
  id          Int @id @default(autoincrement())
  clientId    Int
  categorieId Int
  solde       Int @default(0)                // en secondes

  @@unique([clientId, categorieId])
}

model Transaction {
  id       Int             @id @default(autoincrement())
  clientId Int
  montant  Float
  type     TypeTransaction
  date     DateTime        @default(now())
  gerantId Int?
}

model Coupon {
  id        Int      @id @default(autoincrement())
  code      String   @unique                 // alphanumérique sans O ni 0
  valeur    Float
  utilise   Boolean  @default(false)
  salleId   Int
  createdAt DateTime @default(now())
}

model Bonus {
  id               Int      @id @default(autoincrement())
  clientId         Int      @unique
  solde            Int      @default(0)      // en secondes
  disponible       Boolean  @default(false)
  derniereActivite DateTime @default(now())
}

model ConfigBonus {
  id              Int   @id @default(autoincrement())
  salleId         Int   @unique              // une config par salle
  ratioSecondes   Int                        // secondes bonus / heure jouée
  seuilDeblocage  Int                        // secondes pour débloquer
  validitejours   Int   @default(30)
  reductionInvite Float @default(0)          // % réduction client invité
  bonusParrain    Float @default(0)          // % bonus parrain
}

model PromoCode {
  id           Int      @id @default(autoincrement())
  clientId     Int      @unique
  code         String   @unique
  utilisations Int      @default(0)
  createdAt    DateTime @default(now())
}

model Promo {
  id        Int      @id @default(autoincrement())
  titre     String
  message   String?
  image     String?
  salleId   Int
  createdAt DateTime @default(now())
  envoyee   Boolean  @default(false)
}

// Licence locale — copie de la licence générée par le Projet 1
// Vérifiée hors-ligne avec la clé publique RSA
model LicenceLocale {
  id        Int      @id @default(autoincrement())
  licenceId String   @unique
  salleId   Int
  machineId String
  issuedAt  DateTime
  expiresAt DateTime
  status    String   @default("ACTIVE")
  signature String
  createdAt DateTime @default(now())
}
```

---

## 4. Architecture backend Projet 2

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           → login, register, me
│   │   ├── admin/          → categories, durees, postes, gerants, bonus, promo, coupons, promotions
│   │   ├── gerant/         → clients, recharges, sessions, rapport-jour
│   │   ├── client/         → recharges, coupons, sessions, bonus, promo
│   │   ├── rapports/       → rapports admin avec filtres + export
│   │   └── licence/        → vérification licence locale hors-ligne
│   ├── switch/
│   │   ├── mockSwitch.js   → simulateur (déjà fait dans Projet 1)
│   │   ├── switchService.js → routeur USB/WIFI (déjà fait dans Projet 1)
│   │   ├── usbSwitch.js    → driver USB (Phase 6.1 — Sergio)
│   │   └── wifiSwitch.js   → driver WIFI (Phase 6.2 — Sergio)
│   ├── middlewares/
│   │   ├── auth.middleware.js   → verifyJwt + requireRole
│   │   └── licence.middleware.js → vérifie que la licence est valide avant chaque requête
│   ├── services/
│   │   └── prismaClient.js
│   ├── config/
│   │   ├── cors.js
│   │   └── logger.js
│   ├── socket.js           → WebSocket pour décompte temps réel
│   └── index.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── keys/
│   └── public-key.pem      ← SEULEMENT la clé publique (pas la privée)
└── .env
```

---

## 5. Routes API complètes

### Auth
```
POST /auth/login          → { email/telephone, motDePasse } → JWT
POST /auth/register       → créer compte client
GET  /auth/me             → utilisateur courant
```

### Admin (protégé ADMIN)
```
POST   /admin/categories
GET    /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id

POST   /admin/categories/:id/durees
GET    /admin/categories/:id/durees
PATCH  /admin/durees/:id
DELETE /admin/durees/:id

POST   /admin/postes
GET    /admin/postes
PATCH  /admin/postes/:id
DELETE /admin/postes/:id

POST   /admin/gerants
GET    /admin/gerants
PATCH  /admin/gerants/:id

POST   /admin/bonus/config
GET    /admin/bonus/config
PATCH  /admin/bonus/config

GET    /admin/promo/config
PATCH  /admin/promo/config

POST   /admin/coupons/generer     → { nombre, valeur }
GET    /admin/coupons             → ?statut=actif|utilise
GET    /admin/coupons/pdf         → télécharger PDF 40 coupons / A4

POST   /admin/promotions
GET    /admin/promotions
POST   /admin/promotions/:id/envoyer
```

### Gérant (protégé GERANT)
```
POST   /gerant/clients
GET    /gerant/clients
GET    /gerant/clients/:id
PATCH  /gerant/clients/:id

POST   /gerant/recharges
GET    /gerant/recharges/en-attente
POST   /gerant/recharges/:id/valider

POST   /gerant/sessions
POST   /gerant/sessions/:id/arreter

GET    /gerant/rapport/jour
```

### Client (protégé CLIENT)
```
POST   /client/recharges
POST   /client/coupons/activer

GET    /client/postes-disponibles
POST   /client/sessions
POST   /client/sessions/bonus

GET    /client/mon-code-promo
GET    /client/mon-bonus
GET    /client/promotions
```

### Rapports (protégé ADMIN)
```
GET    /admin/rapports?debut=&fin=&gerant_id=&poste_id=&client_id=&periode=
GET    /admin/rapports/export
```

### Switch (interne — appelé par les sessions)
```
POST   /switch/allumer    → { posteId }
POST   /switch/eteindre   → { posteId }
GET    /switch/statut/:posteId
GET    /switch/statuts
```

### Licence
```
GET    /licence/statut    → jours restants + statut (hors-ligne)
POST   /licence/activer   → installer une nouvelle licence (fichier JSON)
```

---

## 6. Règles métier critiques

### Isolation multi-salle
- **Toutes** les requêtes filtrent par `salleId` extrait du JWT
- Un gérant ne voit jamais les données d'une autre salle
- Pattern : `where: { salleId: req.user.salle_id }`

### JWT payload
```js
{ id, role, salle_id, exp }
```

### 3 soldes par client
```
Credit (par catégorie)  → solde en secondes, ex: 7200s de PS4
Bonus.solde             → secondes de bonus accumulées
PromoCode               → code parrain personnel du client
```

### Génération code coupon
- Alphanumérique **sans O ni 0** (confusion visuelle)
- Format : `XXXX-XXXX`
- Charset : `ABCDEFGHIJKLMNPQRSTUVWXYZ123456789`

### Extinction automatique
- Quand `tempsRestant` atteint 0 → `eteindrePoste(posteId)` via switchService
- Implémenté avec `setTimeout` ou `node-cron` au démarrage de session

### Vérification licence hors-ligne
```js
// Au démarrage du serveur Projet 2
import { verifyLicencePayload } from './utils/crypto.js'
const licence = await prisma.licenceLocale.findFirst({ where: { status: 'ACTIVE' } })
const valide = verifyLicencePayload(payload, licence.signature)
const expiree = new Date(licence.expiresAt) < new Date()
// Si invalide → logger l'erreur, bloquer les routes non-auth
```

---

## 7. WebSocket — décompte temps réel

```js
// Événements Socket.io
'session:start'   → { sessionId, posteId, tempsRestant }
'session:tick'    → { sessionId, posteId, tempsRestant }  // chaque seconde
'session:end'     → { sessionId, posteId }
'session:stop'    → { sessionId, posteId }                // arrêt manuel
```

Le frontend s'abonne à ces événements pour afficher le décompte sur chaque poste.

---

## 8. Ce que Sergio apporte (IoT)

Les fichiers suivants sont **déjà écrits** dans le Projet 1 et doivent être copiés dans le Projet 2 :

| Fichier | Statut | Description |
|---|---|---|
| `switch/mockSwitch.js` | ✅ Fait | Simulateur 6 postes |
| `switch/switchService.js` | ✅ Fait | Routeur USB/WIFI automatique |
| `switch/usbSwitch.js` | ⏳ Phase 6.1 | Driver USB réel |
| `switch/wifiSwitch.js` | ⏳ Phase 6.2 | Driver WIFI réel |
| `CONTRAT_INTERFACE_SWITCH.md` | ✅ Fait | Contrat d'interface |

Le `switchService.js` lit `salle.switchType` en BDD et route automatiquement.
Alessio appelle juste `allumerPoste(posteId)` et `eteindrePoste(posteId)`.

---

## 9. Seed Projet 2

```
Super Admin → superadmin@switchsab.local / super123
Admin       → admin@switchsab.local      / admin123
Gérant 1    → gerant1@switchsab.local    / gerant123
Gérant 2    → gerant2@switchsab.local    / gerant123
Clients     → kofi, amina, yann, fatou, marcus / client123

Salle       → Switch SAB Cotonou (Akpakpa, Bénin)
Catégories  → PS4, PS5, XBOX (avec durées et prix)
Postes      → 6 postes (2 par catégorie)
Config bonus → 5min / heure, seuil 1H, validité 30j
```

---

## 10. Variables d'environnement Projet 2

```env
PORT=3001
FRONTEND_URL=http://localhost:5174
DATABASE_URL=postgresql://postgres:root@localhost:5433/switchsab_app
JWT_SECRET=<secret_fort>
LICENCE_PUBLIC_KEY_PATH=./keys/public-key.pem
# Pas de clé privée ici — elle reste dans le Projet 1
TWILIO_ACCOUNT_SID=<sid>        # Phase 2.8
TWILIO_AUTH_TOKEN=<token>       # Phase 2.8
TWILIO_PHONE_NUMBER=<numero>    # Phase 2.8
```

---

## 11. Ordre de construction (rappel)

```
Phase 0 → Fondations (schéma BDD, structure projet)
Phase 1 → Auth + middleware licence
Phase 2 → Admin (catégories, postes, gérants, bonus, coupons, promotions)
Phase 3 → Gérant (clients, recharges, sessions + switch)
Phase 4 → Client (self-service, coupons, bonus, promo)
Phase 5 → Rapports admin
Phase 6 → IoT switch USB/WIFI (Sergio, en parallèle dès Phase 3)
Phase 7 → Finalisation (PDF coupons, sécurité, déploiement)
```

**Règle absolue** : ne pas commencer le frontend d'un rôle sans que son backend soit terminé et testé.
