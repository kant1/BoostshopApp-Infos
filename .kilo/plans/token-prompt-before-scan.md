# Saisie du token d'authentification avant le scan QR

## Objectif
Au lancement de l'application, demander à l'utilisateur de saisir le token d'authentification utilisé pour appeler l'edge function `user-infos`, avant l'affichage du scanner QR. Le token remplace (ou complète) la variable d'environnement `VITE_API_AUTH_TOKEN`.

## Comportement souhaité
1. À l'ouverture : afficher un écran « Token » avec un champ de saisie et un bouton « Continuer ».
2. Le token saisi est conservé en mémoire (et persisté dans `localStorage` pour ne pas le redemander à chaque rafraîchissement).
3. Une fois validé, l'application passe à l'écran scanner QR (comportement actuel).
4. Possibilité de réinitialiser/modifier le token depuis l'écran scanner (petit bouton « Changer le token »).
5. Si le call à l'edge function renvoie 401/403, on repropose la saisie du token.

## Changements de fichiers

### 1. Nouveau composable `src/composables/useAuthToken.ts`
- État `token: Ref<string | null>` initialisé depuis `localStorage.getItem('api_auth_token')`.
- `setToken(value: string)` : trim + persiste dans `localStorage`.
- `clearToken()` : supprime du `localStorage`.
- Fallback initial : si `localStorage` vide, on peut pré-remplir avec `import.meta.env.VITE_API_AUTH_TOKEN` (optionnel, pour le dev). À discuter.

### 2. Nouveau composant `src/components/TokenPrompt.vue`
- Formulaire centré (style cohérent avec écrans `error`/`loading` de `App.vue`).
- Champ `input type="password"` (avec toggle afficher/masquer optionnel), placeholder « Token d'authentification ».
- Bouton « Continuer » désactivé tant que le champ est vide.
- `emit('submit', token: string)`.

### 3. `src/services/api.ts`
- Modifier `fetchUserInfos` pour accepter le token en paramètre :
  `fetchUserInfos(userId: string, token: string)`.
- Supprimer la lecture de `TOKEN` au niveau module.
- Conserver le check « token non défini » (erreur explicite).

### 4. `src/composables/useUserInfos.ts`
- Adapter `load(userId, token)` pour propager le token vers `fetchUserInfos`.

### 5. `src/App.vue`
- Importer `useAuthToken` et `TokenPrompt`.
- Ajouter un état `view` supplémentaire : `'token'` (prioritaire si pas de token).
- Logique `computed view` :
  - si pas de token → `'token'`
  - sinon : scanner / loading / error / result (comme aujourd'hui).
- `onDetect(userId)` → `load(userId, token.value!)`.
- Bouton secondaire « Changer le token » sur l'écran scanner (et/ou error) qui appelle `clearToken()` et revient à l'écran token.
- Sur erreur d'auth (HTTP 401/403), proposer également de modifier le token.

## Décisions
- Persistance : `localStorage` (clé `api_auth_token`).
- `VITE_API_AUTH_TOKEN` est supprimé : retirer la lecture dans `api.ts`, retirer la déclaration dans `env.d.ts` si présente, et la documentation associée (README/docs).
- Validation UI : `token.trim().length > 0`.
