# Contrat d'interface — Switch physique

**Auteur :** Sergio  
**Phase :** 0.4  
**Statut :** En attente du matériel — mock actif

---

## C'est quoi ce document ?

Ce document définit exactement comment le switch physique doit se comporter.  
Alessio l'utilise pour coder les appels sans attendre le matériel.  
Sergio l'utilise pour choisir et brancher le bon matériel.  
Quand le vrai switch arrive, on remplace juste `usbSwitch.js` ou `wifiSwitch.js` — rien d'autre ne change.

---

## Ce que fait le switch

Le switch est un boîtier physique branché dans la salle.  
Il contrôle l'alimentation électrique de chaque TV/poste de jeu.  
Le backend lui envoie des commandes : **allume le poste 3**, **éteins le poste 3**.

---

## Les deux modes supportés

### Mode WIFI
- Le switch est connecté au réseau local de la salle
- Le backend lui envoie des requêtes HTTP
- Configuration requise : adresse IP du switch (ex: `192.168.1.10`)

### Mode USB
- Le switch est branché directement sur le PC serveur via USB
- Le backend lui envoie des commandes série (port COM)
- Configuration requise : port COM (ex: `COM3` sur Windows, `/dev/ttyUSB0` sur Linux)

---

## Format des commandes

Peu importe le mode (USB ou WIFI), le backend envoie toujours la même structure :

```json
{
  "action": "ALLUMER",
  "posteId": 3
}
```

```json
{
  "action": "ETEINDRE",
  "posteId": 3
}
```

---

## Format des réponses attendues

### Succès
```json
{
  "success": true,
  "posteId": 3,
  "statut": "ALLUME"
}
```

```json
{
  "success": true,
  "posteId": 3,
  "statut": "ETEINT"
}
```

### Erreur — poste inconnu
```json
{
  "success": false,
  "posteId": 99,
  "message": "Poste 99 inconnu du switch"
}
```

### Erreur — switch déconnecté
```json
{
  "success": false,
  "posteId": 3,
  "message": "Switch injoignable — vérifier la connexion"
}
```

---

## Cas limites à gérer

| Situation | Comportement attendu |
|---|---|
| Switch WIFI éteint ou hors réseau | Retourner `success: false` + message d'erreur |
| Switch USB débranché | Retourner `success: false` + message d'erreur |
| Poste ID inexistant sur le switch | Retourner `success: false` + message d'erreur |
| Commande envoyée deux fois (allumer un poste déjà allumé) | Retourner `success: true` sans erreur (idempotent) |
| Timeout (switch ne répond pas en 3s) | Retourner `success: false` + message timeout |

---

## Ce que Sergio doit livrer (Phase 6)

### Phase 6.1 — Driver USB
Fichier : `backend/src/switch/usbSwitch.js`

Doit exporter :
```js
export const usbAllumer = (posteId) => { ... }
export const usbEteindre = (posteId) => { ... }
export const usbGetStatut = (posteId) => { ... }
export const usbGetStatuts = () => { ... }
```

### Phase 6.2 — Driver WIFI
Fichier : `backend/src/switch/wifiSwitch.js`

Doit exporter :
```js
export const wifiAllumer = (posteId) => { ... }
export const wifiEteindre = (posteId) => { ... }
export const wifiGetStatut = (posteId) => { ... }
export const wifiGetStatuts = () => { ... }
```

---

## Ce qu'Alessio doit faire (rien de plus)

```js
import { allumerPoste, eteindrePoste } from '../switch/switchService.js'

// Démarrer une session → allumer la TV
await allumerPoste(posteId)

// Arrêter une session → éteindre la TV
await eteindrePoste(posteId)
```

Il n'importe jamais `mockSwitch.js`, `usbSwitch.js` ou `wifiSwitch.js` directement.

---

## État actuel

| Driver | Statut |
|---|---|
| MOCK | ✅ Actif — 6 postes simulés |
| USB | ⏳ En attente matériel (Phase 6.1) |
| WIFI | ⏳ En attente matériel (Phase 6.2) |
