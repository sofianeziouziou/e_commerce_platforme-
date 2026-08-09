# Rapport de validation finale — Go / No Go

Date : 02/08/2026
Périmètre : validation complète de mise en production (Phases 1 à 8) sur base de données vierge.
Règle suivie : aucune nouvelle fonctionnalité, aucun refactoring, aucun changement d'architecture. Uniquement des correctifs à la racine des bugs constatés. Toutes les lignes ci-dessous proviennent de tests réels exécutés contre le backend (port 8089) et le frontend (Vite, port 5173).

## Légende
- **VALIDÉ** : comportement constaté conforme et testé.
- **NON VALIDÉ** : problème constaté, justifié.
- **Observation** : constat non bloquant.

---

## Phase 1 — Environnement et démarrage

| Contrôle | Verdict | Justification |
|---|---|---|
| Démarrage backend + santé | VALIDÉ | `GET /actuator/health` → `{"status":"UP"}`. |
| Base de données vierge | VALIDÉ | DROP/CREATE DATABASE, Flyway V1–V8 appliquées (8/8). |
| Baseline | VALIDÉ | 1 admin, 1 store, 27 catégories, 21 produits, 21 inventaires, 2 promotions, 0 commandes, 0 notifications. |
| Validation Hibernate | VALIDÉ | `ddl-auto: validate` passe au démarrage (reconstruit 3× durant cette session). |
| Frontend (Vite) | VALIDÉ | `http://127.0.0.1:5173` → 200 ; page d'accueil servie ; transformation des pages modifiées OK. |

---

## Phase 2 — Build et tests

| Contrôle | Verdict | Justification |
|---|---|---|
| Build backend `mvn clean package -DskipTests` | VALIDÉ | BUILD SUCCESS (Maven 3.9.16, Java 17). |
| Compilation TS frontend | VALIDÉ | `npm run typecheck` → exit 0. |
| Tests JUnit | NON VALIDÉ (pré-existant) | 2 erreurs au chargement du contexte, non liées aux correctifs : (1) `FreshMarketApplicationTests` — H2 vide (`ddl-auto=none` + `flyway.enabled=false`) → `Table "stores" not found` ; (2) `HealthControllerTest` — `@WebMvcTest` + `@Import(SecurityConfig)` → `JPA metamodel must not be empty`. Configuration d'infrastructure de test incorrecte (à corriger séparément). |
| Lint frontend | Observation | 12 erreurs + 7 avertissements pré-existants (imports inutilisés, exhaustive-deps). Aucun nouveau introduit par les correctifs. Sans impact runtime (tsc passe). |

---

## Phase 3 — Workflow complet

| Contrôle | Verdict | Justification |
|---|---|---|
| Inscription + connexion client | VALIDÉ | `prod_client@freshmarket.tn` enregistré, login 200, JWT émis. |
| Catalogue (pagination, recherche, filtres) | VALIDÉ | Pagination 0-indexée OK, recherche et filtre catégorie OK. |
| Panier (ajout / lecture / suppression) | VALIDÉ | Ajout 201, lecture 200, suppression panier OK (re-testé après correctifs R1). |
| Adresse | VALIDÉ | Création 201, récupération 200. |
| Commande | VALIDÉ | `POST /api/v1/orders` → 201 ; `CMD-E24F3E2B` ; statuts EN_ATTENTE → CONFIRMEE → EN_PREPARATION → EXPEDIEE → LIVREE (4×200). |
| Historique + détail commande | VALIDÉ | 200, montants exacts (sous-total, livraison 5.0, total). |
| Notifications | VALIDÉ | Notifications ORDER_STATUS créées, non-lues comptées, lecture de masse OK. |
| Tableau de bord admin | VALIDÉ | Total produits, commandes en attente, commandes du jour OK. |
| CRUD admin (produits, catégories, promotions, clients, inventaire) | VALIDÉ | Create/Update/Delete 200/201/204. |
| Décrément des stocks après commande | VALIDÉ | 48→46 et 48→45 après la commande test. |
| Déconnexion | Observation | 200 mais le JWT reste valide (stateless, pas de révocation). Comportement attendu pour un JWT sans blacklist. |

---

## Phase 4 — Cas d'erreur et sécurité

| Contrôle | Verdict | Justification |
|---|---|---|
| Panier vide → commande | VALIDÉ | 400 `CART_EMPTY`. |
| Adresse inexistante | VALIDÉ | 404 `RESOURCE_NOT_FOUND` « Adresse introuvable ». |
| Stock insuffisant | VALIDÉ | 400 `INSUFFICIENT_STOCK` (« disponible : 46, demande : 10001 »). |
| Produit inexistant au panier | VALIDÉ | 404 `RESOURCE_NOT_FOUND`. |
| Non authentifié / token invalide | VALIDÉ | 401 (no token, token bidon, JWT signé mais expiré). |
| Client → endpoint admin | VALIDÉ | 403. |
| Admin → endpoint client | VALIDÉ | 404 (pas de fuite de données). |
| Commande inexistante (client et admin) | VALIDÉ | 404 `RESOURCE_NOT_FOUND`. |
| Accès croisé à la commande d'un autre client | VALIDÉ | 400 `FORBIDDEN`. |
| Statut invalide | VALIDÉ | 400 `MALFORMED_REQUEST`. |
| **BUG 20 — produit inactif ajouté au panier** | VALIDÉ (corrigé) | `CartService.addItem` ne vérifiait pas `product.isActive()`. Ajout d'une garde → 400 `PRODUCT_INACTIVE`. Re-testé : produit inactif rejeté, produit actif accepté. |
| **BUG 21 — suppression produit référencé en panier** | VALIDÉ (corrigé) | `DELETE /admin/products/{id}` → 500 (FK RESTRICT non géré). Ajout d'une garde dans `AdminService.deleteProduct` → 400 `PRODUCT_IN_CART` ; 204 une fois les références purgées ; inventaire en cascade supprimé. |
| Suppression catégorie avec produits | VALIDÉ | 400 `CATEGORY_HAS_PRODUCTS`. |

---

## Phase 5 — Logs

| Contrôle | Verdict | Justification |
|---|---|---|
| Logs backend | VALIDÉ | 0 ERROR / 0 WARN (hors bloc initializer) / 0 exception / 0 « 500 » après les correctifs. |
| Logs frontend | VALIDÉ | `frontend.log` et `frontend-err.log` propres. |

---

## Phase 6 — Base de données

| Contrôle | Verdict | Justification |
|---|---|---|
| Contraintes | VALIDÉ | 83 contraintes : 20 CHECK, 30 FK, 17 PK, 16 UNIQUE. |
| Intégrité référentielle | VALIDÉ | 0 lignes orphelines sur 14 contrôles (products, categories, stores, cart_items, orders, order_items, user_roles, admin_profiles, notifications, inventory, product_promotions). |
| Données | VALIDÉ | 0 quantité négative, 0 statut de commande invalide. |
| Flyway | VALIDÉ | 8 migrations validées. |

---

## Phase 7 — Cohérence DTO / Front-Back

| Contrôle | Verdict | Justification |
|---|---|---|
| Audit champ par champ des endpoints actifs | VALIDÉ | 0 désalignement de nom de champ (auth, catalogue, panier, adresses, commandes, notifications, admin). |
| Code mort | Observation | `getProductById` (clientApi.ts:159) jamais appelé ; DTO `NotificationResponse` et `AdminRegisterRequest` sans consommateur. Non bloquant. |

---

## Phase 8 — Risques R1–R4

| Contrôle | Verdict | Justification |
|---|---|---|
| **R1 — Cohérence des horodatages** | VALIDÉ (corrigé) | Avant : client `createdAt` en heure locale sans `Z` vs admin en UTC. Après : `BaseEntity` passe de `LocalDateTime` à `OffsetDateTime` (colonnes déjà `TIMESTAMPTZ`) ; ajout d'un `DateTimeProvider` dédié renvoyant `OffsetDateTime.now(UTC)` (sans lui, la persistance échouait : `Cannot convert LocalDateTime to OffsetDateTime`). Re-testé : commande cliente `createdAt=2026-08-02T16:11:28.795454Z` identique côté admin (`16:11:28.795454Z`) ; notifications en UTC. |
| **R2 — Affichage remise au checkout** | VALIDÉ (corrigé) | `CheckoutPage.tsx` : ajout du calcul `subtotal + livraison − remise` et d'une ligne « Remise ». Livraison à 5.0 toujours codée en dur (aucune API de calcul n'existe ; l'ajouter serait une fonctionnalité nouvelle — hors périmètre). |
| **R3 — Endpoints notifications et inventaire** | VALIDÉ | Conformes, aucun bug détecté (codes et champs vérifiés). |
| **R4 — Seuil de stock bas configurable** | VALIDÉ (corrigé) | Backend : `low_stock_threshold` remonté dans `GET /admin/products` (`lowStockThreshold` : 5, 6, 10 selon produit) pour les requêtes avec et sans recherche + détail. Frontend : type `ProductItem` enrichi ; `AdminInventoryPage.tsx` et `AdminProductsPage.tsx` utilisent la valeur réelle au lieu du seuil codé en dur `5`. |

---

## Synthèse

| Décision | |
|---|---|
| **GO** | La plateforme est fonctionnellement prête : workflow complet client + admin opérationnel, cas d'erreur et sécurité corrects, intégrité des données vérifiée, DTO cohérents, logs propres, et les 4 risques identifiés corrigés et re-testés (R1–R4). |

### Observations à traiter avant mise en service (non bloquantes)
1. **Compte admin par défaut** : `FreshMarketInitializer` crée `admin@freshmarket.tn` / `Admin@12345` si aucun admin n'existe — changer le mot de passe dès la première connexion.
2. **Déconnexion sans révocation JWT** : le token reste valide après logout (stateless, 24 h). Acceptable en l'état ; une blacklist est une évolution.
3. **Pas de contrôle de stock unitaire à l'ajout au panier** : le contrôle de stock n'a lieu qu'au checkout (`INSUFFICIENT_STOCK`). Comportement assumé.
4. **Tests JUnit cassés** (infrastructure H2 mal configurée) et **12 erreurs / 7 avertissements ESLint** pré-existants — à corriger dans un lot dédié.
5. **Code mort** : `getProductById`, `NotificationResponse`, `AdminRegisterRequest`.

### Régression finale (post-correctifs, re-testée)
- `PRODUCT_INACTIVE` (400) et `PRODUCT_IN_CART` (400) confirmés.
- Ajout au panier, création de commande, mise à jour de statut admin, notifications client : tous 200/201.
- Build backend + typecheck frontend : OK.
