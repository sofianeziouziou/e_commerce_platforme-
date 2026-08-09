# FreshMarket / Magasin Ziouziou

Plateforme e-commerce alimentaire composee de :

- `backend` : API REST Spring Boot 3.
- `frontend_web` : application web React + TypeScript + Vite.
- `mobile` : application mobile Flutter.
- `docker-compose.yml` : services d'environnement, principalement PostgreSQL.

Cette base correspond uniquement a l'etape 1 : preparation de l'environnement.
Aucune fonctionnalite metier n'est encore developpee.

## Prerequis

- Java 17 ou 21.
- Maven 3.9+ ou Maven Wrapper.
- Node.js LTS recommande, puis npm.
- Flutter SDK stable pour l'application mobile.
- Docker Desktop avec Docker Compose.
- Git.
- PostgreSQL local optionnel si Docker n'est pas utilise.

## Demarrage rapide

```bash
cp .env.example .env
docker compose up -d postgres pgadmin
```

Sur cette machine, la commande disponible est probablement :

```bash
docker-compose up -d postgres pgadmin
```

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
flutter pub get
flutter run
```

Execution Docker complete :

```bash
docker-compose --profile apps up --build
```
