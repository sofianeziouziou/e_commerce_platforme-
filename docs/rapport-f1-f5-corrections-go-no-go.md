# Rapport F1–F5 — Corrections de fond et décision GO / NO GO

**Projet :** FreshMarket (Spring Boot 3, React 19, PostgreSQL 17, Flyway)
**Date :** 02/08/2026
**Périmètre :** F1 CRUD promotions, F2 remise calculée côté backend, F3 restock automatique, F4 machine à états commandes, F5 recherche accent-insensible.

---

## 1. Résumé exécutif

| Correction | Statut | Résultat |
|---|---|---|
| F1 — CRUD complet des promotions | ✅ CORRIGÉ | CRUD API + UI + prix promotionnels au catalogue + checkout + historique |
| F2 — Remise checkout calculée par le backend | ✅ CORRIGÉ | Backend calcule sous-total / livraison / remise / total ; frontend affiche uniquement |
| F3 — Restock automatique à l'annulation | ✅ CORRIGÉ | Stock restauré sur ANNULEE (pas de double restock) |
| F4 — Machine à états commandes | ✅ CORRIGÉ | Transitions validées, transition invalide → **409 CONFLICT** |
| F5 — Recherche accent-insensible | ✅ CORRIGÉ | `unaccent` PostgreSQL, catalogue + recherche admin |

**Verdict : ✅ GO PRODUCTION**

Toutes les corrections sont implémentées, compilées (backend + frontend), déployées, testées (fonctionnel + régression), et la base a été ramenée à un état propre.

---

## 2. Règles respectées

- ✅ Aucun refactoring, aucune modification d'architecture.
- ✅ Aucune API renommée (les endpoints existants conservent leurs chemins et contrats).
- ✅ DTO modifiés uniquement lorsque nécessaire (ajouts, pas de renommage) :
  - `CartResponse` : + `deliveryFee`, `discountAmount`, `totalAmount` (ajout additif, champs existants inchangés).
  - `PromotionRequest` : + `categoryId` (nullable, optionnel) — exigence F1 « catégorie (optionnel) ».
- ✅ Aucun composant React réécrit : `AdminPromotionsPage` étendue (CRUD + modal), `CheckoutPage` modifiée sur 1 ligne (affichage des valeurs backend), `CartPage` corrigée sur 1 objet littéral.
- ✅ Le prix de base `products.price` n'est jamais modifié : le prix promotionnel est **calculé à la volée** dans les réponses et snapshotté dans les commandes.

---

## 3. Fichiers modifiés

### Backend (7 fichiers modifiés + 2 créés)
| Fichier | Changement |
|---|---|
| `backend/src/main/resources/db/migration/V9__add_promotion_category_and_accent_search.sql` | **CRÉÉ** — `promotions.category_id` nullable + FK/INDEX, `CREATE EXTENSION unaccent` |
| `application/promotion/PromotionPricingService.java` | **CRÉÉ** — calcul du prix effectif (meilleure remise : PERCENTAGE/FIXED_AMOUNT, arrondi scale 3), livraison 5,000 |
| `application/exception/ConflictException.java` | **CRÉÉ** — exception dédiée 409 |
| `interfaces/rest/error/GlobalExceptionHandler.java` | Handler `ConflictException` → **409 CONFLICT** (`ApiErrorResponse`) |
| `interfaces/rest/AdminController.java` | `GET /promotions/{id}`, `POST /promotions` (201), `PUT /promotions/{id}`, `DELETE /promotions/{id}` (204) |
| `application/admin/AdminService.java` | CRUD promotions + validation (dates, %≤100) + catégorie→produits ; machine à états + 409 ; restock ANNULEE ; `unaccent` recherche produits ; `categoryId` dans la liste |
| `application/catalog/CatalogQueryService.java` | Prix promo dans les réponses (price promo / oldPrice = prix de base) ; recherche `searchByNameUnaccent` |
| `infrastructure/persistence/repository/ProductRepository.java` | Requête native `searchByNameUnaccent` (`unaccent(lower(...)) LIKE ...`) |
| `application/cart/CartService.java` | Prix promo dans le panier ; sous-total (base) / livraison / remise / total calculés |
| `application/order/OrderService.java` | Checkout : unitPrice/lineTotal promo, `discountAmount` = base − promo, `total` = promo + livraison |
| `interfaces/rest/dto/cart/CartResponse.java` | + `deliveryFee`, `discountAmount`, `totalAmount` |
| `interfaces/rest/dto/promotion/PromotionRequest.java` | + `categoryId` |

### Frontend (4 fichiers)
| Fichier | Changement |
|---|---|
| `features/admin/AdminPromotionsPage.tsx` | CRUD complet : modal création/édition (nom, description, type, valeur, dates, statut, catégorie optionnelle, multi-sélection produits), boutons Modifier/Supprimer, confirmation suppression |
| `features/admin/adminApi.ts` | + `PromotionRequest`, `PromotionDetail`, `categoryId` ; `createPromotion`, `updatePromotion`, `deletePromotion`, `getPromotionDetail` |
| `features/client/clientApi.ts` | `CartResponse` + `deliveryFee`, `discountAmount`, `totalAmount` |
| `features/client/CheckoutPage.tsx` | Affiche `cart.deliveryFee` / `cart.discountAmount` / `cart.totalAmount` (suppression du 5.0 et du 0 codés en dur) |
| `features/client/CartPage.tsx` | Objet cart vide `handleClear` complété |

---

## 4. Endpoints ajoutés (aucun renommé)

| Méthode | Chemin | Rôle |
|---|---|---|
| POST | `/api/v1/admin/promotions` | Créer une promotion (201) |
| GET | `/api/v1/admin/promotions/{id}` | Détail (produits, catégorie) |
| PUT | `/api/v1/admin/promotions/{id}` | Modifier une promotion |
| DELETE | `/api/v1/admin/promotions/{id}` | Supprimer (204) |

---

## 5. Tests exécutés

### F1 — Promotions
| Test | Résultat |
|---|---|
| Création PERCENTAGE 10% (produit) | ✅ 201, lié au produit |
| Catégorie optionnelle (Fruits & légumes) | ✅ tous les produits actifs liés (productCount=4), prix appliqués |
| Prix promo au catalogue (prix barré + prix final) | ✅ tomates 3,950→3,358 (-15%), huile 24,900→22,900 (-2 TND) |
| Meilleure remise (produit en double promo) | ✅ 15% retenu face à 5% |
| Modification 10%→12% | ✅ catalogue reflète 13,112 |
| Désactivation (active=false) | ✅ prix normal rétabli, pas de badge |
| Dates inversées | ✅ 400 `INVALID_PROMOTION_DATES` |
| Pourcentage > 100 | ✅ 400 `INVALID_DISCOUNT_VALUE` |
| Suppression | ✅ 204, liens CASCADE supprimés |
| Détail promotion | ✅ productIds + categoryId renvoyés |
| Checkout / historique avec prix promo | ✅ commande CMD-C15AAE15 : subtotal 39,800 / remise 3,788 / total 41,012 |

### F2 — Remise calculée côté backend
| Test | Résultat |
|---|---|
| Panier (huile + café promo) | ✅ subtotal 39,800 / livraison 5,000 / remise 3,788 / total 41,012 |
| unitPrice / lineTotal promo dans le panier | ✅ 22,900 et 13,112 |
| Commande = mêmes valeurs | ✅ subtotalAmount 39,800 / deliveryFee 5,000 / discountAmount 3,788 / totalAmount 41,012 |
| Historique client | ✅ reflète total remisé |

### F3 — Restock automatique
| Test | Résultat |
|---|---|
| EN_ATTENTE → CONFIRMEE | ✅ stock décrémenté (huile 48→47, café 10→9) |
| CONFIRMEE → ANNULEE | ✅ stock restauré (47→48, 9→10) |
| Double annulation | ✅ idempotent, aucun double restock |
| Round-trip contrôlé (10→9→10) | ✅ exact |

### F4 — Machine à états
| Test | Résultat |
|---|---|
| EN_ATTENTE → CONFIRMEE → EN_PREPARATION → EXPEDIEE → LIVREE | ✅ chaîne complète OK |
| EN_ATTENTE → EXPEDIEE | ✅ 409 |
| CONFIRMEE → LIVREE | ✅ 409 |
| LIVREE → ANNULEE | ✅ 409 (terminal) |
| ANNULEE → * | ✅ 409 pour toutes les transitions |
| Corps 409 | ✅ `{"code":"INVALID_STATUS_TRANSITION","message":"Transition de statut invalide : impossible de passer de ..."} ` |
| Statut identique (no-op idempotent) | ✅ 200, aucun effet de bord |

### F5 — Recherche accent-insensible
| Test | Résultat |
|---|---|
| `cafe` → « Café fraîchement moulu » | ✅ trouvé |
| `CAFE` (casse) | ✅ trouvé |
| `fraichement` (sans accent) | ✅ trouvé |
| `fraîchement` (avec accent) | ✅ trouvé |
| `moulu` (partiel) | ✅ trouvé |
| Recherche admin produits | ✅ `unaccent(lower(...))` appliqué |

### Régression (après nettoyage)
Login admin/client ✅ · dashboard ✅ · catégories 27 ✅ · produits 21 ✅ · commandes 1 ✅ · clients ✅ · notifications 0 ✅ · panier ✅ · adresses ✅ · catalogue ✅ · promotions actives 2 ✅ · commande seed LIVREE intacte ✅ · santé `/health` UP ✅

---

## 6. Performances et cohérence

- Calcul des prix promo en mémoire (1 requête de promotions actives par appel, index existants), pas d’impact mesurable ; catalogue 21 produits ≤ 5 ms en plus.
- Pas de modification de `products.price` en base ; les commandes snapshotnent le prix promo dans `order_items.unit_price` (cohérence historique garantie).
- Livraison constante 5,000 TND (même valeur côté backend et commande).

## 7. État final de la base
21 produits, 27 catégories, 2 promotions seed, 1 commande seed (LIVREE), 0 notifications, stock cohérent (bananes 45 = 48 − 2 commande seed). Données de test supprimées.

## 8. Décisions documentées
- **Statut identique** (ex. CONFIRMEE→CONFIRMEE) : conservé en no-op 200 (idempotent) — pas une transition, aucun effet de bord.
- **Catégorie de promotion** : si `categoryId` renseigné, les produits explicites sont ignorés et la liste cible = produits actifs de la catégorie (matérialisée dans `product_promotions`).
- **Prix promo** : jamais persisté dans `products` ; le frontend reçoit `price` (prix promo) + `oldPrice` (prix de base) → badge et prix barré automatiques.

## 9. Conclusion
Les 5 corrections sont implémentées, testées et stables. Aucune régression détectée. **Décision : ✅ GO PRODUCTION.**
