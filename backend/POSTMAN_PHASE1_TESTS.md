# Plan de tests Postman — Phase 1 (1.1 → 1.5)

But: Valider l'implémentation des endpoints d'authentification, superadmin, salles, licences et gestion des admins.


Important: le serveur local doit être démarré avant de lancer ces requêtes.

Base URL utilisée dans tous les tests : http://localhost:3000

Comptes pré-créés (seed) — copier/coller pour les tests de login :
- Super Admin : email = superadmin@switchsab.local  | motDePasse = super123
- Admin       : email = admin@switchsab.local       | motDePasse = admin123

Conseil d'utilisation :
- Faites les requêtes dans l'ordre indiqué. Après `POST /auth/login` copiez la valeur `token` de la réponse et collez-la dans l'en-tête `Authorization: Bearer <TOKEN_Ici>` pour les requêtes protégées.
- Si vous préférez cookie httpOnly, copiez la valeur du token et ajoutez un cookie pour `localhost:3000` nommé `token`.

Format des tests: Objectif, Méthode, URL complète, Headers, Body (copier-coller), Réponse attendue (exemple à copier).

---

**0. Prérequis : Lancer le seed**
- Objectif: s'assurer que le compte `superadmin` et `admin` existent.
- Action: Exécuter dans le dossier `backend`:
```
node prisma/seed.js
```
- Données crées (extrait du seed):
  - Super Admin: email `superadmin@switchsab.local`, mdp `super123`, tel `+22900000000`
  - Admin: email `admin@switchsab.local`, mdp `admin123`, tel `+22900000001`

---

## 1. Authentification (1.1)

Test 1.1.1 — Login success (Superadmin)
- Méthode: POST
- URL: `http://localhost:3000/auth/login`
- Headers:
  - Content-Type: application/json
- Body (JSON) — copier/coller :
```json
{
  "email": "superadmin@switchsab.local",
  "motDePasse": "super123"
}
```
- Réponse attendue: HTTP 200 (exemple copier/coller) :
```json
{
  "token": "eyJhbGciOi...<votre_token>",
  "role": "SUPERADMIN",
  "id": 1
}
```
- Action manuelle: copiez la valeur entière de `token` (la chaîne JWT) et collez-la dans l'en-tête `Authorization` sous la forme `Bearer <TOKEN>` pour les requêtes suivantes.

- Vérifier: décoder le JWT sur https://jwt.io — le payload doit contenir au minimum les propriétés `id`, `role`, `salle_id`, `exp`.

Test 1.1.2 — Login failure (mauvais mot de passe)
- Méthode: POST
- URL: `http://localhost:3000/auth/login`
- Body (copier/coller):
```json
{
  "email": "superadmin@switchsab.local",
  "motDePasse": "wrongpwd"
}
```
- Réponse attendue: HTTP 401 (exemple) :
```json
{ "error": "Invalid credentials" }
```

Test 1.1.3 — Token non fourni → accès protégé
- Méthode: GET
- URL: `http://localhost:3000/superadmin/salles`
- Headers: AUCUN Authorization
- Réponse attendue: HTTP 401 (exemple) :
```json
{ "error": "Token missing" }
```

Test 1.1.4 — Token invalide → 401
- Méthode: GET
- URL: `http://localhost:3000/superadmin/salles`
- Headers: `Authorization: Bearer invalid.token.here`
- Réponse attendue: HTTP 401 :
```json
{ "error": "Invalid token" }
```

Test 1.1.5 — Stockage cookie httpOnly (manuel Postman)
- Après login, copiez la valeur du `token` puis dans Postman > Cookies ajoutez pour `localhost:3000` :
  - Name: token
  - Value: (collez le token)
  - httpOnly: checked
- Ensuite envoyer une requête GET `http://localhost:3000/superadmin/salles` sans header Authorization. Si le serveur lit le cookie, la requête doit retourner HTTP 200 et la liste des salles.

---

## 2. Middleware de rôle (requireRole)

Test 2.1 — Accès restreint sans rôle adéquat
- Étape A — Login Admin (copier/coller)
  - POST `http://localhost:3000/auth/login`
  - Body:
```json
{
  "email": "admin@switchsab.local",
  "motDePasse": "admin123"
}
```
  - Réponse attendue (exemple):
```json
{ "token": "eyJ...adminToken", "role": "ADMIN", "id": 2 }
```
  - Copiez `token` et placez-le dans l'en-tête `Authorization: Bearer <ADMIN_TOKEN>`.

- Étape B — Essayer d'appeler une route SUPERADMIN
  - DELETE `http://localhost:3000/superadmin/salles/1`
  - Header: `Authorization: Bearer <ADMIN_TOKEN>`
  - Réponse attendue: HTTP 403 :
```json
{ "error": "Insufficient role" }
```

Test 2.2 — Accès autorisé (SUPERADMIN)
- DELETE `http://localhost:3000/superadmin/salles/1`
- Header: `Authorization: Bearer <SUPERADMIN_TOKEN>`
- Réponse attendue (exemple): HTTP 200
```json
{ "message": "Salle désactivée", "id": 1, "active": false }
```

---

## 3. Super Admin — mot de passe initial (1.2)

Test 3.1 — Modifier mot de passe initial
- Méthode: PATCH
- URL: `http://localhost:3000/superadmin/password`
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`, `Content-Type: application/json`
- Body (copier/coller):
```json
{
  "ancien": "super123",
  "nouveau": "Secur3P@ss!"
}
```
- Réponse attendue: HTTP 200
```json
{ "message": "Password updated" }
```
- Vérifier: refaire POST `http://localhost:3000/auth/login` avec `superadmin@switchsab.local` et `Secur3P@ss!`.

Test 3.2 — Modifier mot de passe échoue si ancien incorrect
- Body (copier/coller):
```json
{ "ancien": "wrong", "nouveau": "abc" }
```
- Réponse attendue: HTTP 400/401
```json
{ "error": "Old password incorrect" }
```

---

## 4. Gestion des salles (1.3)

Test 4.1 — Créer une salle
- Méthode: POST
- URL: `http://localhost:3000/superadmin/salles`
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`, `Content-Type: application/json`
- Body (copier/coller):
```json
{
  "nom": "Switch SAB Cotonou - Test",
  "pays": "Bénin",
  "ville": "Cotonou",
  "quartier": "Akpakpa",
  "telephone": "+2290197691888",
  "switchType": "WIFI"
}
```
- Réponse attendue: HTTP 201 (exemple) :
```json
{ "id": 2, "nom": "Switch SAB Cotonou - Test", "pays": "Bénin", "ville": "Cotonou", "quartier": "Akpakpa", "telephone": "+2290197691888", "switchType": "WIFI", "active": true }
```
- Action manuelle: copiez la valeur `id` (ex: 2) et utilisez-la pour les requêtes suivantes sur cette salle.

Test 4.2 — Lister les salles
- Méthode: GET
- URL: `http://localhost:3000/superadmin/salles`
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`
- Réponse attendue: HTTP 200 (exemple) :
```json
[
  { "id": 1, "nom": "Switch SAB Cotonou", "active": true },
  { "id": 2, "nom": "Switch SAB Cotonou - Test", "active": true }
]
```

Test 4.3 — Modifier une salle
- Méthode: PATCH
- URL: `http://localhost:3000/superadmin/salles/2`  (remplacez `2` par l'id renvoyé au 4.1)
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`, `Content-Type: application/json`
- Body (copier/coller):
```json
{ "ville": "Cotonou-Updated", "telephone": "+2290197691999" }
```
- Réponse attendue: HTTP 200 (exemple) :
```json
{ "id": 2, "nom": "Switch SAB Cotonou - Test", "ville": "Cotonou-Updated", "telephone": "+2290197691999" }
```

Test 4.4 — Désactiver (DELETE) une salle
- Méthode: DELETE
- URL: `http://localhost:3000/superadmin/salles/2` (remplacez `2` par l'id réel)
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`
- Réponse attendue: HTTP 200 (exemple) :
```json
{ "message": "Salle désactivée", "id": 2, "active": false }
```
- Vérifier: `GET /superadmin/salles` ne doit plus retourner la salle si le back-end filtre les inactives.

---

## 5. Licence (1.4)

Remarque: la génération et la vérification des licences impliquent deux pièces: un `code demande` (généré hors-ligne) et la `licence` signée (HMAC). Les tests ci-dessous supposent que le serveur expose des endpoints pour générer une licence signée pour une `salle_id`.

Test 5.1 — Générer une licence pour une salle
- Méthode: POST
- URL: `http://localhost:3000/superadmin/licences/generer`
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`, `Content-Type: application/json`
- Body (copier/coller) :
```json
{
  "salleId": 2,
  "dureeJours": 30
}
```
- Réponse attendue: HTTP 201 (exemple) :
```json
{
  "requestCode": "AB1CD2EF3G",
  "licence": "eyJhbGciOiJI...<signed>"
}
```
- Remarque: `requestCode` est alphanumérique sans `0` ni `O`.

Test 5.2 — Activer une licence (admin)
- Méthode: POST
- URL: `http://localhost:3000/licences/activer`
- Headers: `Authorization: Bearer <ADMIN_TOKEN>` (ou `<SUPERADMIN_TOKEN>`), `Content-Type: application/json`
- Body (copier/coller) :
```json
{
  "licence": "eyJhbGciOiJI...<signed>",
  "requestCode": "AB1CD2EF3G"
}
```
- Réponse attendue: HTTP 200 (exemple) :
```json
{ "status": "activated", "expiresAt": "2026-06-29T12:00:00.000Z" }
```

Test 5.3 — Statut licence
- Méthode: GET
- URL: `http://localhost:3000/licences/statut?salleId=2` (remplacez `2` par l'id réel)
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`
- Réponse attendue: HTTP 200 (exemple) :
```json
{ "daysRemaining": 29, "expiresAt": "2026-06-29T12:00:00.000Z", "blocked": false }
```

Test 5.4 — Licence expirée → comportement
- Créer une licence expirée (ou manipuler la date en base) puis appeler `GET /licences/statut`:
- Réponse attendue: `blocked: true` ou flag `reportsHidden: true` + application bloquée selon la règle (après 3 jours d'expiration complète donc: investigations à valider côté back).

---

## 6. Gestion des comptes Admin (1.5)

Test 6.1 — Créer un admin (SUPERADMIN only)
- Méthode: POST
- URL: `http://localhost:3000/superadmin/admins`
- Headers: `Authorization: Bearer <SUPERADMIN_TOKEN>`, `Content-Type: application/json`
- Body (copier/coller) :
```json
{
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+2290197691990",
  "email": "john.doe@switchsab.local",
  "salleId": 2,
  "motDePasse": "AdminPwd123"
}
```
- Réponse attendue: HTTP 201 (exemple) :
```json
{ "id": 10, "pseudo": "john.doe", "role": "ADMIN", "telephone": "+2290197691990", "salleId": 2 }
```

Test 6.2 — Lister les admins
- Méthode: GET
- URL: `{{baseUrl}}/superadmin/admins`
- Headers: `Authorization: Bearer {{token}}`
- Réponse attendue: HTTP 200 + tableau d'admins.

Test 6.3 — Modifier / désactiver un admin
- Méthode: PATCH
- URL: `{{baseUrl}}/superadmin/admins/:id`
- Body exemple pour désactiver:
```json
{ "active": false }
```
- Réponse attendue: HTTP 200 + admin mis à jour.

Test 6.4 — Réinstallation système (reset complet d'une salle)
- Méthode: POST
- URL: `{{baseUrl}}/superadmin/salles/:id/reset`
- Headers: `Authorization: Bearer {{token}}`
- Body: `{ "confirm": true }`
- Réponse attendue: HTTP 200 + message `Salle reset completed`.
- Attention: c'est destructif — exécuter seulement sur environnement de test.

---

## 7. Tests de sécurité / robustesse

Test 7.1 — Test d'expiration JWT
- Créer un JWT expiré localement (ou manipuler `exp` en DB) puis appeler une route protégée → HTTP 401 Token expired.

Test 7.2 — Injection / validation body
- Envoyer corps malformés (ex: string pour `salleId`) → HTTP 400 avec message de validation.

Test 7.3 — HMAC licence incorrect
- Envoyer `licence` signée invalide → HTTP 400/401 + message `Invalid licence signature`.

---

## Postman: scripts utiles

- Extraire token après login (Tests tab):
```js
if (pm.response.code === 200) {
  const json = pm.response.json();
  if (json.token) {
    pm.environment.set('token', json.token);
  }
}
```

- Injecter Authorization header automatiquement (Pre-request script at folder level):
```js
if (pm.environment.get('token')) {
  pm.request.headers.add({ key: 'Authorization', value: 'Bearer ' + pm.environment.get('token') });
}
```

- Stocker cookie httpOnly (Postman cookie jar, Tests tab):
```js
// Exemple: ajouter un cookie nommé 'token' pour le host
pm.cookies.jar().set(pm.environment.get('baseUrl'), 'token', pm.environment.get('token'));
```

---

## Ordonnancement logique (chronologique recommandé)
1. Lancer le seed (0)
2. `POST /auth/login` superadmin → stocker `token`
3. Tester middleware (accès sans token → 401)
4. PATCH `/superadmin/password` (changer mot de passe) → retester login
5. `POST /superadmin/salles` (créer salle) → sauvegarder `sample_salle_id`
6. `GET /superadmin/salles`
7. `PATCH /superadmin/salles/:id`
8. `DELETE /superadmin/salles/:id`
9. `POST /superadmin/licences/generer` → vérifier `requestCode`/`licence`
10. `POST /licences/activer` (admin) → `GET /licences/statut`
11. `POST /superadmin/admins` → `GET /superadmin/admins` → `PATCH /superadmin/admins/:id`
12. Tests négatifs (mauvais token, rôle insuffisant, licence invalide, validation bodys)

---

## Remarques finales
- Adaptez les chemins `{{baseUrl}}` si votre API écoute sur un autre port.
- Si le serveur lit le token depuis le cookie `token`, Postman doit définir explicitement ce cookie (onglet Cookies). Beaucoup d'apps acceptent aussi le header `Authorization: Bearer ...` pour faciliter les tests.
- Si vous voulez, je peux générer une collection Postman (JSON) prête à importer avec toutes ces requêtes, variables et scripts — souhaitez-vous que je la crée maintenant ?


