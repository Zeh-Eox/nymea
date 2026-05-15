# Nymea

Application mobile de suivi du cycle menstruel — frontend **Expo (React Native)** + backend **Node.js / Express / Prisma / PostgreSQL**.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture du repo](#architecture-du-repo)
- [Prérequis](#prérequis)
- [Démarrage rapide (dev local)](#démarrage-rapide-dev-local)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Tester l'app sur un téléphone](#tester-lapp-sur-un-téléphone)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)
- [Scripts utiles](#scripts-utiles)

---

## Fonctionnalités

- 🔐 Auth complète (JWT access 15 min + refresh opaque 30 j, rotation, bcrypt)
- 🌸 Onboarding guidé (date des dernières règles + longueurs par défaut)
- 📆 Suivi des cycles (CRUD, longueurs auto-calculées)
- 📓 Journal quotidien (humeur, symptômes 1→5, sommeil, hydratation, libido, poids)
- 🗓 Calendrier maison avec phases du cycle (menstruelle / folliculaire / ovulation / lutéale)
- 🔮 Prédictions (moyenne pondérée, fenêtre fertile, badge de confiance)
- 📊 Statistiques (régularité, top symptômes, distribution d'humeurs, graphe maison)
- 🔔 Notifications push (Expo Push API, cron J‑2 / J / ovulation / journal du soir)
- 👤 Profil & paramètres (édition, changement mot de passe, suppression RGPD)
- 🌙 Thème clair / sombre / système

## Stack technique

| Couche       | Choix                                                              |
| ------------ | ------------------------------------------------------------------ |
| Mobile       | Expo SDK 54, expo-router 6, React 19, React Native 0.81, TS strict |
| UI           | NativeWind 4, Zustand, React Hook Form + Zod                       |
| API          | Node 20, Express, TypeScript, helmet/cors/morgan, pino             |
| ORM / DB     | Prisma 5, PostgreSQL 16 (Docker en local, Neon en prod)            |
| Auth         | JWT + bcrypt + refresh tokens rotatifs                             |
| Push         | Expo Push API + `node-cron`                                        |

## Architecture du repo

```
/nymea
├── mobile/                  # Expo + expo-router (file-based routing)
│   ├── app/                 # Routes (auth, onboarding, tabs)
│   ├── components/          # Design system (Button, Card, Chip, …)
│   ├── hooks/               # use-auth, use-cycles, use-prediction, use-theme…
│   ├── services/            # Axios + appels API
│   ├── store/               # Zustand (auth, cycle, entry, theme, toast)
│   ├── theme/               # Tokens design
│   ├── utils/               # Helpers (date, cycle, cycle-phase)
│   └── validators/          # Schemas Zod
│
├── server/                  # API Express + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/        # auth / cycle / entry / prediction / stats / push
│   │   ├── validators/      # Schemas Zod (in/out)
│   │   └── config/
│   └── prisma/              # schema.prisma + migrations + seed.ts
│
└── docker-compose.yml       # Postgres local (dev uniquement)
```

## Prérequis

- **Node 20 LTS** (pinné via `.nvmrc` dans `mobile/` et `server/`)
  - Les versions plus récentes cassent Metro / les bindings natifs de `bcrypt`.
- **Docker** (ou un Postgres local) pour la DB de dev
- **Expo Go** sur le téléphone (Android ou iOS) pour tester en LAN
- Un compte **Expo** (gratuit) pour les push notifications

## Démarrage rapide (dev local)

```bash
# 1. Cloner
git clone https://github.com/<user>/nymea.git
cd nymea

# 2. Backend
cd server
cp .env.example .env            # remplir les secrets JWT
npm install
npm run db:up                   # lance Postgres via docker-compose
npx prisma migrate dev          # applique les migrations
npx prisma db seed              # (optionnel) compte demo@nymea.app / Demo1234!
npm run dev                     # API sur http://localhost:4000

# 3. Mobile (autre terminal)
cd ../mobile
cp .env.example .env            # définir EXPO_PUBLIC_API_BASE_URL
npm install
npm start                       # puis appuie sur 'a' pour Android, 'i' pour iOS
```

> Si tu testes sur un téléphone physique en LAN, `EXPO_PUBLIC_API_BASE_URL` doit pointer vers l'IP locale de la machine qui fait tourner l'API (ex. `http://192.168.x.x:4000/api`), **pas** `localhost`.

## Configuration des variables d'environnement

### `server/.env`

| Variable                  | Description                                          | Exemple                                          |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `NODE_ENV`                | `development` / `production` / `test`                | `development`                                    |
| `PORT`                    | Port HTTP                                            | `4000`                                           |
| `DATABASE_URL`            | URL Postgres (local Docker ou Neon)                  | `postgresql://postgres:postgres@localhost:5432/nymea?schema=public` |
| `JWT_ACCESS_SECRET`       | Secret access token (≥ 16 chars)                     | *(à générer)*                                    |
| `JWT_REFRESH_SECRET`      | Secret refresh token (≥ 16 chars)                    | *(à générer)*                                    |
| `JWT_ACCESS_EXPIRES_IN`   | Durée access                                         | `15m`                                            |
| `JWT_REFRESH_EXPIRES_IN`  | Durée refresh                                        | `30d`                                            |
| `BCRYPT_ROUNDS`           | Coût bcrypt                                          | `10`                                             |
| `CORS_ORIGIN`             | Origines autorisées (ou `*` en dev)                  | `*`                                              |
| `ENABLE_PUSH_SCHEDULER`   | Active les cron push (`true` en prod uniquement)     | `false`                                          |
| `PUSH_SCHEDULER_TZ`       | Timezone des crons                                   | `Europe/Paris`                                   |

Génère des secrets robustes :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### `mobile/.env`

| Variable                    | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`  | URL de l'API (suffixe `/api`). Inlinée au build.         |

Exemples :
- Émulateur Android : `http://10.0.2.2:4000/api`
- iOS simulator : `http://localhost:4000/api`
- Téléphone en LAN : `http://192.168.x.x:4000/api`
- Prod (Neon + backend déployé) : `https://api.tonsite.com/api`

## Tester l'app sur un téléphone

### Avec Expo Go (le plus simple)

1. Téléphone et machine **sur le même WiFi**.
2. Récupérer l'IP locale :
   ```bash
   ip addr show | grep 'inet '            # Linux
   ipconfig getifaddr en0                 # macOS
   ```
3. Mettre `EXPO_PUBLIC_API_BASE_URL=http://<ip>:4000/api` dans `mobile/.env`.
4. `cd server && npm run dev` (sur la machine).
5. `cd mobile && npm start`, scanner le QR code avec **Expo Go**.

> ⚠️ Les notifications push **ne fonctionnent pas dans Expo Go SDK 53+**. Pour les tester, il faut faire un **dev build** via EAS (`npx expo install expo-dev-client` puis `eas build --profile development`).

### Donner accès à une connaissance

Deux options :

1. **Expo Go + tunnel** (rapide, dépendant du PC) :
   ```bash
   cd mobile && npx expo start --tunnel
   ```
   Partager le QR code. Le PC doit rester allumé pendant le test.

2. **Build standalone via EAS** (recommandé pour tester sereinement) :
   ```bash
   npm install -g eas-cli
   eas login
   cd mobile && eas build --profile preview --platform android
   ```
   Tu obtiens un `.apk` à envoyer (WhatsApp / Drive). Le backend doit déjà être déployé (Neon + Railway/Render).

## Base de données

### Local (dev)

```bash
cd server
npm run db:up           # docker compose up postgres
npx prisma migrate dev  # applique les migrations
npx prisma studio       # GUI sur http://localhost:5555
```

### Production : Neon (PostgreSQL serverless)

1. Créer un projet sur [neon.tech](https://neon.tech) → récupérer la **connection string** (avec `?sslmode=require`).
2. Mettre cette URL dans `DATABASE_URL` du serveur déployé (Railway / Render / Fly.io).
3. Lancer les migrations en prod :
   ```bash
   DATABASE_URL="postgres://...neon.tech/.../?sslmode=require" \
     npx prisma migrate deploy
   ```
   (à faire une fois, ou via le hook de build du PaaS).

> **Pooler Neon** : pour un backend serverless, utilise l'URL `-pooler.` fournie par Neon. Pour un backend long-running (Railway/Render), l'URL directe convient.

### Reset complet (dev)

```bash
cd server
npx prisma migrate reset    # drop + recrée + re-seed
```

## Déploiement

| Composant   | Cible suggérée                              |
| ----------- | ------------------------------------------- |
| API         | Railway / Render / Fly.io                   |
| DB          | **Neon** (✅ choisi)                        |
| Mobile      | EAS Build → Play Store / TestFlight         |
| Monitoring  | UptimeRobot + Sentry (à brancher)           |

Checklist avant push prod :

- [ ] `DATABASE_URL` Neon avec `sslmode=require`
- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` régénérés (longs et uniques)
- [ ] `CORS_ORIGIN` restreint au domaine du client (pas `*`)
- [ ] `ENABLE_PUSH_SCHEDULER=true` sur **un seul** dyno/instance (évite les doublons)
- [ ] `npx prisma migrate deploy` exécuté
- [ ] `EXPO_PUBLIC_API_BASE_URL` dans le build mobile = URL HTTPS de l'API

## Scripts utiles

### Backend

```bash
npm run dev               # ts-node-dev hot-reload
npm run build && npm start # build + run prod
npm run typecheck
npm run prisma:migrate    # nouvelle migration en dev
npm run prisma:deploy     # applique en prod
npm run prisma:studio
npm run prisma:seed       # injecte demo@nymea.app + données
```

### Mobile

```bash
npm start                 # Expo dev server (LAN par défaut)
npx expo start --tunnel   # via Expo tunnel (utile en partage)
npm run android           # build natif Android (émulateur)
npm run ios               # build natif iOS (simulateur, macOS uniquement)
npm run lint
```

## Conventions

- **TypeScript strict** partout (mobile + server)
- Nom de fichiers : `kebab-case` (`cycle-card.tsx`, `auth.service.ts`)
- Composants : `PascalCase`, un par fichier
- Validation : **Zod** des deux côtés (front + back)
- Commits : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`)

## Licence

Privé — projet personnel, pas encore publié.
