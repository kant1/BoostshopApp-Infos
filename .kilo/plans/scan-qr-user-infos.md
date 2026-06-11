# Plan — BoostshopApp-Infos (scan QR → infos utilisateur)

## Objectif
Interface web statique (Vue 3 + TS) qui :
1. Scanne un QR code via la webcam (contenu = `userId` brut, UUID).
2. Appelle l'edge function Supabase `user-infos` avec ce `userId`.
3. Affiche les informations utilisateur retournées (profil, points, avantages, factures).

## Stack retenue
- **Build** : Vite + Vue 3 + TypeScript (SPA statique).
- **QR scan** : [`vue-qrcode-reader`](https://github.com/gruhn/vue-qrcode-reader).
- **Styling** : TailwindCSS (mobile-first).
- **HTTP** : `fetch` natif.
- **State** : composables simples (`useUserInfos`).
- **Config** : variables d'env Vite (`.env`).

## Schéma de la réponse API (confirmé)

```ts
// src/types/user.ts
export interface Invoice {
  id: string
  user_id: string
  amount_eur: number
  points: number
  created_at: string          // ISO date
  url: string                 // PDF Axonaut
  external_id: string
}

export interface UserMetadata {
  avatar_url?: string
  email?: string
  email_verified?: boolean
  full_name?: string
  name?: string
  phone_verified?: boolean
  picture?: string
  iss?: string
  provider_id?: string
  sub?: string
}

export interface AppMetadata {
  company_id?: string
  last_invoice_sync_at?: string
  provider?: string
  providers?: string[]
}

export interface UserCore {
  id: string
  email: string
  phone: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata: UserMetadata
  app_metadata: AppMetadata
}

export interface UserInfosResponse {
  user: UserCore
  points_balance: number
  advantages: unknown[] | null   // structure inconnue, traiter de façon défensive
  invoices: Invoice[]
}
```

## Variables d'environnement (`.env.example`)
```
VITE_SUPABASE_FUNCTIONS_URL=https://zdgfqvcyqladnznltlqv.supabase.co/functions/v1
VITE_API_AUTH_TOKEN=BoostShop33
```
> Note : token embarqué dans le bundle (limite intrinsèque d'une app static client-side). Acceptable si usage interne, sinon prévoir un proxy serveur.

## Arborescence cible

```
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts
    ├── App.vue
    ├── style.css
    ├── components/
    │   ├── QrScanner.vue         # webcam + détection, émet userId
    │   ├── UserHeader.vue        # avatar, nom, email, provider, dates
    │   ├── PointsBalance.vue     # badge solde de points
    │   ├── AdvantagesList.vue    # liste des avantages (ou "aucun")
    │   └── InvoicesTable.vue     # tableau factures
    ├── composables/
    │   └── useUserInfos.ts
    ├── services/
    │   └── api.ts
    ├── utils/
    │   └── format.ts             # formatDate, formatEuros
    └── types/
        └── user.ts
```

## Détails d'implémentation

### `src/services/api.ts`
```ts
import type { UserInfosResponse } from '@/types/user'

const BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
const TOKEN = import.meta.env.VITE_API_AUTH_TOKEN

export async function fetchUserInfos(userId: string): Promise<UserInfosResponse> {
  const res = await fetch(`${BASE}/user-infos?userId=${encodeURIComponent(userId)}`, {
    headers: { 'x-auth-token': TOKEN },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}
```

### `src/composables/useUserInfos.ts`
- État : `data: UserInfosResponse | null`, `loading`, `error`.
- `load(userId)` + `reset()`.
- Validation simple de l'UUID (regex) avant l'appel pour éviter une requête inutile si le QR contient une chaîne aberrante.

### `src/utils/format.ts`
- `formatDate(iso)` → `Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })`
- `formatEuros(n)` → `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`

### `src/components/QrScanner.vue`
- `<QrcodeStream>` de `vue-qrcode-reader`.
- `@detect` → première valeur → trim → émet `userId`.
- Gère erreurs caméra (permission, pas de device, contexte non sécurisé).
- Overlay visée + bouton "Re-scanner".

### `src/components/UserHeader.vue`
Props : `user: UserCore`.
- Avatar circulaire (`user_metadata.avatar_url` ou `picture`, fallback initiales).
- Nom : `user_metadata.full_name || user_metadata.name || user.email`.
- Email + badge "vérifié" si `email_verified`.
- Téléphone si présent.
- Provider (`app_metadata.provider`, ex. "google") avec icône simple.
- `company_id` (si présent) en sous-info.
- Dates formatées : "Inscrit le …", "Dernière connexion …".

### `src/components/PointsBalance.vue`
Props : `balance: number`.
- Gros badge coloré au centre du dashboard.
- Pluriel correct ("1 point" / "N points").

### `src/components/AdvantagesList.vue`
Props : `advantages: unknown[] | null`.
- Si `null` ou tableau vide → message "Aucun avantage".
- Sinon affichage défensif clé/valeur (structure inconnue) → on itèrera de façon générique en attendant un schéma confirmé.

### `src/components/InvoicesTable.vue`
Props : `invoices: Invoice[]`.
- Tri par `created_at` décroissant.
- Colonnes : Date, Montant (€), Points, Réf. externe, Lien PDF (icône ouvrant `url` dans un nouvel onglet).
- Affiche un total (somme `amount_eur` et `points`) en pied de tableau.
- Responsive : sur mobile, transformation en liste de cartes.
- Vide → "Aucune facture".

### `src/App.vue` — flow UI
1. État `idle` → `QrScanner` plein écran (avec titre + petite consigne).
2. À la détection → `loading` (spinner) → appel API.
3. Succès → page d'infos :
   - `UserHeader` en haut
   - `PointsBalance` mise en avant
   - `AdvantagesList`
   - `InvoicesTable`
   - Bouton flottant "Scanner un autre".
4. Erreur → message + bouton "Réessayer".

### Tailwind
- Layout container `max-w-3xl mx-auto px-4`.
- Cartes : `rounded-2xl shadow-sm border bg-white dark:bg-zinc-900`.
- Dark mode auto via `prefers-color-scheme`.

## Étapes d'exécution
1. Init `package.json` + deps : `vue`, `vue-qrcode-reader`, `tailwindcss`, `postcss`, `autoprefixer`, `vite`, `@vitejs/plugin-vue`, `typescript`, `vue-tsc`.
2. Configurer Vite (alias `@` → `src`), TS strict, Tailwind, PostCSS.
3. `index.html` + `src/main.ts` + `src/style.css`.
4. `types/user.ts` + `services/api.ts` + `utils/format.ts`.
5. `composables/useUserInfos.ts`.
6. `QrScanner.vue`.
7. `UserHeader.vue`, `PointsBalance.vue`, `AdvantagesList.vue`, `InvoicesTable.vue`.
8. `App.vue` + style global.
9. `.env.example` + `.gitignore` (`.env`, `node_modules`, `dist`).
10. `npm run dev` (HTTPS/localhost requis pour caméra) puis `npm run build`.

## Points de vigilance
- **HTTPS** obligatoire pour la caméra en prod.
- **Token côté client** visible dans le bundle.
- **CORS** : vérifier que l'edge function autorise l'origin de déploiement.
- **Structure `advantages`** : inconnue → traitement défensif, à raffiner quand un exemple non-`null` sera disponible.
- **Avatar Google** : possibles erreurs de chargement (referrer policy) → ajouter `referrerpolicy="no-referrer"` sur la balise `<img>`.

## Hors scope (à valider plus tard)
- Tests unitaires.
- Routing.
- PWA / installable.
- Pipeline CI / déploiement (GH Pages / Netlify / Vercel ?).
