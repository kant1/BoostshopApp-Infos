# Plan : Déploiement GitHub Pages via GitHub Actions

## Contexte
- Projet Vue 3 + Vite + TypeScript (`package.json`)
- Repo : `kant1/BoostshopApp-Infos`
- URL de déploiement attendue : `https://kant1.github.io/BoostshopApp-Infos/`
- `vite.config.ts` utilise `base: './'` (chemins relatifs), ce qui fonctionne pour GitHub Pages sous-chemin. À conserver tel quel.
- Script de build : `npm run build` → sortie dans `dist/`
- `dist/` est actuellement versionné (présent à la racine). À ajouter au `.gitignore` (optionnel mais recommandé) — à confirmer.

## Objectif
Mettre en place un workflow GitHub Actions qui :
1. Se déclenche sur push sur `main` (et manuellement via `workflow_dispatch`)
2. Installe les dépendances, build le projet
3. Déploie `dist/` sur GitHub Pages via le mécanisme officiel `actions/deploy-pages`

## Étapes d'implémentation

### 1. Créer `.github/workflows/deploy.yml`
Workflow utilisant les actions officielles GitHub Pages :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Gestion du SPA routing (si applicable)
- Vue Router en mode history ? À vérifier dans `src/`. Si oui, ajouter un `public/404.html` qui copie `index.html` pour gérer le fallback GitHub Pages.
- À confirmer avant implémentation.

### 3. Variables d'environnement
- `.env` n'est pas committé (présent dans le repo local mais probablement gitignoré). Vérifier `.env.example` pour savoir quelles variables sont nécessaires au build.
- Si variables sensibles requises au build → ajouter en `Secrets` du repo et les injecter dans le workflow via `env:`.
- À confirmer avec l'utilisateur.

### 4. Configuration côté GitHub (manuelle, à indiquer à l'utilisateur)
- Settings → Pages → Source : **GitHub Actions**
- Premier déploiement déclenché après merge sur `main`

### 5. Nettoyage optionnel
- Ajouter `dist/` au `.gitignore` puisque le build sera fait par CI (à confirmer).

## Points à clarifier avec l'utilisateur
1. Le projet utilise-t-il Vue Router en mode history (besoin du fallback `404.html`) ?
2. Faut-il ajouter `dist/` au `.gitignore` et supprimer le dossier `dist/` versionné ?
3. Y a-t-il des variables d'environnement nécessaires au build (à mettre en Secrets GitHub) ?
