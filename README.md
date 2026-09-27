# BoostshopApp-Infos

Application web statique (Vue 3 + TypeScript + Vite) qui identifie un utilisateur — par scan de son QR code via la webcam ou par saisie de son adresse e-mail — et affiche les informations renvoyées par l'edge function Supabase `user-infos`.

Depuis la fiche utilisateur, il est possible d'**utiliser des points** (récompenses) ou de **créditer des points** sans facture liée (geste commercial, bonus, correction). Les deux passent par l'edge function `decrement-points` avec le paramètre `operation` (`decrement` ou `increment`).

## Stack
- Vue 3 + TypeScript + Vite
- TailwindCSS
- [`vue-qrcode-reader`](https://github.com/gruhn/vue-qrcode-reader)

## Démarrage

```bash
cp .env.example .env
npm install
npm run dev
```

Build de production :

```bash
npm run build
npm run preview
```

Les fichiers statiques générés se trouvent dans `dist/`.

## Variables d'environnement

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_FUNCTIONS_URL` | URL de base des Functions Supabase (sans slash final). |

> Le token d'authentification (en-tête `x-auth-token`) est saisi par l'utilisateur au lancement de l'application et persisté dans le `localStorage` du navigateur (clé `api_auth_token`).

## Caméra et HTTPS

L'accès à la webcam nécessite un **contexte sécurisé** :
- En local : `localhost` (ou `127.0.0.1`) fonctionne.
- En production : déploiement HTTPS obligatoire.

Pour tester depuis un mobile sur le réseau local, lancer Vite avec HTTPS (ex. via [`@vitejs/plugin-basic-ssl`](https://github.com/vitejs/vite-plugin-basic-ssl)) ou un tunnel (ngrok, cloudflared).

## Identification de l'utilisateur

Deux modes sont proposés sur l'écran d'accueil :

- **QR code** : le contenu du QR doit être un **UUID** correspondant à `auth.users.id`. Toute autre valeur est rejetée côté client avant l'appel API (`?userId=...`).
- **Adresse e-mail** : saisie manuelle sous le scanner. L'e-mail est transmis à l'edge function (`?email=...`) qui le résout vers un `auth.users.id` (insensible à la casse) via la RPC `get_user_id_by_email`. Un e-mail inconnu renvoie un 404.
