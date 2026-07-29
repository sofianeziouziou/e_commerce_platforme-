# Mobile - FreshMarket

Application mobile Flutter destinee aux clients.

## Stack

- Flutter.
- Dart.
- Material 3.
- Une base de code pour Android et iOS.

## Structure

```text
lib/
├── main.dart
└── src/
    ├── app/
    ├── core/
    ├── features/
    └── shared/
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

