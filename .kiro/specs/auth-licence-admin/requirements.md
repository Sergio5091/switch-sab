# Document de Spécifications — auth-licence-admin

## Introduction

Ce document décrit les exigences du système d'authentification, de gestion des licences et d'administration des salles pour l'application **switch-sab**. Ce système constitue la couche fondatrice (Phase 1) de l'application : il permet au Super Admin de gérer les salles, d'émettre des licences, de créer des comptes Admin, et fournit le mécanisme d'authentification JWT partagé par tous les rôles.

Le backend est développé en Node.js/Express avec Prisma ORM et PostgreSQL. Le système doit fonctionner en environnement multi-salle, chaque salle étant isolée par un `salle_id`.

---

## Glossary

- **Auth_Service** : Le service backend responsable de l'authentification et de la génération des JWT.
- **JWT_Middleware** : Le middleware Express qui vérifie et décode les tokens JWT sur les routes protégées.
- **Role_Middleware** : Le middleware Express qui vérifie que le rôle de l'utilisateur authentifié est autorisé pour une route donnée.
- **SuperAdmin** : L'utilisateur de niveau le plus élevé, unique, qui gère les salles, les licences et les comptes Admin. N'est rattaché à aucune salle.
- **Admin** : L'utilisateur rattaché à une salle spécifique, responsable de la configuration de cette salle.
- **Salle** : Une salle de jeux physique identifiée par un `id`, un nom, un pays, une ville, un quartier et un numéro de service client.
- **Licence** : Un code alphanumérique signé (HMAC) associé à une salle, définissant une période de validité.
- **Licence_Service** : Le service backend responsable de la génération, de la vérification et du suivi de l'état des licences.
- **Code_Demande** : Un code alphanumérique généré côté salle (sans les caractères `O`, `0`, `I`, `1`) permettant au SuperAdmin d'identifier la salle lors de la génération d'une licence, utilisable hors-ligne.
- **Seed** : Le script d'initialisation de la base de données qui crée le compte SuperAdmin par défaut.
- **Période_Grace** : La période de 3 jours suivant l'expiration d'une licence pendant laquelle l'application reste partiellement fonctionnelle (rapports masqués).
- **Blocage** : L'état de l'application après la Période_Grace, où toutes les fonctionnalités sont inaccessibles jusqu'à activation d'une nouvelle licence.

---

## Requirements

### Requirement 1 : Authentification par JWT

**User Story:** En tant qu'utilisateur (SuperAdmin, Admin, Gérant, Client), je veux me connecter avec mon email/téléphone et mon mot de passe, afin d'obtenir un token JWT me permettant d'accéder aux routes protégées selon mon rôle.

#### Acceptance Criteria

1. WHEN une requête `POST /auth/login` est reçue avec un email et un mot de passe valides, THE Auth_Service SHALL retourner un objet JSON contenant `{ token, role, id }` avec un statut HTTP 200.
2. WHEN une requête `POST /auth/login` est reçue, THE Auth_Service SHALL générer un JWT contenant les champs `id`, `role`, `salle_id` et `exp` (expiration à 24 heures).
3. IF le mot de passe fourni ne correspond pas au hash bcrypt stocké, THEN THE Auth_Service SHALL retourner une erreur HTTP 401 avec le message `"Identifiants invalides"`.
4. IF l'email fourni n'existe pas dans la base de données, THEN THE Auth_Service SHALL retourner une erreur HTTP 401 avec le message `"Identifiants invalides"`.
5. IF le compte utilisateur est désactivé, THEN THE Auth_Service SHALL retourner une erreur HTTP 403 avec le message `"Compte désactivé"`.
6. WHEN une requête est reçue sur une route protégée, THE JWT_Middleware SHALL vérifier la signature du token JWT avec la clé secrète définie dans les variables d'environnement.
7. IF le token JWT est absent, expiré ou invalide, THEN THE JWT_Middleware SHALL retourner une erreur HTTP 401 avec le message `"Token invalide ou manquant"`.
8. WHEN une route protégée est accédée avec un token valide, THE JWT_Middleware SHALL injecter les données décodées (`id`, `role`, `salle_id`) dans l'objet `req.user` pour les middlewares suivants.
9. WHEN le Role_Middleware est appliqué à une route avec une liste de rôles autorisés, THE Role_Middleware SHALL vérifier que `req.user.role` figure dans cette liste.
10. IF `req.user.role` ne figure pas dans la liste des rôles autorisés, THEN THE Role_Middleware SHALL retourner une erreur HTTP 403 avec le message `"Accès refusé : rôle insuffisant"`.

---

### Requirement 2 : Compte SuperAdmin par défaut

**User Story:** En tant que développeur déployant l'application pour la première fois, je veux qu'un compte SuperAdmin initial soit créé automatiquement, afin de pouvoir me connecter et configurer le système sans intervention manuelle.

#### Acceptance Criteria

1. WHEN le script Seed est exécuté, THE Seed SHALL créer un utilisateur avec le rôle `SUPERADMIN`, l'email `superadmin@switch-sab.com` et un mot de passe haché par bcrypt avec un coût de 12.
2. WHEN le script Seed est exécuté une seconde fois, THE Seed SHALL ne pas créer de doublon et ignorer silencieusement la création si le compte SuperAdmin existe déjà.
3. WHEN une requête `PATCH /superadmin/password` est reçue avec un `ancien_mot_de_passe` et un `nouveau_mot_de_passe`, THE Auth_Service SHALL vérifier que l'ancien mot de passe correspond au hash stocké avant d'effectuer la mise à jour.
4. IF l'ancien mot de passe fourni est incorrect, THEN THE Auth_Service SHALL retourner une erreur HTTP 400 avec le message `"Ancien mot de passe incorrect"`.
5. WHEN le nouveau mot de passe est validé, THE Auth_Service SHALL le hacher avec bcrypt (coût 12) et mettre à jour l'enregistrement en base de données.
6. THE Auth_Service SHALL exiger que le nouveau mot de passe contienne au minimum 8 caractères.
7. IF le nouveau mot de passe contient moins de 8 caractères, THEN THE Auth_Service SHALL retourner une erreur HTTP 400 avec le message `"Le mot de passe doit contenir au moins 8 caractères"`.

---

### Requirement 3 : Gestion des salles

**User Story:** En tant que SuperAdmin, je veux créer, consulter, modifier et désactiver des salles, afin de gérer le parc de salles de jeux de l'entreprise.

#### Acceptance Criteria

1. WHEN une requête `POST /superadmin/salles` est reçue avec les champs `nom`, `pays`, `ville`, `quartier` et `telephone`, THE Auth_Service SHALL créer un enregistrement `Salle` en base de données et retourner la salle créée avec un statut HTTP 201.
2. IF l'un des champs obligatoires (`nom`, `pays`, `ville`, `quartier`, `telephone`) est absent, THEN THE Auth_Service SHALL retourner une erreur HTTP 400 avec la liste des champs manquants.
3. WHEN une requête `GET /superadmin/salles` est reçue, THE Auth_Service SHALL retourner la liste complète des salles avec leur statut actif/inactif et le statut de leur licence courante.
4. WHEN une requête `PATCH /superadmin/salles/:id` est reçue avec des champs à modifier, THE Auth_Service SHALL mettre à jour uniquement les champs fournis et retourner la salle mise à jour.
5. IF l'identifiant de salle fourni dans `PATCH /superadmin/salles/:id` ne correspond à aucun enregistrement, THEN THE Auth_Service SHALL retourner une erreur HTTP 404 avec le message `"Salle introuvable"`.
6. WHEN une requête `DELETE /superadmin/salles/:id` est reçue, THE Auth_Service SHALL désactiver la salle en passant son champ `actif` à `false` sans supprimer l'enregistrement de la base de données.
7. IF l'identifiant de salle fourni dans `DELETE /superadmin/salles/:id` ne correspond à aucun enregistrement, THEN THE Auth_Service SHALL retourner une erreur HTTP 404 avec le message `"Salle introuvable"`.
8. THE Auth_Service SHALL protéger toutes les routes `/superadmin/salles` avec le JWT_Middleware et le Role_Middleware restreint au rôle `SUPERADMIN`.

---

### Requirement 4 : Génération du code de demande de licence

**User Story:** En tant qu'Admin d'une salle, je veux générer un code de demande hors-ligne, afin de le transmettre au SuperAdmin pour obtenir une licence d'activation.

#### Acceptance Criteria

1. THE Licence_Service SHALL générer un code de demande alphanumérique en utilisant uniquement les caractères `A-Z` et `2-9` (excluant `O`, `0`, `I`, `1` pour éviter les confusions visuelles).
2. THE Licence_Service SHALL inclure dans le code de demande un identifiant de salle encodé et un horodatage, de sorte que le code soit unique par salle et par période.
3. THE Licence_Service SHALL générer le code de demande sans nécessiter de connexion réseau (algorithme purement local).
4. THE Licence_Service SHALL produire un code de demande d'une longueur fixe de 16 caractères, formaté en groupes de 4 séparés par des tirets (ex. `ABCD-EF23-GH45-JK67`).

---

### Requirement 5 : Génération et activation de licence

**User Story:** En tant que SuperAdmin, je veux générer une licence pour une salle à partir de son code de demande, et en tant qu'Admin, je veux activer cette licence pour déverrouiller l'application.

#### Acceptance Criteria

1. WHEN une requête `POST /superadmin/licences/generer` est reçue avec un `salle_id`, une `duree_jours` et un `code_demande`, THE Licence_Service SHALL générer une licence signée par HMAC-SHA256 en utilisant la clé secrète définie dans les variables d'environnement.
2. THE Licence_Service SHALL encoder dans la licence le `salle_id`, la date de début, la date de fin et un hash de vérification, de sorte que toute altération du contenu invalide la signature.
3. WHEN une requête `POST /licences/activer` est reçue avec un code de licence, THE Licence_Service SHALL vérifier la signature HMAC du code avant d'enregistrer la licence.
4. IF la signature HMAC du code de licence est invalide, THEN THE Licence_Service SHALL retourner une erreur HTTP 400 avec le message `"Licence invalide"`.
5. IF le `salle_id` encodé dans la licence ne correspond pas à la salle de l'Admin authentifié, THEN THE Licence_Service SHALL retourner une erreur HTTP 403 avec le message `"Cette licence n'appartient pas à votre salle"`.
6. WHEN une licence valide est activée, THE Licence_Service SHALL créer un enregistrement `Licence` en base de données avec les dates de début et de fin extraites du code, et retourner un statut HTTP 200.
7. WHEN une requête `GET /licences/statut` est reçue, THE Licence_Service SHALL retourner le nombre de jours restants avant expiration de la licence active de la salle de l'Admin authentifié.
8. IF aucune licence active n'existe pour la salle, THEN THE Licence_Service SHALL retourner `{ jours_restants: 0, statut: "AUCUNE_LICENCE" }`.

---

### Requirement 6 : Logique de validité et blocage par licence

**User Story:** En tant que système, je veux appliquer automatiquement les restrictions liées à l'expiration de la licence, afin de garantir que les salles renouvellent leur abonnement.

#### Acceptance Criteria

1. WHILE la licence d'une salle est valide (date courante ≤ date de fin), THE Licence_Service SHALL retourner le statut `"ACTIVE"` avec le nombre de jours restants.
2. WHEN la date courante dépasse la date de fin de la licence, THE Licence_Service SHALL passer le statut de la salle en `"GRACE"` et masquer les endpoints de rapport (`/admin/rapports`, `/gerant/rapport`) en retournant HTTP 403.
3. WHILE une salle est en statut `"GRACE"`, THE Licence_Service SHALL maintenir cet état pendant exactement 3 jours calendaires après la date d'expiration.
4. WHEN les 3 jours de Période_Grace sont écoulés, THE Licence_Service SHALL passer le statut de la salle en `"BLOQUEE"` et retourner HTTP 403 sur toutes les routes protégées de cette salle, à l'exception de `POST /licences/activer` et `GET /licences/statut`.
5. WHEN une nouvelle licence valide est activée sur une salle en statut `"GRACE"` ou `"BLOQUEE"`, THE Licence_Service SHALL rétablir immédiatement le statut `"ACTIVE"` et lever toutes les restrictions.
6. THE Licence_Service SHALL exposer un middleware réutilisable `checkLicence` qui vérifie le statut de la licence de la salle extraite du JWT avant d'autoriser l'accès à une route protégée.

---

### Requirement 7 : Gestion des comptes Admin

**User Story:** En tant que SuperAdmin, je veux créer, consulter et modifier des comptes Admin associés à des salles, afin de déléguer la gestion opérationnelle de chaque salle.

#### Acceptance Criteria

1. WHEN une requête `POST /superadmin/admins` est reçue avec les champs `nom`, `prenom`, `telephone`, `salle_id` et `mot_de_passe`, THE Auth_Service SHALL créer un utilisateur avec le rôle `ADMIN`, hacher le mot de passe avec bcrypt (coût 12), et retourner l'utilisateur créé (sans le mot de passe) avec un statut HTTP 201.
2. IF le `salle_id` fourni ne correspond à aucune salle active, THEN THE Auth_Service SHALL retourner une erreur HTTP 404 avec le message `"Salle introuvable ou inactive"`.
3. IF le numéro de téléphone fourni est déjà utilisé par un autre utilisateur, THEN THE Auth_Service SHALL retourner une erreur HTTP 409 avec le message `"Ce numéro de téléphone est déjà utilisé"`.
4. WHEN une requête `GET /superadmin/admins` est reçue, THE Auth_Service SHALL retourner la liste de tous les utilisateurs avec le rôle `ADMIN`, incluant leur nom, prénom, téléphone, salle associée et statut actif/inactif.
5. WHEN une requête `PATCH /superadmin/admins/:id` est reçue, THE Auth_Service SHALL mettre à jour uniquement les champs fournis parmi `nom`, `prenom`, `telephone`, `salle_id` et `actif`.
6. IF l'identifiant Admin fourni dans `PATCH /superadmin/admins/:id` ne correspond à aucun utilisateur avec le rôle `ADMIN`, THEN THE Auth_Service SHALL retourner une erreur HTTP 404 avec le message `"Admin introuvable"`.
7. WHEN le champ `actif` est passé à `false` dans `PATCH /superadmin/admins/:id`, THE Auth_Service SHALL désactiver le compte Admin sans le supprimer, rendant ses tokens JWT existants invalides lors de la prochaine vérification.
8. THE Auth_Service SHALL protéger toutes les routes `/superadmin/admins` avec le JWT_Middleware et le Role_Middleware restreint au rôle `SUPERADMIN`.

---

### Requirement 8 : Réinstallation système d'une salle

**User Story:** En tant que SuperAdmin, je veux pouvoir effectuer une réinstallation complète d'une salle, afin de remettre à zéro sa configuration en cas de problème grave ou de changement de propriétaire.

#### Acceptance Criteria

1. WHEN une requête `POST /superadmin/salles/:id/reset` est reçue, THE Auth_Service SHALL supprimer ou désactiver toutes les données opérationnelles de la salle (utilisateurs Admin/Gérant/Client, sessions, crédits, coupons, licences) tout en conservant l'enregistrement de la salle lui-même.
2. THE Auth_Service SHALL exiger une confirmation explicite dans le corps de la requête (champ `confirmation: "RESET_SALLE"`) avant d'exécuter la réinstallation.
3. IF le champ de confirmation est absent ou incorrect, THEN THE Auth_Service SHALL retourner une erreur HTTP 400 avec le message `"Confirmation requise : fournir { confirmation: 'RESET_SALLE' }"`.
4. WHEN la réinstallation est effectuée, THE Auth_Service SHALL enregistrer un log d'audit contenant l'identifiant du SuperAdmin ayant effectué l'opération, l'identifiant de la salle et l'horodatage.

---

### Requirement 9 : Sécurité et isolation des données

**User Story:** En tant qu'architecte du système, je veux que les données de chaque salle soient strictement isolées, afin qu'un Admin ou Gérant d'une salle ne puisse jamais accéder aux données d'une autre salle.

#### Acceptance Criteria

1. THE JWT_Middleware SHALL inclure le `salle_id` dans chaque token JWT pour les utilisateurs avec les rôles `ADMIN`, `GERANT` et `CLIENT`, de sorte que chaque requête authentifiée porte l'identifiant de salle.
2. WHEN un Admin accède à une ressource de sa salle, THE Auth_Service SHALL vérifier que le `salle_id` de la ressource demandée correspond au `salle_id` extrait du JWT.
3. IF le `salle_id` de la ressource demandée ne correspond pas au `salle_id` du JWT, THEN THE Auth_Service SHALL retourner une erreur HTTP 403 avec le message `"Accès refusé : ressource d'une autre salle"`.
4. THE Auth_Service SHALL ne jamais retourner le champ `motDePasse` dans aucune réponse d'API, quelle que soit la route.
5. THE Auth_Service SHALL stocker tous les mots de passe exclusivement sous forme de hash bcrypt avec un coût minimum de 12, sans jamais persister le mot de passe en clair.
