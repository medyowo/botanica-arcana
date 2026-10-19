# Scope du Projet — Botanica Arcana (V1)

*Application mobile personnelle de suivi de plantes, 100 % locale, à l'esthétique de grimoire dessiné à la main, pour Android (Pixel 8a).*

---

## 1. Vision & objectifs principaux

- **Une appli personnelle :** Les choix visuels et fonctionnels servent mon usage et mes goûts uniquement.
- **Local first :** aucune dépendance serveur ni réseau ; données sur l'appareil (IndexedDB via Dexie) ; dessins embarqués dans l'appli.
- **Identité dessinée à la main :** interface, icônes et plantes illustrées à la main (grimoire, cadres de tarot, texture papier). Ils sont livrés comme **assets du projet** : des placeholders occupent d'abord chaque emplacement, puis les dessins définitifs arrivent progressivement, à n'importe quel stade, et **ne bloquent jamais la V1**.
- **Expérience fluide :** prise en main rapide, gestes d'arrosage simples et annulables, retours haptiques.

---

## 2. Non-objectifs (V1 et au-delà, sauf décision contraire)

- Pas d'iOS, pas de version PC / bureau.
- Pas de compte, de cloud ni de synchronisation multi-appareils.
- Pas de connexion réseau : ni API météo, ni analytics, ni mises à jour en ligne. La météo et la température sont **saisies à la main**.
- Pas de photos pour désigner les plantes, ni d'import d'images dans l'appli : chaque plante est représentée par un **dessin embarqué** (ou un placeholder).
- Pas de base d'espèces ni de recommandations de soins automatiques.
- Pas de publication sur le Play Store (installation par APK).
- Interface en français uniquement.

---

## 3. Contraintes techniques

- **Plateforme :** Android uniquement, orientation **portrait uniquement**, testé sur Pixel 8a.
- **Stack :** TypeScript, Vite, React, React Router (`HashRouter`), Tailwind CSS, Dexie, Zustand, date-fns, zod, Vitest.
- **Natif :** Capacitor (`local-notifications`, `haptics`, `filesystem`, `share`, `app`, `status-bar`, `splash-screen`). `filesystem` et `share` servent uniquement à l'export de la sauvegarde ; l'import passe par le sélecteur de fichiers du système.
- **Permissions demandées :** notifications uniquement
- **Distribution :** APK installé à la main, signé avec une clé personnelle **sauvegardée** (indispensable pour les mises à jour sans perte de données).

---

## 4. Périmètre de la V1 (In Scope)

### 4.1 Modèle de données

- **Journal d'événements de soin** (`care_events`) : les soins sont des événements, pas un champ « dernière date ». Types V1 : `water`, `postpone` ; `type` extensible (fertilize, repot, note…).
- **Journal du jour** (`day_logs`) : une entrée par date (`YYYY-MM-DD`) avec `tempC?`, `weather?`, `note?`. Tout est facultatif.
- **Dates :** format strict `YYYY-MM-DD` en heure locale, sans heure ni fuseau.
- **Plante :** `stage` et `parentId` réservés dès l'origine (valeurs fixes en V1) ; `motifId` (identifiant **stable** d'un dessin embarqué, voir 4.3).
- **Réglages** persistés : mois de bascule des périodes, coefficient de repos, température de référence, sensibilité aux conditions, heure du rappel.
- **Migrations :** chaque changement de schéma Dexie est versionné.

### 4.2 Pièces

- CRUD complet des pièces.
- Champs : nom ; luminosité (optionnelle) ; orientation (texte libre, optionnelle). Informatifs uniquement.

### 4.3 Plantes & dessins

- **Ajout rapide** : nom, pièce, intervalle d'arrosage, choix d'un dessin dans le catalogue ; objectif < 20 secondes. Un dessin par défaut est proposé, aucun choix n'est obligatoire.
- **Catalogue de dessins embarqués :** les dessins sont des fichiers du projet (`src/assets/plants/`), référencés par un manifeste (`motifId` → libellé + fichier). Aucun import ni stockage d'images à l'exécution.
- **Placeholders :** au départ, des images provisoires (silhouettes simples ou images libres de droits) occupent chaque emplacement. Remplacer un placeholder = **remplacer le fichier en gardant le même `motifId`** : aucune migration de données, aucun changement de code.
- **Ajouter un dessin pour une nouvelle plante** = ajouter un fichier et une ligne au manifeste, puis reconstruire et réinstaller l'APK (même clé de signature, données conservées). En attendant, la plante utilise un dessin existant ; son `motifId` peut être changé dans l'appli à tout moment.
- **Gabarit fixe :** tous les dessins partagent le même format (ratio et zone utile définis en phase 0, ex. 4:5, fond transparent), pour qu'un placeholder puisse être remplacé sans retoucher l'interface. Un `motifId` inconnu retombe sur un dessin par défaut.
- **Édition** de tous les champs, dont `notes` (texte libre) ; **archivage** (suppression douce).
- **Fiche plante :** dessin, infos, prochain arrosage et **explication du calcul** (voir 4.4), **historique des soins**.
- **États vides** soignés (aucune plante, aucune pièce).

### 4.4 Périodes & calcul d'arrosage

- Deux périodes : **croissance** et **repos**, mois de bascule réglables (par défaut croissance avril–septembre, repos octobre–mars). Les 4 saisons « almanach » restent en V2.
- Chaque plante a **un intervalle de base** (jours entre deux arrosages en conditions standard) ; en période de repos, un **coefficient global** s'applique (par défaut ×2, réglable), avec surcharge possible par plante.
- **Modèle par accumulation :** chaque jour depuis le dernier arrosage ajoute des « unités de séchage ». Une plante est due quand le cumul atteint son intervalle de base.
  - Jour sans entrée de journal : `unités = facteur de période` (1 en croissance, 1 / coefficient de repos en repos).
  - Jour avec entrée : `unités = facteur de période × facteur de conditions`.
  - `facteur de conditions = 1 + sensibilité × (facteur température × facteur météo − 1)`.
  - `facteur température = clamp(1 + 0,04 × (T − T_réf), 0,6, 1,5)` ; si la température est absente, le facteur vaut 1.
  - `facteur météo` : ensoleillé 1,15 ; nuageux 1,00 ; pluvieux 0,90 ; orageux 0,95 ; neigeux 0,85 ; absent = 1.
  - Réglages par défaut : température de référence 20 °C, sensibilité 50 % (0 % = journal ignoré, 100 % = effet complet).
- **Prévision :** les jours à venir sont projetés avec le seul facteur de période (aucune prévision météo) ; la date « à venir » est donc une estimation, recalculée à chaque nouvelle entrée de journal.
- **Report** (`postpone`) : la plante n'est plus signalée avant la date choisie.
- **Transparence :** la fiche plante affiche pourquoi la date a bougé (ex. « arrosage avancé d'un jour : 3 jours chauds notés »).
- Les coefficients ci-dessus sont des **valeurs heuristiques non calibrées**, regroupées dans un seul fichier de paramètres, faciles à ajuster après usage réel.

### 4.5 Journal du jour (température & météo)

- **Saisie rapide** depuis l'écran Rituels : choix de la météo (5 icônes) et température en °C (curseur / boutons +/−, préremplie avec la dernière valeur saisie).
- **Température** = température dans la maison ; **météo** = temps dehors (proxy de lumière et d'humidité). Tout champ est optionnel ; l'appli fonctionne normalement sans aucune entrée.
- **Note libre** facultative.
- Modification possible des jours passés ; le calcul d'arrosage est recalculé.
- Les notes datées par plante et les photos d'observation restent en V1.5.

### 4.6 Rituels du jour

- Écran d'accueil avec trois sections : **en retard / aujourd'hui / à venir**, regroupées par pièce.
- **Arrosage** par plante ou **par pièce entière**.
- **Glissement** droite = arrosé, gauche = repousser (« pas encore »).
- **Annulation** par toast pendant quelques secondes.
- **Arrosage rétroactif** (« arrosée hier » ou date au choix).
- **Retour haptique** et petite animation de goutte à la validation.

### 4.7 Notifications & réglages

- **Une notification quotidienne groupée** (« 3 plantes ont soif »), à l'heure choisie, fonctionnelle appli fermée.
- Programmation des **14 prochains jours**, recalculée à chaque modification de données (dont le journal du jour) et à chaque reprise de l'appli.
- Demande de **permission de notification** (Android 13+) au moment du choix de l'heure.
- Un appui sur la notification ouvre l'écran Rituels.
- **Réglages :** heure du rappel, mois de bascule, coefficient de repos, température de référence, sensibilité aux conditions, sauvegarde, export / import.

### 4.8 Sauvegarde & restauration

- **Export** en **fichier JSON** versionné (`schemaVersion`, incluant plantes, pièces, événements, `day_logs` et réglages), partagé via la feuille de partage Android. Les dessins étant embarqués dans l'appli, ils ne font pas partie de la sauvegarde.
- **Import** avec validation **Zod**, en mode « remplacer » ou « fusionner » ; un `motifId` inconnu retombe sur le dessin par défaut.
- Rappel discret si la dernière sauvegarde date de plus de 30 jours.

---

## 5. Charte graphique & UI (dessinée à la main)

- **Thème :** grimoire moderne dessiné à la main ; cadre de tarot, icônes, séparateurs et texture papier réalisés à la main ; micro-animations en CSS.
- **Palette** : parchemin `#F5F2EB`, vert sauge `#A7D18E`, vert forêt `#48742F`, vert très foncé `#3B4834` bois sombre `#7A684D`, doré `#C7B43A`
- **Typographies**, embarquées hors ligne via `@fontsource` : *Cormorant Garamond* pour les titres ; sans-serif sobre et lisible pour le corps (à choisir en phase 0). Une police tirée de mon écriture est une option V2.
- **Kit graphique minimal (hors plantes) :**
  - cadre de carte (découpé en 9 zones pour s'adapter à la taille du contenu, ou SVG) ;
  - texture papier tuilable en WebP (≤ 150 Ko) ;
  - 5 icônes météo ;
  - ~6 icônes d'interface (goutte, pièce, réglages, ajout, retour, journal) ;
  - séparateur ornemental.
- **Plantes :** un dessin par plante (ou un dessin partagé), fond transparent, au gabarit fixe défini en phase 0.
- **Spécifications d'export des dessins :** les afficher à ~3× leur taille (soit environ 500–800 px de large pour une carte) pour rester nets sur le Pixel 8a ; chaque dessin ≤ 150 Ko en WebP, poids total des assets visé < 15 Mo.
- **Chaîne de création (hors appli) :** Dessin numérique sur Krita, exporté directement en PNG transparent.
- **Pendant le développement :** icônes et motifs provisoires, remplacés au fil de l'eau.
- **Accessibilité :** contraste du texte ≥ 4,5:1 (vérifier le doré sur parchemin), texte de corps ≥ 16 px, zones tactiles ≥ 48 dp.

---

## 6. Périmètre exclu de la V1 (Backlog)

### V1.5 (prochaine étape)

- **Boutures :** stades (eau → racines → terre), lien vers la plante mère, rappels de changement d'eau.
- **Timeline d'observation** par plante (photos facultatives pour suivre l'évolution, à confirmer ; réintroduirait l'appareil photo, le stockage d'images et l'export ZIP).
- **Fertilisation** et **rempotage** (nouveaux types d'événements).
- **Notes datées par plante.**
- **Filtres et recherche.**
- **Herbier des plantes disparues** (plantes archivées).
- Sensibilité aux conditions **réglable par plante**.
- **Température par pièce** (une seule température pour toute la maison en V1).

### V2 (évolutions futures)

- Base d'espèces embarquée (~50 plantes) et alertes de période de rempotage par espèce.
- **Almanach botanique** et affichage des **4 saisons**.
- Bibliothèque de motifs dessinés par espèce.
- Noms d'arcanes pour les plantes.
- Police manuscrite tirée de mon écriture.
- Thème sombre alternatif.
- Statistiques d'arrosage et **calibrage des coefficients** à partir de l'historique (arrosages vs conditions notées).
- Widget Android pour l'écran d'accueil.

### Idées peu probables (contraires à l'esprit « 100 % local »)

- API météo automatique.
- Synchronisation entre appareils.

---

## 7. Critères de validation (« Definition of Done » V1)

1. **Rappels fiables :** 7 jours consécutifs sans rappel manqué, appli fermée, dont un redémarrage du téléphone.
2. **Saisie rapide :** de l'appui sur « + » à la plante visible dans la liste en moins de 20 s
3. **Arrosage :** retour visuel et haptique immédiat, annulable pendant quelques secondes.
4. **Journal du jour :** une entrée (météo + température) saisie en moins de 10 s ; l'appli reste pleinement utilisable sans aucune entrée.
5. **Calcul vérifié par tests :** sans journal, résultat identique au calcul de base ; une série de jours chauds avance la date ; une série de jours froids la recule ; sensibilité à 0 % = journal sans effet ; passage croissance / repos au milieu d'un cycle géré jour par jour.
6. **Dessins :** remplacer un placeholder par un dessin (même `motifId`) l'affiche partout sans modification de code ni de données ; transparence respectée.
7. **Sauvegarde :** restauration du JSON sur une installation vierge avec le même nombre de plantes, de pièces, d'événements et d'entrées de journal, et les mêmes dessins associés.
8. **Mise à jour :** installer un nouvel APK par-dessus l'ancien conserve toutes les données.
9. **Performance :** 100 plantes de test sans à-coups au défilement.
10. **Visuel :** interface cohérente avec le kit graphique minimal (motifs provisoires acceptés), contrastes et tailles conformes (§5), portrait sur Pixel 8a.

---

## 8. Règle de périmètre

Toute nouvelle idée va dans le backlog (§6), jamais directement en V1. Le backlog est réexaminé à la fin de la phase d'usage réel (1 à 2 semaines avec toutes les plantes), pas avant. Les dessins définitifs ne conditionnent pas la sortie de la V1.
