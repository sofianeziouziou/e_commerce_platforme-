# Etape 4 - Repositories, DTO et contrats API REST

## 1. Objectif

Preparer les contrats techniques entre :

- le backend Spring Boot ;
- l'application web React ;
- l'application mobile Flutter.

Cette etape cree :

- les repositories Spring Data JPA ;
- les DTO d'entree et de sortie ;
- le format commun des erreurs ;
- les conventions REST ;
- la liste des endpoints prevus.

La logique metier complete sera developpee dans les prochaines etapes.

## 2. Repositories crees

Package :

```text
backend/src/main/java/com/ziouziou/freshmarket/infrastructure/persistence/repository/
```

Repositories :

- `UserRepository`
- `RoleRepository`
- `CustomerRepository`
- `AddressRepository`
- `CategoryRepository`
- `ProductRepository`
- `ProductImageRepository`
- `InventoryRepository`
- `CartRepository`
- `CartItemRepository`
- `OrderRepository`
- `OrderItemRepository`
- `PaymentRepository`
- `PromotionRepository`
- `FavoriteRepository`
- `NotificationRepository`

Decision :

Les repositories sont dans `infrastructure` car Spring Data JPA est un detail technique. Le domaine ne depend pas directement de Spring Data.

## 3. DTO crees

Package :

```text
backend/src/main/java/com/ziouziou/freshmarket/interfaces/rest/dto/
```

Groupes :

- `auth`
- `catalog`
- `cart`
- `customer`
- `order`
- `payment`
- `promotion`
- `favorite`
- `notification`
- `admin`
- `common`

Decision :

Les entites JPA ne doivent pas etre retournees directement par les controllers. Les DTO protegent le modele interne et stabilisent les contrats API.

## 4. Format des erreurs API

Package :

```text
backend/src/main/java/com/ziouziou/freshmarket/interfaces/rest/error/
```

Format :

```json
{
  "code": "VALIDATION_ERROR",
  "message": "La requete contient des champs invalides.",
  "path": "/api/v1/products",
  "timestamp": "2026-07-14T10:30:00+02:00",
  "fieldErrors": [
    {
      "field": "price",
      "message": "must be greater than or equal to 0"
    }
  ]
}
```

Codes standards proposes :

- `VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `BUSINESS_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_SERVER_ERROR`

## 5. Conventions API

Base URL :

```text
/api/v1
```

Pagination :

```text
?page=0&size=20&sort=createdAt,desc
```

Format pagine :

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0,
  "first": true,
  "last": true
}
```

Regles :

- les routes publiques sont accessibles sans token ;
- les routes client necessitent `ROLE_CLIENT` ;
- les routes admin necessitent `ROLE_ADMIN` ;
- les dates sont en ISO 8601 ;
- les montants sont envoyes sous forme numerique decimal ;
- les endpoints admin commencent par `/api/v1/admin`.

## 6. Contrats REST prevus

## 6.1 Authentification

### POST `/api/v1/auth/register`

Role :

- public.

Requete :

- `RegisterRequest`

Reponse :

- `AuthResponse`

Objectif :

- creer un compte client ;
- retourner un token JWT.

### POST `/api/v1/auth/login`

Role :

- public.

Requete :

- `LoginRequest`

Reponse :

- `AuthResponse`

Objectif :

- connecter un utilisateur ;
- retourner un token JWT.

### GET `/api/v1/auth/me`

Role :

- utilisateur connecte.

Reponse :

- `UserSummaryResponse`

Objectif :

- recuperer l'utilisateur courant.

## 6.2 Catalogue public

### GET `/api/v1/categories`

Role :

- public.

Reponse :

- liste de `CategoryResponse`

Objectif :

- afficher les categories actives.

### GET `/api/v1/products`

Role :

- public.

Parametres :

- `page`
- `size`
- `sort`
- `category`
- `keyword`

Reponse :

- `PageResponse<ProductResponse>`

Objectif :

- lister les produits actifs.

### GET `/api/v1/products/{slug}`

Role :

- public.

Reponse :

- `ProductResponse`

Objectif :

- afficher le detail d'un produit.

### GET `/api/v1/products/featured`

Role :

- public.

Reponse :

- `PageResponse<ProductResponse>`

Objectif :

- afficher les produits populaires.

## 6.3 Panier client

### GET `/api/v1/cart`

Role :

- `ROLE_CLIENT`

Reponse :

- `CartResponse`

### POST `/api/v1/cart/items`

Role :

- `ROLE_CLIENT`

Requete :

- `AddCartItemRequest`

Reponse :

- `CartResponse`

### PATCH `/api/v1/cart/items/{productId}`

Role :

- `ROLE_CLIENT`

Requete :

- `UpdateCartItemRequest`

Reponse :

- `CartResponse`

### DELETE `/api/v1/cart/items/{productId}`

Role :

- `ROLE_CLIENT`

Reponse :

- `204 No Content`

### DELETE `/api/v1/cart`

Role :

- `ROLE_CLIENT`

Reponse :

- `204 No Content`

## 6.4 Commandes client

### POST `/api/v1/orders`

Role :

- `ROLE_CLIENT`

Requete :

- `CreateOrderRequest`

Reponse :

- `OrderResponse`

Objectif :

- transformer le panier en commande.

### GET `/api/v1/orders`

Role :

- `ROLE_CLIENT`

Reponse :

- `PageResponse<OrderResponse>`

Objectif :

- consulter l'historique du client.

### GET `/api/v1/orders/{orderNumber}`

Role :

- `ROLE_CLIENT`

Reponse :

- `OrderResponse`

Objectif :

- consulter le detail d'une commande du client connecte.

## 6.5 Adresses client

### GET `/api/v1/addresses`

Role :

- `ROLE_CLIENT`

Reponse :

- liste de `AddressResponse`

### POST `/api/v1/addresses`

Role :

- `ROLE_CLIENT`

Requete :

- `AddressRequest`

Reponse :

- `AddressResponse`

### PUT `/api/v1/addresses/{id}`

Role :

- `ROLE_CLIENT`

Requete :

- `AddressRequest`

Reponse :

- `AddressResponse`

### DELETE `/api/v1/addresses/{id}`

Role :

- `ROLE_CLIENT`

Reponse :

- `204 No Content`

## 6.6 Favoris

### GET `/api/v1/favorites`

Role :

- `ROLE_CLIENT`

Reponse :

- liste de `FavoriteResponse`

### POST `/api/v1/favorites/{productId}`

Role :

- `ROLE_CLIENT`

Reponse :

- `FavoriteResponse`

### DELETE `/api/v1/favorites/{productId}`

Role :

- `ROLE_CLIENT`

Reponse :

- `204 No Content`

## 6.7 Notifications

### GET `/api/v1/notifications`

Role :

- utilisateur connecte.

Reponse :

- `PageResponse<NotificationResponse>`

### GET `/api/v1/notifications/unread-count`

Role :

- utilisateur connecte.

Reponse :

- `CountResponse`

### PATCH `/api/v1/notifications/{id}/read`

Role :

- utilisateur connecte.

Reponse :

- `NotificationResponse`

## 6.8 Administration catalogue

### POST `/api/v1/admin/categories`

Role :

- `ROLE_ADMIN`

Requete :

- `CategoryUpdateRequest`

Reponse :

- `CategoryResponse`

### PUT `/api/v1/admin/categories/{id}`

Role :

- `ROLE_ADMIN`

Requete :

- `CategoryCreateRequest`

Reponse :

- `CategoryResponse`

### POST `/api/v1/admin/products`

Role :

- `ROLE_ADMIN`

Requete :

- `ProductCreateRequest`

Reponse :

- `ProductResponse`

### PUT `/api/v1/admin/products/{id}`

Role :

- `ROLE_ADMIN`

Requete :

- `ProductUpdateRequest`

Reponse :

- `ProductResponse`

### PATCH `/api/v1/admin/products/{id}/stock`

Role :

- `ROLE_ADMIN`

Objectif :

- mettre a jour la quantite disponible.

Requete :

- `UpdateInventoryRequest`

## 6.9 Administration commandes

### GET `/api/v1/admin/orders`

Role :

- `ROLE_ADMIN`

Reponse :

- `PageResponse<OrderResponse>`

### GET `/api/v1/admin/orders/{orderNumber}`

Role :

- `ROLE_ADMIN`

Reponse :

- `OrderResponse`

### PATCH `/api/v1/admin/orders/{orderNumber}/status`

Role :

- `ROLE_ADMIN`

Requete :

- `UpdateOrderStatusRequest`

Reponse :

- `OrderResponse`

## 6.10 Administration promotions

### GET `/api/v1/admin/promotions`

Role :

- `ROLE_ADMIN`

Reponse :

- liste de `PromotionResponse`

### POST `/api/v1/admin/promotions`

Role :

- `ROLE_ADMIN`

Requete :

- `PromotionRequest`

Reponse :

- `PromotionResponse`

### PUT `/api/v1/admin/promotions/{id}`

Role :

- `ROLE_ADMIN`

Requete :

- `PromotionRequest`

Reponse :

- `PromotionResponse`

## 6.11 Administration dashboard

### GET `/api/v1/admin/dashboard`

Role :

- `ROLE_ADMIN`

Reponse :

- `DashboardSummaryResponse`

## 7. Ce qui reste pour l'etape suivante

L'etape 5 pourra commencer l'implementation backend reelle :

- services applicatifs ;
- mappers ;
- controllers REST ;
- logique catalogue ;
- endpoints publics categories/produits ;
- tests unitaires et integration.

## 8. Checklist de validation

- [ ] Les repositories sont valides.
- [ ] Les DTO couvrent les besoins web et mobile.
- [ ] Le format d'erreur est accepte.
- [ ] La pagination est acceptee.
- [ ] Les routes publiques sont acceptees.
- [ ] Les routes client sont acceptees.
- [ ] Les routes admin sont acceptees.
- [ ] L'etape 5 peut commencer : implementation des services et controllers du catalogue.
