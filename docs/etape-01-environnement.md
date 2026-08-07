# Etape 1 - Preparation de l'environnement

## Objectif

Preparer une architecture complete et maintenable pour une plateforme de vente alimentaire :

- Backend unique en Spring Boot 3.
- Application web React + TypeScript + Vite.
- Application mobile Flutter.
- Base PostgreSQL.
- Documentation API via Swagger/OpenAPI.
- Environnement Docker pour simplifier le demarrage.

## Decisions techniques

- Monorepo : les trois applications restent dans un seul depot Git pour faciliter la synchronisation des contrats API, la documentation et le demarrage local.
- Backend separe en couches `domain`, `application`, `infrastructure` et `interfaces` pour respecter Clean Architecture.
- Frontend web organise par `app`, `features`, `shared` et `routes` afin d'eviter un dossier plat difficile a maintenir.
- Mobile Flutter organise par `core`, `features` et `shared` pour garder la meme logique modulaire que le web.
- PostgreSQL est lance par Docker Compose pour garantir un environnement reproductible.

## Arborescence cible

```text
.
├── backend/
│   ├── src/main/java/com/ziouziou/freshmarket/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   ├── src/main/resources/
│   ├── src/test/java/
│   ├── Dockerfile
│   └── pom.xml
├── frontend_web/
│   ├── src/app/
│   ├── src/features/
│   ├── src/routes/
│   ├── src/shared/
│   ├── src/styles/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── mobile/
│   ├── lib/src/app/
│   ├── lib/src/core/
│   ├── lib/src/features/
│   ├── lib/src/shared/
│   ├── test/
│   └── pubspec.yaml
├── docs/
├── docker-compose.yml
├── .env.example
├── .editorconfig
├── .gitignore
└── README.md
```

## Branches Git recommandees

- `main` : branche stable, livrable.
- `develop` : integration continue des fonctionnalites.
- `feature/<nom>` : developpement d'une fonctionnalite.
- `fix/<nom>` : correction ciblee.
- `release/<version>` : preparation d'une version.

Commandes :

```bash
git init
git branch -M main
git checkout -b develop
```

Note : l'initialisation Git n'a pas ete forcee automatiquement car l'autorisation d'ecriture dans `.git` a ete refusee par le sandbox.

## Commandes de creation des projets

Backend Spring Boot, equivalent Initializr :

```bash
curl https://start.spring.io/starter.zip ^
  -d type=maven-project ^
  -d language=java ^
  -d bootVersion=3.5.16 ^
  -d groupId=com.ziouziou ^
  -d artifactId=freshmarket-api ^
  -d name=freshmarket-api ^
  -d packageName=com.ziouziou.freshmarket ^
  -d javaVersion=17 ^
  -d dependencies=web,security,oauth2-resource-server,data-jpa,validation,actuator,postgresql,flyway ^
  -o backend.zip
```

Frontend React/Vite :

```bash
npm create vite@latest frontend_web -- --template react-ts
cd frontend_web
npm install
npm install lucide-react react-router-dom
npm install -D tailwindcss postcss autoprefixer eslint
npx tailwindcss init -p
```

Mobile Flutter :

```bash
flutter create mobile --org com.ziouziou.freshmarket --project-name freshmarket_mobile --platforms android,ios
```

## PostgreSQL

Configuration locale recommandee :

- Host : `localhost`
- Port : `5432`
- Database : `freshmarket`
- User : `freshmarket_user`
- Password : `Sofiane03`

Demarrage avec Docker Compose :

```bash
docker-compose up -d postgres pgadmin
```

Ou avec la syntaxe moderne si disponible :

```bash
docker compose up -d postgres pgadmin
```

Interface pgAdmin :

- URL : `http://localhost:5050`
- Email : `admin@freshmarket.local`
- Password : `admin`

## Demarrage des composants

Backend :

```bash
cd backend
mvn spring-boot:run
```

Frontend web :

```bash
cd frontend_web
npm install
npm run dev
```

Mobile :

```bash
cd mobile
flutter create . --org com.ziouziou.freshmarket --project-name freshmarket_mobile --platforms android,ios
flutter pub get
flutter run
```

Docker complet :

```bash
docker-compose --profile apps up --build
```

## Tests

Backend :

```bash
cd backend
mvn test
```

Frontend web :

```bash
cd frontend_web
npm run typecheck
npm run lint
npm run build
```

Mobile :

```bash
cd mobile
flutter analyze
flutter test
```

## Verification locale

```bash
java -version
node --version
npm --version
git --version
docker --version
docker compose version
flutter --version
psql --version
```

Notes detectees sur cette machine :

- Java 17 est disponible.
- Git est disponible.
- Node.js est disponible.
- `npm.ps1` est bloque par PowerShell ; utiliser `npm.cmd` ou ajuster la policy PowerShell.
- Maven n'est pas detecte dans le `PATH`.
- Flutter n'est pas detecte dans le `PATH`.
- Docker est installe.
- `docker-compose` est disponible.
- `docker compose` n'est pas detecte par cette installation Docker.
- Docker Desktop n'est pas lance actuellement : le daemon `dockerDesktopLinuxEngine` est introuvable.
- Docker signale aussi un probleme d'acces a `C:\Users\sofiane\.docker\config.json`.
- `psql` n'est pas detecte dans le `PATH`.
- Le frontend web compile avec `npm run build` et passe `npm run lint`.
- Le serveur Vite a ete demarre sur `http://127.0.0.1:5173/`.

## Checklist de validation

- [ ] Les dossiers `backend`, `frontend_web` et `mobile` existent.
- [ ] PostgreSQL demarre via Docker ou installation locale.
- [ ] Le backend compile et demarre sur le port `8080`.
- [ ] Swagger est disponible sur `/swagger-ui.html`.
- [ ] Le frontend web demarre sur le port `5173`.
- [ ] L'application Flutter execute `flutter analyze`.
- [ ] Git est initialise avec `main` et `develop`.
- [ ] Les variables sensibles sont dans `.env`, jamais versionnees.
