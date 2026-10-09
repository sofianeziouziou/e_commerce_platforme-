# 🛒 FreshMarket — Plateforme de commerce alimentaire

**FreshMarket** est une application de commerce électronique dédiée à la vente de produits alimentaires. Elle permet aux clients de consulter le catalogue, de gérer leur panier et de passer des commandes. Une interface d'administration permet de gérer les produits, les commandes et les principales opérations de la boutique.

## ✨ Fonctionnalités

### 👤 Espace client

* Consultation du catalogue des produits.
* Affichage des détails et des images des produits.
* Recherche et filtrage des produits.
* Gestion du panier : ajout, suppression et vidage.
* Gestion du profil utilisateur.
* Consultation des adresses.
* Passage et suivi des commandes.
* Authentification sécurisée.

### 🔐 Espace administrateur

* Gestion des produits et des stocks.
* Gestion des commandes.
* Consultation des notifications.
* Suivi des opérations de la boutique.

### 📱 Application multiplateforme

* Interface web avec Flutter Web.
* Application mobile avec Flutter.
* API REST développée avec Spring Boot.

## 🧰 Technologies utilisées

| Technologie     | Utilisation                                 |
| --------------- | ------------------------------------------- |
| Java 17         | Langage du backend                          |
| Spring Boot     | API REST et logique métier                  |
| Spring Security | Authentification et autorisations           |
| JWT             | Gestion des sessions authentifiées          |
| PostgreSQL      | Base de données relationnelle               |
| Flutter / Dart  | Interface web et mobile                     |
| Docker Compose  | Environnement de développement conteneurisé |
| Git / GitHub    | Gestion du code source                      |

## 🏗️ Architecture du projet

```text
FreshMarket/
├── backend/          # API Spring Boot
├── frontend_web/     # Application web, si présente dans le dépôt
├── mobile/           # Application Flutter
├── docker-compose.yml
└── README.md
```

*L'arborescence ci-dessus est indicative : adapte-la à la structure réelle de ton dépôt.*

## ⚙️ Prérequis

Installe les outils suivants avant de lancer le projet :

* JDK 17
* Maven
* PostgreSQL
* Flutter SDK
* Git
* Docker Desktop (facultatif, si tu utilises Docker)

## 🚀 Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone <URL_DE_TON_DEPOT>
cd FreshMarket
```

Remplace `<URL_DE_TON_DEPOT>` par l'URL réelle de ton dépôt GitHub.

### 2. Configurer PostgreSQL

Crée la base de données utilisée par le backend et configure les paramètres de connexion dans l'environnement ou le fichier de configuration prévu par le projet.

Ne publie jamais de mot de passe réel, de clé JWT ou d'autre secret dans GitHub.

### 3. Démarrer le backend

Depuis le dossier `backend` :

```bash
mvn spring-boot:run
```

Le backend est configuré pour utiliser le port `8089` dans l'environnement de développement actuel.

### 4. Démarrer l'application Flutter

Depuis le dossier `mobile` :

```bash
flutter pub get
flutter run -d web-server
```

Ouvre ensuite dans ton navigateur l'adresse locale affichée par Flutter.

Pour lancer l'application sur Android, connecte un appareil compatible ou démarre un émulateur, puis exécute :

```bash
flutter devices
flutter run
```

### 5. Lancer les tests

Backend :

```bash
mvn test
```

Flutter :

```bash
flutter analyze
flutter test
```

Les résultats dépendent de la configuration locale et de l'état actuel du code.

## 🔌 API REST

Le backend expose des endpoints REST sous le préfixe :

```text
/api/v1
```

Exemples de ressources, selon les routes effectivement configurées :

| Ressource                  | Utilisation                       |
| -------------------------- | --------------------------------- |
| `/api/v1/catalog/products` | Consultation du catalogue         |
| `/api/v1/cart`             | Consultation et gestion du panier |
| `/api/v1/auth`             | Authentification                  |
| `/api/v1/orders`           | Gestion des commandes             |

Les endpoints protégés nécessitent une authentification conforme à la configuration de sécurité du backend.

## 🔒 Sécurité

* Authentification et autorisations gérées par Spring Security.
* Utilisation de JWT pour les requêtes authentifiées.
* Contrôle d'accès aux fonctionnalités protégées.
* Configuration CORS adaptée aux origines autorisées.
* Secrets et identifiants à conserver dans des variables d'environnement ou un gestionnaire de secrets.

## 🐳 Docker

Si le fichier `docker-compose.yml` est configuré pour les services nécessaires, tu peux démarrer l'environnement avec :

```bash
docker compose up -d
```

Vérifie les services configurés avec :

```bash
docker compose ps
```

## 🧪 État du projet

Le projet a fait l'objet de tests de développement sur le backend, PostgreSQL et Flutter Web. Certaines fonctionnalités et certains scénarios doivent encore être validés après les dernières modifications.

## 👨‍💻 Développement

Les contributions et améliorations sont les bienvenues. Avant de proposer une modification :

1. Crée une branche dédiée.
2. Effectue les changements nécessaires.
3. Exécute les tests pertinents.
4. Vérifie qu'aucun secret ou fichier sensible n'est ajouté.
5. Soumets les modifications.

## 📄 Licence

Aucune licence n'est spécifiée ici. Ajoute un fichier `LICENSE` et indique la licence choisie si tu souhaites autoriser explicitement la réutilisation du projet.

---

**FreshMarket — Simplifier l'achat de produits alimentaires grâce au numérique.**
