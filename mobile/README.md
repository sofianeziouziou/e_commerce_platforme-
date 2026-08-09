# Mobile - FreshMarket

Application mobile Flutter destinee aux clients.

## Stack

- Flutter.
- Dart.
- Material 3.
- Une base de code pour Android et iOS.
- State management : Provider (`ChangeNotifier`).
- HTTP : package `http` avec `ApiClient` (en-tete `Authorization: Bearer <jwt>`).
- Stockage du jeton : `flutter_secure_storage`.

## Structure

```text
lib/
├── main.dart
└── src/
    ├── app/                 # FreshMarketApp, routes, Shell (navigation)
    ├── core/
    │   ├── config/          # AppEnvironment (API_BASE_URL)
    │   ├── constants/       # gouvernorats, statuts de commande
    │   ├── network/         # ApiClient, ApiException, TokenStore
    │   ├── theme/           # AppTheme (Material 3)
    │   └── utils/           # Formatters (prix TND, dates)
    ├── features/
    │   ├── auth/            # login, register, profil, AuthState
    │   ├── home/            # accueil (banniere, categories, vedettes)
    │   ├── catalog/         # categories, produits, detail produit
    │   ├── cart/            # panier, CartState
    │   ├── address/         # adresses (liste, formulaire)
    │   ├── checkout/        # parcours de commande
    │   ├── order/           # commandes (liste, detail)
    │   ├── notification/    # notifications
    │   ├── profile/         # profil utilisateur
    │   └── splash/          # demarrage / restauration de session
    └── shared/
        └── widgets/         # LoadingView, ErrorView, EmptyView, ProductImage
```

## Configuration de l'API

L'URL de base est injectee a la compilation et pointe par defaut sur le backend :

```text
http://localhost:8089/api/v1
```

Pour l'emulateur Android, `localhost` designe la machine hote ; utiliser plutot :

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8089/api/v1
```

## Creation des plateformes natives

Le SDK Flutter n'est pas detecte actuellement sur cette machine.
Apres installation de Flutter, executer depuis ce dossier :

```bash
flutter create . --org com.ziouziou.freshmarket --project-name freshmarket_mobile --platforms android,ios
flutter pub get
flutter analyze
flutter test
flutter run
```
