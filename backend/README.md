# Backend - FreshMarket API

API REST unique pour les applications web et mobile.

## Stack

- Spring Boot 3.
- Spring Security avec JWT.
- Spring Data JPA.
- PostgreSQL.
- Flyway pour les migrations.
- Swagger/OpenAPI via springdoc.

## Structure

```text
src/main/java/com/ziouziou/freshmarket
├── FreshMarketApplication.java
├── application/       # Cas d'utilisation et services applicatifs
├── domain/            # Modeles metier purs et contrats
├── infrastructure/    # Configuration, persistance, securite, integrations
└── interfaces/        # API REST, DTO et adapters entrants
```

## Demarrer

```bash
mvn spring-boot:run
```

Avec Docker PostgreSQL :

```bash
docker compose up -d postgres
mvn spring-boot:run
```

## Endpoints techniques

- `GET /api/v1/health`
- `GET /actuator/health`
- `GET /swagger-ui.html`

