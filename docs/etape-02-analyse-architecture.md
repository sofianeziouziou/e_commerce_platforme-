# Etape 2 - Analyse fonctionnelle et architecture globale

## 1. Objectif de l'etape

Cette etape transforme les documents de reference en vision fonctionnelle et technique claire.
Elle ne contient pas encore de developpement metier.

La plateforme vise a vendre des produits alimentaires et de proximite pour le magasin Ziouziou / FreshMarket avec :

- une application web pour les clients et l'administration ;
- une application mobile pour les clients ;
- une API REST unique ;
- une base PostgreSQL ;
- une architecture maintenable et evolutive.

## 2. Sources de reference

Documents utilises :

- `detaille _application_web_mobile.docx`
- `detaille_magasin.docx`

Elements principaux extraits :

- concept FreshMarket : confiance, rapidite, fraicheur, simplicite, modernite ;
- magasin Ziouziou situe a Sidi Thabet, Ariana ;
- ouverture tous les jours de 7h a 22h ;
- telephone : 26067192 ;
- categories de produits : boissons, produits d'entretien, hygiene, produits bebe, produits frais, laiterie, charcuterie, traiteur, epicerie seche, snacking, gaz ;
- technologies imposees : Spring Boot 3, Spring Security JWT, Spring Data JPA, PostgreSQL, React TypeScript Vite, Flutter, Swagger/OpenAPI, Docker.

## 3. Acteurs du systeme

### 3.1 Visiteur

Utilisateur non connecte.

Responsabilites possibles :

- consulter l'accueil ;
- consulter les produits publics ;
- rechercher des produits ;
- consulter les promotions ;
- s'inscrire ;
- se connecter ;
- contacter le magasin.

Limites :

- ne peut pas finaliser une commande ;
- ne peut pas consulter l'historique des commandes ;
- ne peut pas acceder au tableau de bord.

### 3.2 Client

Utilisateur connecte qui achete des produits.

Responsabilites :

- gerer son profil ;
- gerer ses adresses ;
- consulter les produits ;
- filtrer par categorie, prix et marque ;
- ajouter au panier ;
- gerer les favoris ;
- passer commande ;
- suivre l'etat d'une commande ;
- consulter l'historique ;
- recevoir des notifications.

### 3.3 Administrateur

Utilisateur interne responsable de la gestion de la plateforme.

Responsabilites :

- acceder au tableau de bord ;
- gerer les produits ;
- gerer les categories ;
- gerer les stocks ;
- gerer les commandes ;
- gerer les clients ;
- gerer les promotions ;
- consulter les rapports et statistiques.

### 3.4 Livreur

Acteur optionnel pour une version future.

Justification :

- les documents parlent de livraison rapide et de suivi de commande ;
- aucun detail n'est donne sur la gestion des livreurs ;
- il est donc preferable de prevoir l'evolutivite sans developper ce role au debut.

## 4. Modules fonctionnels

### 4.1 Authentification et securite

Fonctions :

- inscription client ;
- connexion ;
- deconnexion cote client ;
- authentification JWT ;
- roles `CLIENT` et `ADMIN` ;
- protection des routes sensibles ;
- preparation d'un futur renouvellement de token.

Decision technique :

Le backend reste responsable de l'identite et des autorisations. Les clients web et mobile ne stockent que le token necessaire aux appels API.

### 4.2 Catalogue produits

Fonctions :

- liste des produits ;
- detail produit ;
- recherche ;
- filtrage ;
- tri ;
- affichage du prix ;
- affichage de l'ancien prix si promotion ;
- affichage de la disponibilite.

Categories initiales :

- boissons ;
- produits d'entretien ;
- hygiene personnelle ;
- produits bebe ;
- produits laitiers ;
- charcuterie ;
- traiteur et snacking ;
- epicerie seche ;
- petit-dejeuner ;
- fruits secs ;
- glaces ;
- gaz.

### 4.3 Categories

Fonctions :

- lister les categories ;
- organiser les produits ;
- permettre la navigation rapide ;
- gerer les images ou icones de categories.

Decision technique :

Les categories doivent etre stockees en base, pas codees en dur, pour permettre a l'administrateur de les modifier.

### 4.4 Panier

Fonctions :

- ajouter un produit ;
- modifier la quantite ;
- supprimer un produit ;
- calculer le total ;
- verifier la disponibilite avant commande.

Decision technique :

Le panier peut d'abord etre gere cote backend pour les clients connectes. Cela facilite la synchronisation entre web et mobile.

### 4.5 Commandes

Fonctions :

- creation d'une commande depuis le panier ;
- calcul du sous-total ;
- frais de livraison eventuels ;
- total ;
- statut de commande ;
- historique client ;
- gestion admin.

Statuts proposes :

- `PENDING` : commande creee ;
- `CONFIRMED` : commande acceptee ;
- `PREPARING` : commande en preparation ;
- `READY` : prete ;
- `OUT_FOR_DELIVERY` : en livraison ;
- `DELIVERED` : livree ;
- `CANCELLED` : annulee.

### 4.6 Paiement

Fonctions initiales :

- mode paiement a la livraison ;
- statut de paiement ;
- preparation d'une integration future de paiement en ligne.

Statuts proposes :

- `UNPAID` ;
- `PAID` ;
- `FAILED` ;
- `REFUNDED`.

Decision technique :

Pour une premiere version, le paiement a la livraison est le plus simple et realiste. L'architecture garde un module paiement pour ne pas bloquer une evolution future.

### 4.7 Promotions

Fonctions :

- afficher les produits en promotion ;
- appliquer une reduction ;
- gerer une date de debut et de fin ;
- permettre a l'admin de creer/modifier/desactiver une promotion.

Regle :

Une promotion active modifie le prix affiche, mais le prix final de commande doit etre snapshotte au moment de l'achat.

### 4.8 Stock

Fonctions :

- quantite disponible ;
- alerte stock faible ;
- blocage de commande si stock insuffisant ;
- mise a jour apres confirmation de commande.

Decision technique :

Le stock doit etre gere cote backend uniquement. Le frontend affiche l'information, mais ne decide jamais de la disponibilite finale.

### 4.9 Favoris

Fonctions :

- ajouter un produit aux favoris ;
- retirer un favori ;
- consulter la liste.

### 4.10 Notifications

Fonctions futures :

- promotions ;
- changement de statut commande ;
- messages client.

Decision technique :

En V1, on peut commencer par des notifications internes dans l'application. Les push notifications mobile viendront ensuite.

### 4.11 Tableau de bord administrateur

Fonctions :

- nombre de commandes ;
- commandes recentes ;
- chiffre d'affaires ;
- produits en rupture ou stock faible ;
- clients recents ;
- promotions actives.

## 5. Parcours utilisateur

### 5.1 Parcours visiteur

1. Le visiteur arrive sur l'accueil.
2. Il consulte les categories ou promotions.
3. Il recherche un produit.
4. Il consulte le detail.
5. Il cree un compte ou se connecte pour commander.

### 5.2 Parcours client

1. Le client se connecte.
2. Il recherche ou parcourt les produits.
3. Il ajoute des produits au panier.
4. Il modifie les quantites.
5. Il choisit ou ajoute une adresse.
6. Il confirme la commande.
7. Il suit le statut.
8. Il consulte son historique.

### 5.3 Parcours administrateur

1. L'administrateur se connecte.
2. Il accede au tableau de bord.
3. Il ajoute ou met a jour des produits.
4. Il controle le stock.
5. Il traite les commandes.
6. Il met a jour les statuts.
7. Il consulte les statistiques.

## 6. Regles metier principales

### 6.1 Produits

- Un produit appartient a une categorie.
- Un produit possede un prix positif.
- Un produit peut etre actif ou inactif.
- Un produit inactif ne doit pas apparaitre dans le catalogue client.
- Un produit peut avoir une image principale.

### 6.2 Stock

- Une commande ne peut pas etre confirmee si le stock est insuffisant.
- Le stock est reserve ou diminue lors de la confirmation selon la strategie choisie.
- Une alerte doit etre possible quand le stock descend sous un seuil.

### 6.3 Commandes

- Une commande appartient a un client.
- Une commande contient au moins une ligne.
- Chaque ligne garde le prix du produit au moment de l'achat.
- Une commande annulee ne doit pas etre livree.
- Seul un administrateur peut changer certains statuts.

### 6.4 Promotions

- Une promotion a une periode de validite.
- Une promotion expiree ne s'applique plus.
- Le prix final doit etre calcule par le backend.

### 6.5 Securite

- Un visiteur ne peut pas acceder aux commandes.
- Un client ne peut voir que ses propres commandes.
- Un administrateur peut gerer les commandes et le catalogue.
- Les mots de passe doivent etre hashes.
- Les donnees sensibles ne doivent jamais etre envoyees inutilement au frontend.

## 7. Architecture globale

## 7.1 Vue d'ensemble

```text
Client Web React  ─┐
                   ├── API REST Spring Boot ─── PostgreSQL
Mobile Flutter  ───┘

Admin Web React  ──┘
```

Le backend est le centre du systeme :

- il applique les regles metier ;
- il verifie les permissions ;
- il calcule les prix ;
- il controle le stock ;
- il expose la documentation Swagger/OpenAPI.

## 7.2 Backend

Structure retenue :

```text
backend/src/main/java/com/ziouziou/freshmarket/
├── domain/
├── application/
├── infrastructure/
└── interfaces/
```

Role des couches :

- `domain` : entites metier, value objects, contrats du domaine ;
- `application` : cas d'utilisation, orchestration, transactions ;
- `infrastructure` : JPA, securite, configuration, integrations externes ;
- `interfaces` : controllers REST, DTO, mapping API.

Decision technique :

Cette separation evite que les controllers REST ou JPA dictent toute l'architecture. Le coeur metier reste plus facile a tester et a faire evoluer.

## 7.3 Frontend web

Structure retenue :

```text
frontend_web/src/
├── app/
├── routes/
├── features/
├── shared/
└── styles/
```

Role des dossiers :

- `app` : initialisation globale ;
- `routes` : routes de navigation ;
- `features` : modules fonctionnels ;
- `shared` : composants, configuration, helpers reutilisables ;
- `styles` : styles globaux Tailwind.

Decision technique :

Le web devra contenir deux experiences : client et admin. Une structure par fonctionnalite permet d'eviter un gros dossier `components` non organise.

## 7.4 Mobile Flutter

Structure retenue :

```text
mobile/lib/src/
├── app/
├── core/
├── features/
└── shared/
```

Role des dossiers :

- `app` : application Flutter et navigation globale ;
- `core` : theme, configuration, services techniques ;
- `features` : ecrans et logique par fonctionnalite ;
- `shared` : widgets communs.

Decision technique :

Le mobile reprend la meme logique modulaire que le web afin que les fonctionnalites restent coherentes entre les deux clients.

## 7.5 API REST

Convention proposee :

```text
/api/v1/auth
/api/v1/products
/api/v1/categories
/api/v1/cart
/api/v1/orders
/api/v1/promotions
/api/v1/customers
/api/v1/admin/dashboard
```

Principes :

- versionner l'API avec `/api/v1` ;
- utiliser des DTO dedies ;
- ne jamais exposer directement les entites JPA ;
- documenter avec OpenAPI ;
- retourner des erreurs standardisees.

## 7.6 Base de donnees

Entites principales candidates :

- `users`
- `roles`
- `customers`
- `addresses`
- `categories`
- `products`
- `product_images`
- `inventory`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `promotions`
- `favorites`
- `notifications`

Cette liste sera detaillee dans l'etape 3 avant creation des migrations.

## 8. Priorisation MVP

### V1 obligatoire

- Authentification client/admin.
- Catalogue produits.
- Categories.
- Panier.
- Commande.
- Stock simple.
- Administration produits/categories/commandes.
- Swagger.

### V1 utile mais secondaire

- Favoris.
- Promotions.
- Dashboard statistique simple.
- Notifications internes.

### Versions futures

- Paiement en ligne.
- Gestion livreur.
- Notifications push.
- Suivi temps reel.
- Rapports avances.
- Mode sombre.

## 9. Risques et decisions

### Risque : developper trop large au depart

Decision :

Commencer par un MVP solide : catalogue, panier, commande, administration de base.

### Risque : logique metier dupliquee entre web et mobile

Decision :

Toute decision critique reste dans le backend : prix, stock, promotion, statut commande.

### Risque : base de donnees mal preparee

Decision :

L'etape 3 sera dediee au modele de donnees, aux relations et aux migrations Flyway.

### Risque : securite ajoutee trop tard

Decision :

JWT, roles et permissions sont prevus des le depart.

## 10. Checklist de validation de l'etape 2

- [ ] Les acteurs sont valides.
- [ ] Les modules fonctionnels sont valides.
- [ ] Les parcours client et administrateur sont valides.
- [ ] Les regles metier principales sont acceptees.
- [ ] L'architecture backend/web/mobile est acceptee.
- [ ] Le perimetre MVP est accepte.
- [ ] Les fonctionnalites futures sont identifiees.
- [ ] L'etape 3 peut commencer : conception de la base de donnees et modele de domaine.

