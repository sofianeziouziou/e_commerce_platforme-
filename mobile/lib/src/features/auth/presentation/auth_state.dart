import 'package:flutter/foundation.dart';

import '../../../core/network/token_store.dart';
import '../data/auth_repository.dart';
import '../data/models.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState extends ChangeNotifier {
  AuthState({AuthRepository? repository})
      : _repository = repository ?? AuthRepository();

  final AuthRepository _repository;

  AuthStatus _status = AuthStatus.unknown;
  UserSummary? _user;
  String? _error;

  AuthStatus get status => _status;
  UserSummary? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> bootstrap() async {
    final token = await TokenStore.read();
    if (token == null || token.isEmpty) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }
    try {
      _user = await _repository.me();
      _status = AuthStatus.authenticated;
    } on Exception {
      await TokenStore.clear();
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login({required String email, required String password}) async {
    _error = null;
    try {
      final response = await _repository.login(email: email, password: password);
      await TokenStore.write(response.accessToken);
      _user = response.user;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phoneNumber,
  }) async {
    _error = null;
    try {
      final response = await _repository.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      );
      await TokenStore.write(response.accessToken);
      _user = response.user;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
    } on Exception {
      // Ici on ignore l'echec serveur : la session locale doit etre nettoyee quand meme.
    }
    await TokenStore.clear();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<bool> updateProfile({
    required String firstName,
    required String lastName,
    String? phoneNumber,
  }) async {
    _error = null;
    try {
      _user = await _repository.updateProfile(
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      );
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
