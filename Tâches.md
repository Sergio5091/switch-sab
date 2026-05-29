# SWITCH SAB — Plan de tâches ordonné

**Stack : React · Node.js/Express · PostgreSQL**

**Équipe : Alessio (backend) · Mathieu (frontend) · Sergio (IoT/switch)**
 
---
 
## ⚠️ NOTES CRITIQUES (lire avant de commencer)
 
> Ces points peuvent bloquer tout le projet s'ils sont ignorés.
 
1. **Ordre de construction obligatoire** : Super Admin → Admin → Gérant → Client. Chaque couche dépend de celle d'au-dessus. Ne pas commencer le frontend d'un rôle sans que son backend soit terminé et testé.

2. **Le switch physique (USB/WIFI) est un risque externe** : si Sergio est en retard, Mathieu et Alessio doivent prévoir des mocks (simulateurs d'allumage/extinction) pour ne pas bloquer le reste.

3. **La licence hors-ligne est critique** : un code alphanumérique sans O ni 0, validé sans internet. La logique de génération/vérification doit être irréversible (algorithme de signature). À définir avec l'équipe dès J1.

4. **Multi-salle** : l'architecture BDD doit isoler les données par salle dès le début (`salle_id` sur toutes les tables métier). Impossible à corriger proprement après coup.

5. **Gestion du temps en temps réel** : le décompte visible sur chaque poste et l'extinction automatique à zéro impliquent des WebSockets (ou SSE). À anticiper dans l'architecture backend dès le départ.

6. **Compte bonus + Code promo** : deux systèmes de crédit distincts du crédit principal. La BDD doit gérer 3 soldes par client (crédit monétaire, bonus temps, promo). Traiter ces systèmes comme de vrais modules séparés.

7. **Coupon imprimable** : les coupons (40 par A4, 3cm×2cm) nécessitent un module de génération PDF précis. Prévoir une lib dédiée (ex. PDFKit ou Puppeteer côté backend).
 
---
 
## PHASE 0 — Fondations & architecture
 
### 0.1 — Conception de la base de données

**Alessio**
 
- Modéliser toutes les tables : `salles`, `utilisateurs`, `roles`, `categories`, `durees_prix`, `postes`, `sessions_jeu`, `recharges`, `coupons`, `bonus`, `promos`, `licences`, `rapports`

- Ajouter `salle_id` comme clé étrangère sur toutes les tables métier

- Définir les contraintes d'intégrité (FK, unicité, index)

- Valider le schéma avec toute l'équipe avant la première migration

- Rédiger et exécuter les migrations initiales PostgreSQL
 
### 0.2 — Initialisation du projet backend

**Alessio**
 
- Créer le projet Node.js/Express

- Configurer la connexion PostgreSQL (pool, variables d'environnement)

- Mettre en place la structure de dossiers (routes, controllers, middlewares, services, models)

- Configurer les variables d'environnement (`.env`)

- Mettre en place le système de logging
 
### 0.3 — Initialisation du projet frontend

**Mathieu**
 
- Créer le projet React

- Configurer le routeur (React Router)

- Mettre en place la structure de dossiers (pages, components, hooks, services, contexts)

- Configurer Axios (ou fetch) avec intercepteurs JWT

- Configurer le contexte d'authentification global
 
### 0.4 — Définition du protocole IoT

**Sergio + Alessio**
 
- Choisir le protocole de communication entre le serveur et le switch (USB : série/HID, WIFI : HTTP local ou MQTT)

- Définir l'API d'interface : format des commandes envoyées au switch (allumer poste N, éteindre poste N)

- Rédiger le contrat d'interface (doc partagée) pour que Alessio puisse coder les appels sans attendre le hardware

- Créer un simulateur logiciel du switch (mock) pour débloquer Alessio et Mathieu
 
---
 
## PHASE 1 — Super Admin
 
> Rien n'existe sans cette phase. Alessio la code en premier.
 
### 1.1 — Endpoint d'authentification unique

**Alessio**
 
- `POST /auth/login` → vérifie email + mot de passe, retourne `{ token: JWT, role, id }`

- Le JWT contient : `id`, `role`, `salle_id`, `exp`

- Middleware de vérification JWT réutilisable pour toutes les routes protégées

- Middleware de vérification de rôle (`requireRole(["admin", "superadmin"])`)
 
### 1.2 — Compte Super Admin par défaut

**Alessio**
 
- Seed BDD : créer le compte super admin initial (email + mot de passe par défaut)

- Route `PATCH /superadmin/password` pour changer le mot de passe initial
 
### 1.3 — Gestion des salles

**Alessio**
 
- `POST /superadmin/salles` → créer une salle (nom, pays, ville, quartier, numéro service client)

- `GET /superadmin/salles` → lister toutes les salles

- `PATCH /superadmin/salles/:id` → modifier une salle

- `DELETE /superadmin/salles/:id` → désactiver une salle
 
### 1.4 — Système de licence

**Alessio**
 
- Algorithme de génération du code de demande (alphanumérique, sans O et 0, fonctionnel hors-ligne)

- Algorithme de vérification de la licence reçue (signature HMAC ou similaire)

- Logique de validité : si licence expirée → rapports masqués pendant 3 jours → application bloquée

- `POST /superadmin/licences/generer` → générer une licence pour une salle

- `POST /licences/activer` → l'admin insère sa licence, l'application se déverrouille

- `GET /licences/statut` → retourner les jours restants
 
### 1.5 — Gestion des comptes Admin

**Alessio**
 
- `POST /superadmin/admins` → créer un compte admin (nom, prénom, phone, salle associée)

- `GET /superadmin/admins` → lister les admins

- `PATCH /superadmin/admins/:id` → modifier / désactiver un admin

- Réinstallation système (reset complet d'une salle)
 
### 1.6 — Interface Super Admin

**Mathieu**
 
- Page de login unique (réutilisée pour tous les rôles)

- Lecture du JWT → redirection vers `<SuperAdminApp />`

- Dashboard Super Admin : liste des salles, statut des licences

- Formulaire création/édition de salle

- Formulaire création admin

- Affichage durée restante de la licence par salle

- Générateur de licence (UI pour saisir le code de demande et coller la licence générée)
 
---
 
## PHASE 2 — Admin
 
### 2.1 — Gestion des catégories

**Alessio**
 
- `POST /admin/categories` → créer une catégorie (PS4, PS5, XBOX…)

- `GET /admin/categories` → lister les catégories de la salle

- `PATCH /admin/categories/:id` → renommer / désactiver

- `DELETE /admin/categories/:id`
 
### 2.2 — Gestion des durées et prix

**Alessio**
 
- `POST /admin/categories/:id/durees` → ajouter une durée avec son prix (ex. 1H → 500F)

- `GET /admin/categories/:id/durees`

- `PATCH /admin/durees/:id`

- `DELETE /admin/durees/:id`
 
### 2.3 — Gestion des postes TV

**Alessio**
 
- `POST /admin/postes` → créer un poste (numéro, catégorie associée, image personnalisée, type switch USB/WIFI, adresse/port)

- `GET /admin/postes` → lister les postes de la salle

- `PATCH /admin/postes/:id` → modifier (image, catégorie, adresse switch)

- `DELETE /admin/postes/:id`
 
### 2.4 — Gestion des gérants

**Alessio**
 
- `POST /admin/gerants` → créer un compte gérant (nom, prénom, phone, contact urgence, salle)

- `GET /admin/gerants`

- `PATCH /admin/gerants/:id` → modifier / désactiver

- Qualification d'un utilisateur existant en gérant
 
### 2.5 — Configuration du système de bonus

**Alessio**
 
- `POST /admin/bonus/config` → définir la règle (ex. 1H de jeu = 5min de bonus)

- `GET /admin/bonus/config`

- `PATCH /admin/bonus/config` → modifier la règle

- Définir le seuil minimum pour débloquer le bonus

- Définir la durée de validité du bonus (1 mois par défaut)
 
### 2.6 — Configuration des codes promo

**Alessio**
 
- `POST /admin/promo/config` → définir le pourcentage de bonus parrain et la réduction invité

- `GET /admin/promo/config`

- `PATCH /admin/promo/config`
 
### 2.7 — Gestion des coupons

**Alessio**
 
- `POST /admin/coupons/generer` → générer N coupons d'une valeur donnée (500F, 1000F…)

- `GET /admin/coupons` → lister les coupons (actifs, utilisés)

- Logique d'unicité du code coupon (alphanumérique sécurisé)

- Endpoint de génération du PDF imprimable (40 coupons / A4, 3cm×2cm, nom salle + valeur + quartier)
 
### 2.8 — Espace promotion (côté admin)

**Alessio**
 
- `POST /admin/promotions` → créer une promotion (texte ou image)

- `POST /admin/promotions/:id/envoyer` → envoyer par SMS et/ou WhatsApp à tous les clients

- Intégration SMS (ex. Twilio ou API locale)

- Intégration WhatsApp (ex. WhatsApp Business API ou Twilio)

- `GET /admin/promotions` → lister les promotions
 
### 2.9 — Interface Admin

**Mathieu**
 
- Dashboard Admin : vue synthétique de la salle

- Gestion catégories (CRUD)

- Gestion durées/prix par catégorie (CRUD)

- Gestion postes (CRUD + upload image personnalisée)

- Gestion gérants (CRUD)

- Configuration bonus (formulaire)

- Configuration codes promo (formulaire)

- Gestion coupons : génération + téléchargement PDF

- Espace promotion : éditeur message/image + bouton envoi

- Affichage licence (jours restants)

- Paramètre switch : sélecteur USB / WIFI
 
---
 
## PHASE 3 — Gérant
 
### 3.1 — Gestion des clients

**Alessio**
 
- `POST /gerant/clients` → créer un client (pseudo, numéro de téléphone, flag enfant + code)

- `GET /gerant/clients` → lister les clients de la salle

- `GET /gerant/clients/:id` → détail client (soldes crédit, bonus, sessions)

- `PATCH /gerant/clients/:id` → modifier un client
 
### 3.2 — Rechargement de compte (méthode gérant)

**Alessio**
 
- `POST /gerant/recharges` → recharger le compte d'un client (choisir client, catégorie, durée)

- Déduction du solde monétaire du client

- Crédit de la durée sur le compte catégorie du client

- Enregistrement dans le rapport (heure, gérant, client, durée, montant)
 
### 3.3 — Validation de recharge (méthode client)

**Alessio**
 
- `GET /gerant/recharges/en-attente` → liste des recharges lancées par des clients, non encore validées

- `POST /gerant/recharges/:id/valider` → valider une recharge après encaissement cash
 
### 3.4 — Activation et contrôle des postes

**Alessio + Sergio**
 
- `POST /gerant/sessions` → démarrer une session (client, poste, durée choisie)

  - Vérifier que le client a le crédit de la bonne catégorie

  - Déduire la durée du compte catégorie du client

  - Envoyer la commande d'allumage au switch (USB ou WIFI selon config)

  - Démarrer le décompte en temps réel (WebSocket ou SSE)

- `POST /gerant/sessions/:id/arreter` → arrêter une session avant la fin

  - Envoyer la commande d'extinction au switch

  - Calculer et conserver le temps restant sur le compte du client

- Extinction automatique à zéro : tâche planifiée (cron ou timer) qui envoie la commande d'extinction
 
### 3.5 — Rapport du jour (gérant)

**Alessio**
 
- `GET /gerant/rapport/jour` → rapport filtré sur le jour en cours, uniquement pour les sessions de ce gérant

- Champs : nom client, heure début, heure fin, durée achetée, valeur, poste utilisé, flag bonus
 
### 3.6 — Interface Gérant

**Mathieu**
 
- Vue principale : grille des postes avec image personnalisée + décompte temps restant en temps réel

- Panneau de session : sélecteur client, sélecteur catégorie, sélecteur durée → bouton activer

- Badge sur chaque poste : temps restant affiché, indicateur actif/inactif

- Bouton arrêt sur chaque poste actif

- Liste des recharges clients en attente de validation

- Formulaire création/recherche client

- Rapport du jour (tableau filtrable)

- Intégration WebSocket/SSE pour mise à jour en temps réel des décomptes
 
---
 
## PHASE 4 — Client
 
### 4.1 — Création de compte client (self-service)

**Alessio**
 
- `POST /auth/register` → créer son propre compte (pseudo, téléphone) → rôle client par défaut

- Validation unicité du pseudo et du téléphone
 
### 4.2 — Rechargement par le client

**Alessio**
 
- `POST /client/recharges` → le client demande une recharge (montant) → statut "en attente"

- Le gérant valide (voir 3.3) → le solde est crédité
 
### 4.3 — Rechargement par coupon

**Alessio**
 
- `POST /client/coupons/activer` → le client saisit le code du coupon → son solde monétaire est crédité

- Vérification validité + marquage coupon comme utilisé
 
### 4.4 — Achat de temps et activation TV

**Alessio**
 
- `GET /client/postes-disponibles` → liste des postes libres par catégorie

- `POST /client/sessions` → le client clique sur un poste → démarre une session (si solde suffisant)

- Même logique d'allumage switch et décompte temps réel qu'en 3.4
 
### 4.5 — Code promo

**Alessio**
 
- `GET /client/mon-code-promo` → retourner le code promo personnel du client

- Lors de l'inscription avec un code promo : créditer le bonus invité (Y) et le bonus parrain (X)
 
### 4.6 — Compte bonus

**Alessio**
 
- Calcul automatique du bonus après chaque session (selon règle admin)

- Vérification du seuil → si atteint, bonus rendu disponible

- Vérification mensuelle : si inactif depuis 1 mois → remise à zéro du bonus

- `GET /client/mon-bonus` → solde bonus actuel et statut (disponible / en accumulation)

- `POST /client/sessions/bonus` → démarrer une session sur le compte bonus (si disponible)
 
### 4.7 — Espace promotions (côté client)

**Alessio**
 
- `GET /client/promotions` → voir les promotions actives de la salle
 
### 4.8 — Interface Client (mobile-first)

**Mathieu**
 
- Page d'accueil : postes disponibles par catégorie avec statut libre/occupé

- Affichage du solde (crédit monétaire + bonus)

- Bouton recharger → formulaire demande de recharge

- Saisie code coupon

- Code promo personnel (à partager)

- Vue promotions en cours

- Suivi session en cours (décompte visible)

- Zone meilleurs joueurs (classement décroissant par volume d'achat)
 
---
 
## PHASE 5 — Rapports complets (Admin)
 
### 5.1 — Endpoints rapports avancés

**Alessio**
 
- `GET /admin/rapports` avec filtres : `?debut=&fin=&gerant_id=&poste_id=&client_id=&periode=semaine|mois`

- Calcul du montant total par période

- Flag sessions jouées en bonus

- `GET /admin/rapports/export` → export CSV ou PDF du rapport filtré
 
### 5.2 — Interface rapports Admin

**Mathieu**
 
- Tableau de rapport avec filtres : par jour, semaine, mois, période personnalisée, par gérant, par poste, par client

- Affichage du total en bas de tableau

- Indicateur visuel sessions bonus vs sessions normales

- Bouton export (CSV / PDF)
 
---
 
## PHASE 6 — IoT switch (parallèle dès Phase 3)
 
**Sergio (avec Alessio pour l'API)**
 
### 6.1 — Module switch USB

- Développer le driver/service qui reçoit les commandes du backend et les envoie sur le port USB du switch

- Tester allumage / extinction sur chaque port USB

- Gestion des erreurs (poste non répondu, switch déconnecté)
 
### 6.2 — Module switch WIFI

- Développer le service qui envoie les commandes via WIFI (HTTP local ou MQTT) au switch

- Tester allumage / extinction

- Gestion des erreurs réseau
 
### 6.3 — Sélection dynamique du mode

- Le backend lit la config de la salle (USB ou WIFI) et route la commande vers le bon module

- Permettre à l'admin de changer le mode depuis l'interface (voir phase 2)
 
---
 
## PHASE 7 — Finalisation & polish
 
### 7.1 — Interface principale (admin/gérant)

**Mathieu**
 
- Personnalisation des images de postes (upload)

- Affichage numéro service technique (+229 0197691879) visible en permanence

- Affichage durée restante de la licence

- Zone meilleurs joueurs (classement)
 
### 7.2 — Génération PDF coupons

**Alessio + Mathieu**
 
- Générer un PDF A4 avec 40 coupons (3cm×2cm chacun) : nom salle, valeur, quartier

- Téléchargeable depuis l'interface admin
 
### 7.3 — Sécurité & tests

**Alessio + Mathieu**
 
- Vérifier que chaque route backend valide le JWT et le rôle

- Vérifier l'isolation des données par `salle_id` (un gérant ne voit pas les données d'une autre salle)

- Tests des cas limites : coupon déjà utilisé, licence expirée, solde insuffisant, poste déjà occupé

- Tests du décompte temps réel (WebSocket) sur longue durée

- Tests des commandes switch (USB + WIFI) en conditions réelles
 
### 7.4 — Déploiement

**Alessio**
 
- Configurer l'environnement de production (serveur, PostgreSQL, variables d'environnement)

- Mettre en place les sauvegardes automatiques de la BDD

- Configurer HTTPS

- Documenter la procédure d'installation pour chaque nouvelle salle
 
---
 
## Récapitulatif de l'ordre de livraison
 
| Ordre | Phase | Qui | Débloque |

|-------|-------|-----|----------|

| 1 | 0 — Fondations | Tous | Tout le reste |

| 2 | 1 — Super Admin | Alessio + Mathieu | Création des salles et licences |

| 3 | 2 — Admin | Alessio + Mathieu | Catégories, postes, gérants |

| 4 | 3 — Gérant | Alessio + Mathieu + Sergio | Sessions, recharges, rapport jour |

| 5 | 4 — Client | Alessio + Mathieu | Self-service, coupons, bonus |

| 6 | 5 — Rapports | Alessio + Mathieu | Visibilité complète admin |

| 7 | 6 — IoT Switch | Sergio (en parallèle dès phase 3) | Contrôle physique des TV |

| 8 | 7 — Finalisation | Tous | Livraison finale |
 