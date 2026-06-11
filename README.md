# BoostshopApp-Infos

Application web statique (Vue 3 + TypeScript + Vite) qui scanne un QR code utilisateur via la webcam et affiche les informations renvoyées par l'edge function Supabase `user-infos`.

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
| `VITE_API_AUTH_TOKEN` | Token envoyé dans l'en-tête `x-auth-token`. |

> Le token est embarqué dans le bundle (limite client-side). À ne pas utiliser tel quel hors contexte interne.

## Caméra et HTTPS

L'accès à la webcam nécessite un **contexte sécurisé** :
- En local : `localhost` (ou `127.0.0.1`) fonctionne.
- En production : déploiement HTTPS obligatoire.

Pour tester depuis un mobile sur le réseau local, lancer Vite avec HTTPS (ex. via [`@vitejs/plugin-basic-ssl`](https://github.com/vitejs/vite-plugin-basic-ssl)) ou un tunnel (ngrok, cloudflared).

## QR code attendu

Le contenu du QR doit être un **UUID** correspondant à `auth.users.id`. Toute autre valeur est rejetée côté client avant l'appel API.
