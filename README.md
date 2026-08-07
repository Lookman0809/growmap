# GrowMap

Votre jardin, parfaitement organisé. Application PWA (installable, hors-ligne) pour cartographier votre jardin, suivre vos plantations et vos tâches d'entretien.

## Développement local

```bash
npm install
npm run dev
```

## Déploiement sur GitHub Pages (recommandé : automatique)

1. Créez un dépôt GitHub (public) et poussez-y ce projet.
2. Dans **Settings → Pages**, réglez « Source » sur **GitHub Actions**.
3. Poussez sur la branche `main` : le workflow `.github/workflows/deploy.yml` build et déploie automatiquement le site. Le lien final apparaît dans l'onglet **Actions** une fois le déploiement terminé, ou dans **Settings → Pages**.

Tout push sur `main` redéploie automatiquement.

## Déploiement manuel (alternative)

```bash
npm run build
```

Le contenu buildé se trouve dans `dist/`. Vous pouvez le déployer avec n'importe quel outil (`gh-pages`, upload manuel, etc.) sur la branche de votre choix.

## Données : stockage local

Toutes vos données (jardin, tâches, préférences) sont stockées dans le `localStorage` de votre navigateur, sur l'appareil utilisé — rien n'est envoyé à un serveur sauf si vous configurez la synchronisation GitHub (voir ci-dessous).

## Deux dépôts, pas un seul

GrowMap fonctionne avec **deux dépôts GitHub distincts** :

1. **Ce dépôt (public)** — le code du site, déployé sur GitHub Pages. Ne contient jamais vos données personnelles.
2. **Un second dépôt (privé, à créer séparément)** — sert uniquement à stocker votre fichier de données synchronisé et, si vous l'activez, à envoyer les notifications planifiées. Un modèle prêt à l'emploi pour ce dépôt privé vous a été fourni à part (`growmap-data-repo`).

Cette séparation est volontaire : le site reste public et partageable sans jamais exposer vos plantations, tâches ou abonnements de notification.

## Synchronisation entre appareils

Dans l'application : **Profil → Réglages avancés → Synchronisation GitHub**. Un guide pas à pas est disponible directement dans l'app (**Réglages avancés → Aide**).

En résumé :
1. Créez le dépôt **privé** séparé (voir `growmap-data-repo/README.md`).
2. Créez un token d'accès personnel *fine-grained*, limité à ce seul dépôt privé, avec la permission « Contents: Read and write ».
3. Dans GrowMap, renseignez le token, le propriétaire, **le nom du dépôt privé**, la branche et le nom de fichier.
4. Utilisez « Envoyer » depuis l'appareil source, « Récupérer » sur les autres.

## Notifications

Deux niveaux, expliqués en détail dans l'app (**Réglages avancés → Aide**) et dans `growmap-data-repo/README.md` :

- **Rappels app ouverte** : fonctionnent immédiatement, aucune configuration serveur nécessaire. Autorisez simplement les notifications dans **Profil → Réglages avancés → Notifications**.
- **Rappels app fermée (avancé)** : nécessitent une paire de clés VAPID et deux secrets, configurés dans le **dépôt privé de données** (pas celui-ci) — c'est ce dépôt qui exécute le job planifié, puisqu'un job GitHub Actions ne peut lire que les fichiers de son propre dépôt.

## Icônes

Les icônes PWA (`public/icons/`, `public/favicon-32.png`, `public/apple-touch-icon.png`) sont fournies. Pour les régénérer ou les personnaliser, remplacez ces fichiers PNG directement — aucune étape de build n'est nécessaire pour eux.

## Structure du projet

```
├── public/
│   ├── manifest.json          # Manifeste PWA
│   ├── service-worker.js      # Cache hors-ligne + réception des notifications push
│   ├── icons/                 # Icônes de l'app
├── src/
│   ├── App.jsx                # Application complète
│   ├── storage.js             # Persistance locale (localStorage)
│   ├── main.jsx                # Point d'entrée React
│   └── index.css
├── .github/workflows/
│   └── deploy.yml              # Build + déploiement GitHub Pages automatique
```

Le job planifié de notifications (`send-notifications.yml`) et son script ne sont **pas** dans ce dépôt — voir `growmap-data-repo/`, à créer comme dépôt **privé** séparé.
