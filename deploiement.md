Je lis d'abord les fichiers clés pour te donner un guide précis basé sur ton projet réel.

Tout est clair. Je crée d'abord les fichiers nécessaires, puis je te donne le guide complet.

Maintenant je modifie `crypto.js` pour lire les clés depuis les variables d'env en production (base64) ou depuis les fichiers en local :

Maintenant le guide complet :

---

# Guide de déploiement — Switch SAB

## ÉTAPE 1 — Préparer le dépôt Git

Assure-toi que tout est commité et pushé sur GitHub.

```bash
git add .
git commit -m "chore: préparation déploiement"
git push
```

**Vérifie que `.gitignore` exclut bien :**
- `backend/.env`
- `backend/keys/`

---

## ÉTAPE 2 — Encoder les clés RSA en base64

Tu as besoin de ces valeurs pour les coller dans Render. Lance ça dans PowerShell depuis la racine du projet :

```powershell
# Clé privée
[Convert]::ToBase64String([IO.File]::ReadAllBytes("backend\keys\private-key.pem"))

# Clé publique
[Convert]::ToBase64String([IO.File]::ReadAllBytes("backend\keys\public-key.pem"))
```

Copie les deux résultats dans un fichier texte temporaire — tu en auras besoin à l'étape 4.

---

## ÉTAPE 3 — Déployer le backend sur Render

**3.1** Va sur [render.com](https://render.com) → connecte-toi avec GitHub

**3.2** Clique **New → PostgreSQL**
- Name : `switch-sab-db`
- Plan : **Free**
- Clique **Create Database**
- Copie la **Internal Database URL** quelque part

**3.3** Clique **New → Web Service**
- Connecte ton repo GitHub `switch-sab`
- **Root Directory** : `backend`
- **Runtime** : Node
- **Build Command** :
  ```
  npm install && npm run build && npx prisma migrate deploy
  ```
- **Start Command** :
  ```
  npm run start
  ```
- **Plan** : Free

**3.4** Dans **Environment Variables**, ajoute ces variables une par une :

| Clé | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | L'Internal Database URL copiée à l'étape 3.2 |
| `JWT_SECRET` | Un texte long aléatoire (ex: `switchsab_prod_2026_xK9mNpQ`) |
| `FRONTEND_URL` | `https://switch-sab.vercel.app` *(à corriger après étape 5)* |
| `LICENCE_PRIVATE_KEY_PEM` | La valeur base64 de la clé privée (étape 2) |
| `LICENCE_PUBLIC_KEY_PEM` | La valeur base64 de la clé publique (étape 2) |

**3.5** Clique **Create Web Service** → attends le build (~3 minutes)

**3.6** Copie l'URL de ton service Render, ex : `https://switch-sab-backend.onrender.com`

---

## ÉTAPE 4 — Lancer le seed sur Render

Une fois le backend déployé, va dans **Shell** sur le dashboard Render et lance :

```bash
npm run seed
```

Ça crée le compte superadmin en prod.

---

## ÉTAPE 5 — Déployer le frontend sur Vercel

**5.1** Ouvre `frontend/.env.production` et remplace l'URL par celle de ton backend Render :
```
VITE_API_URL=https://switch-sab-backend.onrender.com
```

Commite et push ce changement.

**5.2** Va sur [vercel.com](https://vercel.com) → connecte-toi avec GitHub

**5.3** Clique **Add New Project** → sélectionne ton repo `switch-sab`

**5.4** Configure :
- **Root Directory** : `frontend`
- **Framework Preset** : Vite *(auto-détecté)*
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

**5.5** Dans **Environment Variables**, ajoute :

| Clé | Valeur |
|---|---|
| `VITE_API_URL` | `https://switch-sab-backend.onrender.com` |

**5.6** Clique **Deploy** → attends ~1 minute

**5.7** Copie l'URL Vercel, ex : `https://switch-sab.vercel.app`

---

## ÉTAPE 6 — Mettre à jour le CORS du backend

Retourne sur Render → ton Web Service → **Environment** → modifie :

| Clé | Valeur |
|---|---|
| `FRONTEND_URL` | `https://switch-sab.vercel.app` *(ton URL Vercel réelle)* |

Render redéploie automatiquement.

---

## ÉTAPE 7 — Tester

1. Ouvre `https://switch-sab.vercel.app`
2. Connecte-toi avec `superadmin@licencemanager.local` / `superadmin123`
3. Crée une salle → vérifie qu'elle apparaît
4. Génère une licence → vérifie qu'elle s'enregistre

---

## Points importants à retenir

**Plan Free Render** — le serveur se met en veille après 15 min d'inactivité. Au premier accès il met ~30 secondes à se réveiller. C'est normal pour les tests.

**Redeployer** — à chaque `git push` sur la branche principale, Vercel redéploie automatiquement. Render aussi si tu actives l'option **Auto-Deploy**.

**La clé privée** ne doit jamais apparaître dans le code ou sur GitHub. Elle est maintenant dans les variables d'env Render uniquement.