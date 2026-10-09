import 'package:flutter/foundation.dart';

/// Configuration de l environnement d execution.
///
/// L URL de l API ne doit jamais etre devinee en release : un build livre sur
/// le Play Store qui pointe vers localhost est un build casse. Elle est donc
/// obligatoire via `--dart-define=API_BASE_URL=...` des la compilation release,
/// et l application echoue immediatement si elle est absente.
class AppEnvironment {
  const AppEnvironment._();

  /// URL injectee a la compilation. Vide si aucun `--dart-define` n est fourni.
  static const String definedApiBaseUrl =
      String.fromEnvironment('API_BASE_URL');

  /// Valeur de confort reservee au developpement local.
  ///
  /// Sur un emulateur Android, localhost designe l emulateur : utiliser
  /// `http://10.0.2.2:8089/api/v1` pour joindre la machine hote.
  static const String localApiBaseUrl = 'http://localhost:8089/api/v1';

  /// URL de base de l API, sans slash final (.ApiClient concatene les paths).
  static String get apiBaseUrl {
    final configured = _stripTrailingSlashes(definedApiBaseUrl);
    if (configured.isNotEmpty) return configured;
    if (kReleaseMode) {
      throw StateError(
        'API_BASE_URL est obligatoire en mode release. '
        'Compilez avec '
        '--dart-define=API_BASE_URL=https://api.exemple.tn/api/v1. '
        'Ne livrez jamais un build qui pointe vers $localApiBaseUrl.',
      );
    }
    return localApiBaseUrl;
  }

  /// A appeler au demarrage pour fail fast avant le premier ecran.
  static void validate() {
    // ignore: unnecessary_statements
    apiBaseUrl;
  }

  static String _stripTrailingSlashes(String value) {
    var result = value.trim();
    while (result.endsWith('/')) {
      result = result.substring(0, result.length - 1);
    }
    return result;
  }
}
