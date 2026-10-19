# Botanica Arcana

> *Application mobile personnelle de suivi de plantes, 100 % locale, à l'esthétique de grimoire dessiné à la main, optimisée pour Android (Pixel 8a).*

---

## Vision du Projet

**Botanica Arcana** est un carnet de soins botanique numérique conçu pour un usage strictement personnel. Inspirée par les grimoires anciens et les cartes de tarot, l'application allie l'utilitaire au mystique.

### Principes directeurs (Local-First)

* **100 % Local :** Aucune dépendance serveur, aucun compte, aucun cloud. Les données résident entièrement sur l'appareil (via IndexedDB / Dexie).
* **Hors-ligne par conception :** Pas de requêtes réseau, pas d'API météo automatique. La météo et la température du jour sont saisies manuellement pour alimenter l'algorithme de séchage.
* **Identité dessinée à la main :** Chaque plante est représentée par une illustration embarquée dans l'application, rattachée via un `motifId` stable.

## Stack Technique

* **Framework :** React + TypeScript (Vite)
* **Navigation :** React Router (`HashRouter` pour le WebView Capacitor)
* **Stockage local :** Dexie.js (IndexedDB)
* **Gestion d'état :** Zustand
* **Validation & Dates :** Zod & `date-fns`
* **Mobile Natif (Capacitor) :** Notifications locales, retours haptiques, gestion du système de fichiers et partage pour les sauvegardes ZIP/JSON.
* **Tests & Qualité :** Vitest, ESLint, Prettier

---

## Structure du Dépôt

* `SCOPE.md` : Le cahier des charges détaillé et le périmètre de la V1.
* `src/` : Code source de l'application.
* `src/assets/plants/` : Catalogue des dessins embarqués et manifeste des motifs.

---

## Installation & Développement (APK Local)

Ce projet est taillé pour un déploiement direct sous forme d'APK signé sur Android (Pixel 8a) :

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement local
npm run dev

# Build de production et synchronisation Capacitor
npm run build
npx cap sync
