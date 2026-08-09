class UserSummary {
  const UserSummary({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phoneNumber,
    this.roles = const [],
  });

  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phoneNumber;
  final List<String> roles;

  bool get isAdmin => roles.contains('ROLE_ADMIN');

  factory UserSummary.fromJson(Map<String, dynamic> json) {
    return UserSummary(
      id: (json['id'] as num).toInt(),
      email: json['email']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      phoneNumber: json['phoneNumber']?.toString(),
      roles: (json['roles'] as List<dynamic>? ?? const [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class AuthResponse {
  const AuthResponse({
    required this.accessToken,
    required this.tokenType,
    required this.expiresAt,
    required this.user,
  });

  final String accessToken;
  final String tokenType;
  final DateTime? expiresAt;
  final UserSummary user;

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken']?.toString() ?? '',
      tokenType: json['tokenType']?.toString() ?? 'Bearer',
      expiresAt: DateTime.tryParse(json['expiresAt']?.toString() ?? ''),
      user: UserSummary.fromJson(
          (json['user'] as Map<String, dynamic>?) ?? const {}),
    );
  }
}
