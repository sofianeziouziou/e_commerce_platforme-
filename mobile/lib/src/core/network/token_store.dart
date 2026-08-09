import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStore {
  TokenStore._();

  static const String _accessTokenKey = 'access_token';

  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<String?> read() => _storage.read(key: _accessTokenKey);

  static Future<void> write(String token) => _storage.write(key: _accessTokenKey, value: token);

  static Future<void> clear() => _storage.delete(key: _accessTokenKey);
}
