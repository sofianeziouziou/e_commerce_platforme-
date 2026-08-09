# Rapport de nettoyage final — FreshMarket

**Projet :** FreshMarket (Spring Boot 3.5, React 19 + Vite, PostgreSQL 17, Flyway)
**Date :** 08/08/2026
**Périmètre :** Nettoyage post-GO PRODUCTION du code (backend + frontend) sans modification de comportement.

---

## 1. Résumé exécutif

| Domaine | Statut | Détail |
|---|---|---|
| Backend `mvn clean package` | ✅ PASS | Compilation + **tests unitaires** (2/2 verts) + jar repackagé |
| Frontend `npm run build` | ✅ PASS | `tsc -b` + `vite build`, aucun warning bloquant |
| Base de données | ✅ OK | Flyway 9/9 `success=t` ; 3 users, 2 customers, 2 orders (état propre) |
| API `/health` | ✅ UP | Backend démarré sur 8089 |
| Non-régression fonctionnelle | ✅ PASS | Machine à états, restock, promos, panier, commandes, sécurité (voir §7) |

**Verdict : ✅ CLEAN** — aucune modification de comportement, toutes les API/contrats préservés, builds verts.

---

## 2. Règles respectées

- ✅ Aucune nouvelle fonctionnalité.
- ✅ Aucune API renommée ni supprimée ; **aucun endpoint** retiré (même ceux non consommés, voir §7).
- ✅ Aucune migration Flyway modifiée (V1→V9 intactes, checksums stables).
- ✅ Aucun changement de workflow (statuts, transitions, calculs, contrats JSON).
- ✅ Seul du **code mort** (jamais référencé, vérifié) a été supprimé.
- ✅ Uniquement la **config de test H2** (pré-existante et cassée) a été corrigée — aucun comportement applicatif touché.

---

## 3. PHASES 0 — État initial

- Backend : build OK (105 fichiers source), app démarre, health UP, DB connectée, Flyway 9/9.
- Frontend : build en échec → **bug TS bloquant corrigé** dans `AdminPromotionsPage.tsx:115`
  (`set((f) => …)` inexistant → `setForm((f) => ({ …f, … }))`).
- Les **2 tests unitaires backend échouaient déjà avant tout nettoyage** (échec identique vérifié sur l'état git d'origine `412e2ae` via un worktree). Dette pré-existante, corrigée en PHASE 14.

---

## 4. PHASES 2 — Code mort supprimé (backend)

### 4.1 Fichiers supprimés (11) — aucune référence restante
| Fichier | Raison |
|---|---|
| `infrastructure/persistence/repository/FavoriteRepository.java` | Jamais injecté |
| `infrastructure/persistence/repository/PaymentRepository.java` | Jamais injecté |
| `infrastructure/persistence/repository/RoleRepository.java` | Jamais injecté |
| `infrastructure/persistence/repository/ProductImageRepository.java` | Jamais injecté |
| `infrastructure/persistence/repository/InventoryRepository.java` | Jamais injecté |
| `interfaces/rest/dto/common/IdResponse.java` | Jamais instancié |
| `interfaces/rest/dto/common/CountResponse.java` | Jamais instancié |
| `interfaces/rest/dto/favorite/FavoriteResponse.java` | Jamais instancié |
| `interfaces/rest/dto/payment/PaymentResponse.java` | Jamais instancié |
| `interfaces/rest/dto/notification/NotificationResponse.java` | Jamais instancié |
| `interfaces/rest/dto/payment/UpdatePaymentStatusRequest.java` | Jamais instancié |

Les entités `Favorite` / `Payment` sont **conservées** (mapping JPA `ddl-auto=validate`).

### 4.2 Méthodes de repositories jamais appelées supprimées
- `ProductRepository` : `findBySlug`, `existsBySlug`, `existsBySku`, `findByActiveTrue`, `findByActiveTrueAndCategorySlug`, `findByActiveTrueAndNameContainingIgnoreCase`, `findByActiveTrueAndFeaturedTrue`.
- `CategoryRepository` : tout sauf `findByStoreIdAndActiveTrueOrderByDisplayOrderAscNameAsc`.
- `OrderRepository` : `findByOrderNumber`, `findByStatus`.
- `UserRepository` : ne contient plus que `JpaRepository` (vide d'usage).
- `StoreRepository` : `findBySlug`.
- `PromotionRepository` : variante sans store.
- `CartItemRepository` : `deleteByCartIdAndProductId`.

### 4.3 Imports nettoyés
- Imports devenus inutiles après suppression (ex. `Optional`, `OrderStatus`).
- 3 wildcards `org.springframework.web.bind.annotation.*` remplacés par des imports explicites : `OrderController`, `CartController`, `AddressController` + `OrderService` (wildcard `repository.*`).

---

## 5. PHASES 4/9/12 — Frontend

| Changement | Détail |
|---|---|
| `src/shared/utils/orderStatus.ts` (créé) | Libellés + étapes de statut centralisés ; appliqués à `AdminOrdersPage`, `AdminDashboardPage`, `ProfilePage`, `OrderHistoryPage`. `OrderDetailPage` non refactoré (structure label+icon+desc différente) |
| `public/placeholder.svg` (créé) | Asset référencé par l'UI mais absent du dépôt |
| `clientApi.ts` | `getProductById` supprimé (jamais appelé) |
| Imports inutilisés retirés | `CartItemResponse`/`isAuthenticated` (CatalogPage), `isAuthenticated` (ProductDetailPage), `Sparkles` (AdminLayout), `PackageCheck` (PageShell) |
| `tailwind.config.ts` | Suppression de `fontFamily` (Inter/Poppins/Nunito jamais chargés) et `borderRadius.app` (jamais utilisé) |
| `.env.example` (racine + frontend_web) | Port aligné **8089** (valeur réelle du backend) au lieu de 8080 |
| `AdminPromotionsPage.tsx` | Bug TS corrigé (voir PHASE 0) |

---

## 6. PHASES 3/5/6/10/11 — Divers

- **Dépendances (PHASE 3)** : toutes réellement utilisées (Maven : actuator, h2-test, springdoc, devtools ; npm : lucide, tailwind, eslint…). Aucune suppression.
- **Logs (PHASE 5)** : aucun `console.log`/`System.out`/`TODO`/`printStackTrace` dans le source ; fichiers de log de dev supprimés (`codex-vite.log`, `vite.err.log`, `vite.out.log`, `backend_err.log`, `backend_out.log`).
- **Données (PHASE 6)** : aucune donnée QA en base ; les clients/commandes créés pour les tests (PHASE 15/16) ont été **supprimés** → base restaurée (3 users, 2 customers, 2 orders).
- **Wildcards backend (PHASE 10)** : voir §4.3.
- **Migrations (PHASE 11)** : V1→V9 intactes, toutes `success=t`.

---

## 7. Non-régression (PHASES 13/15/16/17)

Tous les comportements critiques ont été re-testés après nettoyage (comptes de test créés puis supprimés) :

### Sécurité (PHASE 13)
- JWT admin → `/admin/dashboard` **200** ; JWT admin → `/cart` **404** ; sans JWT → catalogue **200** ; sans JWT → admin/cart **401** ; JWT invalide **401** ; JWT client → `/admin/*` **403**.

### Parcours client (PHASE 15)
- Inscription → login → catalogue → panier → adresse → commande `CMD-7B84F9DD` (EN_ATTENTE, total 15,980) → historique → détail → notifications (0).

### Business critique (PHASE 16)
- Chaîne EN_ATTENTE→CONFIRMEE→EN_PREPARATION→EXPEDIEE→LIVREE **OK**.
- Stock décrémenté (bananes 45→43) ; restock à l'annulation (48.000) ; double annulation **idempotente** (pas de double restock) ; transitions invalides **409** ; statut inconnu **400**.
- Promotion : panier = commande (subtotal 4,250 / remise 2,000 / livraison 5,000 / total 7,250), snapshot `order_items.unit_price` au prix promo.

### Admin (PHASE 15)
- Dashboard (21 produits, 2 promos, 3 clients), catégories 27, promotions, clients, commandes, notifications 0.

### API non consommées — conservées (décision documentée)
- `GET /catalog/products/featured` et `POST /auth/register-admin` ne sont pas appelés par le frontend ni le mobile, mais **aucun endpoint n'a été supprimé** (règle stricte).

---

## 8. PHASE 14 — Correction des tests unitaires (dette pré-existante)

Les 2 tests échouaient **avant** le nettoyage (vérifié sur l'état git d'origine). Causes et corrections :

| Test | Cause racine | Correction |
|---|---|---|
| `FreshMarketApplicationTests.contextLoads` | H2 configuré `ddl-auto=none` + Flyway désactivé → aucune table ; `CatalogQueryService` requête `stores` à la construction du bean → `Table "stores" not found` | `ddl-auto=create-drop` + seed H2 `src/test/resources/import.sql` (rôles + magasin actif) ; `FreshMarketInitializer` (runner de dev) mocké via `@MockitoBean` |
| `HealthControllerTest` | `@WebMvcTest` + `@EnableJpaAuditing` (classe principale) → exige `jpaMappingContext` (metamodel vide) puis bean `auditingDateTimeProvider` (composant exclu du slice web) | `@MockitoBean JpaMetamodelMappingContext` + `@TestConfiguration` fournissant le bean `auditingDateTimeProvider` |

**Résultat : `mvn clean package` = BUILD SUCCESS, 2/2 tests verts.**

---

## 9. État final de la base

- 3 users (admin, client seed, compte dev), 2 customers, 2 orders, 0 notifications, stock cohérent.
- Aucune donnée de test résiduelle.

---

## 10. Conclusion

Le nettoyage n'a introduit **aucune régression** : builds verts (backend + frontend), tests verts, parcours et règles métier inchangés, base propre. Les seules suppressions portent sur du code mort vérifié et des fichiers de log. La seule dette résolue est la **config H2 des tests**, qui était cassée depuis sa création et indépendante du comportement applicatif.

**Décision : ✅ CLEAN — prêt pour la production.**
