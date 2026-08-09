import '../../../core/network/api_client.dart';

import 'models.dart';

class AuthRepository {
  AuthRepository({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<AuthResponse> login({required String email, required String password}) async {
    final data = await _client.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(data as Map<String, dynamic>);
  }

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phoneNumber,
  }) async {
    final data = await _client.post('/auth/register', body: {
      'email': email,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      if (phoneNumber != null && phoneNumber.isNotEmpty) 'phoneNumber': phoneNumber,
    });
    return AuthResponse.fromJson(data as Map<String, dynamic>);
  }

  Future<UserSummary> me() async {
    final data = await _client.get('/auth/me');
    return UserSummary.fromJson(data as Map<String, dynamic>);
  }

  Future<UserSummary> updateProfile({
    required String firstName,
    required String lastName,
    String? phoneNumber,
  }) async {
    final data = await _client.put('/auth/me', body: {
      'firstName': firstName,
      'lastName': lastName,
      if (phoneNumber != null && phoneNumber.isNotEmpty) 'phoneNumber': phoneNumber,
    });
    return UserSummary.fromJson(data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _client.post('/auth/logout');
  }
}
