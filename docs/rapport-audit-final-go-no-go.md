# Audit final — Rapport de mise en production (GO / NO GO)

Date : 02/08/2026
Périmètre : audit complet de la plateforme e-commerce FreshMarket / Magasin Ziouziou (backend Spring Boot 3, PostgreSQL 17, frontend React + Vite).
Règle appliquée : aucune nouvelle fonctionnalité, aucun refactoring, aucun changement d'architecture. Uniquement des correctifs à la racine des bugs constatés (3 appliqués, re-testés, régression validée).
Méthode : tests réels contre le backend (port 8089) et le frontend (Vite, port 5173), base nettoyée des données d'audit.

## Légende
- **VALIDÉ** : comportement conforme constaté et testé en réel.
- **NON VALIDÉ** : problème constaté et justifié.
- **CORRIGÉ** : bug découvert puis corrigé à la racine et re-testé.
- **Observation** : constat non bloquant ou hors périmètre (fonctionnalité non livrée).

---

## 1. Authentification (Phase 1)

| Contrôle | Verdict | Détail |
|---|---|---|
| Inscription client | VALIDÉ | 201 ; doublon → 400 `EMAIL_ALREADY_USED` ; conformité mot de passe → 400. |
| Connexion | VALIDÉ | Mauvais mot de passe et email inconnu → même `INVALID_CREDENTIALS` (pas d'énumération). Email case-insensitive OK. |
| `/auth/me` | VALIDÉ | 200 avec token ; 401 sans token. |
| Profil (PUT /me) | VALIDÉ | Prénom / téléphone mis à jour. |
| Logout | Observation | 200, JWT non révoqué (stateless 24 h). |
| **S1 — register-admin public** | **CORRIGÉ** | `POST /api/v1/auth/register-admin` était `permitAll` (`SecurityConfig` l.57). Confirmé : création anonyme d'un `ROLE_ADMIN` + store + JWT valide. Correctif : matcher dédié `hasAuthority("ROLE_ADMIN")` placé avant le permitAll. Re-testé : anonyme → 401, admin authentifié → 200. |
| **S2 — fuite du token de reset** | **CORRIGÉ** | `POST /auth/forgot-password` renvoyait le token de réinitialisation dans le body. Correctif : réponse réduite à `message` (le frontend lit uniquement `message` — vérifié). Re-testé : token absent du body, reset fonctionne (token lu en base), réutilisation → 400 `INVALID_TOKEN`. |
| JWT | VALIDÉ | Garbage / mauvais secret / expiré → 401. |

## 2. Catalogue (Phase 2)

| Contrôle | Verdict | Détail |
|---|---|---|
| Catégories | VALIDÉ | 27 catégories, 27 avec produits. |
| Produits + pagination | VALIDÉ | 21 produits ; page hors bornes → liste vide. |
| Tri | VALIDÉ | Prix asc/desc, nom ; tri invalide → 200 (liste). |
| Recherche | VALIDÉ | Partielle et insensible à la casse (`tomate`, `banane`, `olive`). |
| Recherche accentuée | Observation | `le` ne trouve pas `légumes` (pas d'extension `unaccent`). |
| Filtre catégorie | VALIDÉ | Par slug OK ; par id → 0 résultat (comportement assumé). |
| Détail produit | VALIDÉ | Par slug ; slug invalide → 404. |
| Produit inactif | Observation | Exclu de la recherche et du listing ; le détail public par slug ne filtre pas `active` (le panier bloque avec `PRODUCT_INACTIVE`). |
| Promotions affichées | VALIDÉ | `featured`, `oldPrice`, PERCENTAGE 15 %, FIXED_AMOUNT 2. |
| Images | VALIDÉ | `imageUrl` null géré par le frontend (aucun `<img>` cassé). |

## 3. Panier (Phase 3)

| Contrôle | Verdict | Détail |
|---|---|---|
| Ajout / quantité / retrait | VALIDÉ | 201 / 200 ; quantité 0 ou négative → 400 ; item 999 → 404. |
| Quantité au-delà du stock | Observation | 10001 accepté ; contrôle réel au checkout (`INSUFFICIENT_STOCK`). |
| IDOR panier | VALIDÉ | Update/delete/GET d'un item d'un autre client → 400 ; paniers isolés. |
| Produit inactif | VALIDÉ | 400 `PRODUCT_INACTIVE` (BUG20 re-testé). |
| Persistance | VALIDÉ | Panier conservé en base après reconnexion. |

## 4. Adresses (Phase 4)

| Contrôle | Verdict | Détail |
|---|---|---|
| CRUD + adresse par défaut exclusive | VALIDÉ | Create/List/Update ; 1 seule `default` (les autres repassent à false). |
| Validation format | Observation | Phone `abc123`, ville `!!!`, postal `zzz`, coordonnées −999/999 → 201 (seuls `@NotBlank`/`@Size`). |
| IDOR | VALIDÉ | Update/delete d'une adresse d'un autre client → 400. |
| **S3 — perte d'adresse d'historique** | **CORRIGÉ** | Supprimer une adresse référencée par des commandes mettait `address_id` à NULL (`fk_orders_address ... ON DELETE SET NULL`), effaçant l'adresse de l'historique. Correctif : garde `ADDRESS_HAS_ORDERS` (sur le modèle de `PRODUCT_IN_CART`). Re-testé : adresse liée à des commandes → 400 `ADDRESS_HAS_ORDERS` ; adresse libre → 204. |

## 5. Checkout (Phase 5)

| Contrôle | Verdict | Détail |
|---|---|---|
| Panier vide | VALIDÉ | 400 `CART_EMPTY`. |
| Adresse inexistante | VALIDÉ | 404. |
| Corps vide / montants | VALIDÉ | Sous-total 13,80 + 5,00 = 18,80 exacts côté backend et frontend. |
| **Remise au checkout** | **Observation (fonctionnel)** | La ligne « Remise » est affichée mais `discount = 0` codé en dur dans `CheckoutPage.tsx` ; les promotions ne s'appliquent jamais au panier/commande. Fonctionnalité promotion non livrée de bout en bout (voir §10). |

## 6. Commandes client (Phase 6)

| Contrôle | Verdict | Détail |
|---|---|---|
| Historique / détail | VALIDÉ | Liste desc ; items, prix, `createdAt` UTC. |
| Transitions statut | VALIDÉ | CONFIRMEE → EN_PREPARATION → EXPEDIEE → LIVREE (4×200) ; statut invalide → 400 ; order 999 → 404. |
| Statut terminal | Observation | LIVREE réécrivable en ANNULEE (aucune garde de transition). |
| Stock | VALIDÉ | Décrémenté à CONFIRMEE (100→98 pour une commande de 2). |
| Annulation | Observation | ANNULEE ne réapprovisionne pas le stock (le décrément reste appliqué). |

## 7. Administration (Phase 7)

| Contrôle | Verdict | Détail |
|---|---|---|
| Dashboard | VALIDÉ | Produits, bas stock, en attente, livrées, CA. |
| CRUD produits | VALIDÉ | Create/Update/Delete 201/200/204 ; validation prix/nom → 400. |
| Inventaire | VALIDÉ | Mise à jour + seuil `lowStockThreshold` (R4) ; quantité négative → 400. |
| Statut HTTP inventaire | Observation | `PUT /admin/products/{id}/inventory` → 200 au lieu de 204 (incohérence mineure). |
| CRUD catégories | VALIDÉ | Create/Update/Delete ; suppression catégorie avec produits → 400 `CATEGORY_HAS_PRODUCTS`. |
| Clients | VALIDÉ | Liste avec orderCount/totalSpent ; recherche OK. |
| Commandes | VALIDÉ | Liste, filtre statut, détail ; filtre statut invalide → 200 (liste vide). |
| **Promotions** | **NON VALIDÉ (fonctionnalité)** | Seul `GET /admin/promotions` existe. Aucun POST/PUT/DELETE : impossible de créer/modifier/supprimer une promotion (ni API ni UI). Le DTO `PromotionRequest` est présent mais inutilisé. |
| R4 seuil bas | VALIDÉ (re-testé) | `lowStockThreshold` remonté dans l'API admin et utilisé dans `AdminInventoryPage` / `AdminProductsPage`. |

## 8. Stock, transactions, concurrence (Phase 8)

| Contrôle | Verdict | Détail |
|---|---|---|
| Checkout stock | VALIDÉ | Bloqué au checkout (`INSUFFICIENT_STOCK`, disponible 0 / demandé 2). |
| Échec de confirmation | VALIDÉ | Confirmer une commande sans stock → 400 `INSUFFICIENT_STOCK` ; le statut reste EN_ATTENTE (rollback). |
| Concurrence | VALIDÉ | 2 confirmations simultanées pour 120 unités alors que 100 disponibles : 1 confirmée (100→40), l'autre rejetée `INSUFFICIENT_STOCK` (40<60). Pas de survente. |
| `@Version` / verrou optimiste | Observation | Absents ; la protection repose sur le contrôle-décrément dans la même transaction. Aucune survente observée en test. |

## 9. Notifications (Phase 9)

| Contrôle | Verdict | Détail |
|---|---|---|
| Liste + pagination | VALIDÉ | Desc par `createdAt` ; page hors bornes → vide. |
| Compteur non-lues | VALIDÉ | `unread-count` cohérent. |
| Lecture de masse | VALIDÉ | `read-all` → 0 non-lues. |
| Lecture individuelle | Observation | Pas d'endpoint `PUT /notifications/{id}/read` (seul read-all). Le frontend utilise read-all — cohérent. |
| Admin | VALIDÉ | `GET /admin/notifications/count` admin-only (client → 403). |

## 10. Sécurité (Phase 10)

| Contrôle | Verdict | Détail |
|---|---|---|
| SQLi | VALIDÉ | Login, search (client et admin), category, page, id : aucune injection (400/200 sans erreur). |
| XSS stocké | Observation | Les champs texte acceptent `<script>` (API brute) ; React échappe le rendu (0 `dangerouslySetInnerHTML`). Risque faible pour le back-office. |
| CSRF | VALIDÉ | JWT stateless (Bearer), pas de cookie de session → non applicable. |
| CORS | VALIDÉ | Uniquement `localhost:5173` / `127.0.0.1:5173` ; origine inconnue rejetée. |
| Mass assignment | VALIDÉ | `role`, `isAdmin`, `active`, `id`, `stock` dans les payloads ignorés (compte créé en CLIENT, id auto-généré, stock inchangé). |
| S1 / S2 | CORRIGÉ | Voir §1. |

## 11. Base de données (Phase 11)

| Contrôle | Verdict | Détail |
|---|---|---|
| Orphelins | VALIDÉ | 0 sur 7 contrôles (products, orders, order_items, cart_items, cart, notifications, inventory). |
| Contraintes | VALIDÉ | 0 quantité négative, 0 prix négatif, 0 total négatif, 0 commande sans client/store. |
| Index | VALIDÉ | 68 index couvrant FK, statuts, recherche, tokens. |
| Ordre historique | VALIDÉ | Adresse restaurée sur la commande seed (après correctif S3). |

## 12. Frontend (Phase 12)

| Contrôle | Verdict | Détail |
|---|---|---|
| Typecheck | VALIDÉ | `tsc --noEmit` → 0 erreur. |
| Build | VALIDÉ | `vite build` → 408 Ko JS (109 Ko gzip), 1628 modules. |
| Routes | VALIDÉ | 28 routes (client + admin) toutes mappées ; serveur Vite → 200. |
| Accessibilité | VALIDÉ | `aria-label`, `aria-hidden`, `alt` sur tous les `<img>`, `<label>` présents. |

## 13. Performance (Phase 13)

| Contrôle | Verdict | Détail |
|---|---|---|
| Catalogue 21 produits | VALIDÉ | ~70 ms. |
| Catalogue 121 produits | VALIDÉ | 50–293 ms selon page/taille. |
| Catalogue 521 produits | VALIDÉ | 50–110 ms (page, recherche, tri). |
| Admin 521 produits (R4) | VALIDÉ | 91 ms ; dashboard 37 ms ; clients 35 ms ; commandes 31 ms. |
| Création produit | VALIDÉ | ~27 ms / produit (500 créés puis supprimés pour le test). |

## 14–15. Accessibilité et UX (Phases 14–15)

| Contrôle | Verdict | Détail |
|---|---|---|
| Formulaires | VALIDÉ | Labels associés (`htmlFor`), placeholders, états de chargement, erreurs affichées. |
| Parcours de commande | VALIDÉ | Étapes guidées (panier → adresse → confirmation → succès), liens de retour. |
| Confirmations | VALIDÉ | Checkout, annulation, commande réussie. |

## 16. Régression finale (Phase 16)

| Contrôle | Verdict | Détail |
|---|---|---|
| BUG20 `PRODUCT_INACTIVE` | VALIDÉ | Produit inactif au panier → 400 (désactivé puis réactivé). |
| BUG21 `PRODUCT_IN_CART` | VALIDÉ | Suppression produit présent en panier → 400. |
| R1 horodatage UTC | VALIDÉ | `createdAt` identique client/admin, suffixe `Z`. |
| R2 remise affichée | VALIDÉ (UI) | Ligne « Remise » présente (0,00 — voir §5/§10). |
| R4 seuil bas | VALIDÉ | Valeur réelle utilisée. |
| Auth / catalogue / panier / commandes / notifications | VALIDÉ | Tout 200/201 après correctifs S1–S3. |
| Frontend | VALIDÉ | typecheck 0 erreur après correctifs (aucun changement frontend requis). |

---

## Correctifs appliqués (3)

| Bug | Gravité | Correctif | Fichiers |
|---|---|---|---|
| S1 — enregistrement admin public | Critique | `register-admin` restreint à `ROLE_ADMIN` | `SecurityConfig.java` |
| S2 — fuite du token de reset | Critique | Réponse `forgot-password` réduite à `message` | `AuthController.java` |
| S3 — perte d'adresse d'historique | Majeur | Garde `ADDRESS_HAS_ORDERS` à la suppression | `AddressService.java`, `OrderRepository.java` |

## Bugs / écarts non corrigés (hors périmètre)

| # | Écart | Gravité | Justification |
|---|---|---|---|
| F1 | Création de promotions impossible (pas de POST/PUT/DELETE) | Majeur (fonctionnalité non livrée) | Hors périmètre : ce serait une nouvelle fonctionnalité. |
| F2 | Remise au checkout toujours 0,00 (promotions jamais appliquées) | Majeur (fonctionnel) | Nécessite un calcul backend + liaison promotion→panier (nouvelle fonctionnalité). |
| F3 | ANNULEE ne réapprovisionne pas le stock | Mineur | Comportement métier assumé ; un restock est une évolution. |
| F4 | LIVREE réécrivable en ANNULEE | Mineur | Ajout de règles de transition = changement de comportement. |
| F5 | Recherche non accent-insensible | Mineur | Nécessite `unaccent` (évolution base). |
| F6 | Validation format adresse/téléphone absente | Mineur | Renforcement des annotations (correctif possible, non demandé). |
| F7 | `PUT inventory` → 200 au lieu de 204 | Mineur | Incohérence cosmétique HTTP. |
| F8 | Tests JUnit cassés (H2 mal configuré) + ESLint pré-existant | Mineur | Pré-existant, lot dédié. |
| F9 | S1 : compte admin initial par défaut | Observation | `admin@freshmarket.tn` — changer le mot de passe avant mise en service. |

---

## Notation

| Domaine | Note /100 | Commentaire |
|---|---|---|
| Backend (API, logique métier) | 88 | Workflow complet, cas d'erreur propres, transactions sûres ; promotions non livrées. |
| Frontend (UX, a11y, builds) | 86 | Typecheck/build 0 erreur, a11y soignée ; remise 0,00, no create/edit promo. |
| Architecture | 84 | Couches claires, store isolation multi-magasins, DTO cohérents ; code mort résiduel. |
| Sécurité | 85 | JWT correct, SQLi/CSRF/mass assignment OK, CORS restreint ; S1/S2 corrigés en séance. |
| Performance | 92 | Excellente jusqu'à 500+ produits (≤ 300 ms, majorité < 100 ms). |
| Base de données | 90 | 68 index, 0 orphelin, contraintes saines ; adresses historiques désormais protégées. |
| Maintenabilité | 82 | Tests JUnit inopérants (H2), ESLint non propre, code mort. |
| **Moyenne pondérée** | **87/100** | |

## Verdict

| Décision | |
|---|---|
| **GO PRODUCTION** | Les 3 bugs bloquants découverts (2 critiques sécurité + 1 majeur intégrité) ont été corrigés à la racine, re-testés et sans régression. La plateforme est fonctionnelle de bout en bout, performante, et la base est saine. |

### Prérequis avant mise en service (recommandations)
1. **Changer le mot de passe admin initial** `Admin@12345` (compte `admin@freshmarket.tn`).
2. **Fonctionnalité promotions** (F1/F2) à livrer avant l'exploitation commerciale : l'écart « remise » est visible en production.
3. Nettoyage du mot de passe par défaut + blacklist JWT si la révocation devient un besoin.
4. Lot dédié : tests JUnit (H2), ESLint, code mort.
