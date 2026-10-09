import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_environment.dart';
import 'api_exception.dart';
import 'token_store.dart';

class ApiClient {
  ApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? AppEnvironment.apiBaseUrl;

  final http.Client _client;
  final String _baseUrl;

  static const Duration _timeout = Duration(seconds: 20);

  // Declenche le nettoyage de session quand le backend refuse un JWT (401).
  static void Function()? onUnauthorized;

  Future<dynamic> get(String path) => _send('GET', path);

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) =>
      _send('POST', path, body: body);

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) =>
      _send('PUT', path, body: body);

  Future<dynamic> delete(String path) => _send('DELETE', path);

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final token = await TokenStore.read();
    final hadToken = token != null && token.isNotEmpty;
    final headers = <String, String>{
      'Accept': 'application/json',
      if (body != null) 'Content-Type': 'application/json',
      if (hadToken) 'Authorization': 'Bearer $token',
    };

    final uri = Uri.parse('$_baseUrl$path');
    late http.Response response;
    try {
      switch (method) {
        case 'POST':
          response = await _client
              .post(uri, headers: headers, body: body == null ? null : jsonEncode(body))
              .timeout(_timeout);
          break;
        case 'PUT':
          response = await _client
              .put(uri, headers: headers, body: body == null ? null : jsonEncode(body))
              .timeout(_timeout);
          break;
        case 'DELETE':
          response = await _client.delete(uri, headers: headers).timeout(_timeout);
          break;
        default:
          response = await _client.get(uri, headers: headers).timeout(_timeout);
      }
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const ApiException(
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: 'Impossible de joindre le serveur. Verifiez votre connexion.',
      );
    }

    return _decode(response, hadToken: hadToken);
  }

  dynamic _decode(http.Response response, {required bool hadToken}) {
    final statusCode = response.statusCode;
    final raw = response.body.isEmpty ? null : response.body;

    if (statusCode >= 200 && statusCode < 300) {
      if (raw == null) return null;
      return jsonDecode(raw);
    }

    if (statusCode == 401 && hadToken) {
      onUnauthorized?.call();
    }

    throw _parseError(statusCode, raw);
  }

  ApiException _parseError(int statusCode, String? raw) {
    try {
      if (raw == null) throw const FormatException();
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final fieldErrors = (map['fieldErrors'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map((e) => FieldError(
                field: e['field']?.toString() ?? '',
                message: e['message']?.toString() ?? '',
              ))
          .toList();
      return ApiException(
        statusCode: statusCode,
        code: map['code']?.toString(),
        path: map['path']?.toString(),
        message: map['message']?.toString() ?? 'Erreur serveur (HTTP $statusCode).',
        fieldErrors: fieldErrors,
      );
    } catch (_) {
      return ApiException(
        statusCode: statusCode,
        message: 'Erreur serveur (HTTP $statusCode).',
      );
    }
  }
}
