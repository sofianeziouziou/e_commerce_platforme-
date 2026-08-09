class ApiException implements Exception {
  const ApiException({
    required this.statusCode,
    required this.message,
    this.code,
    this.path,
    this.fieldErrors = const [],
  });

  final int statusCode;
  final String message;
  final String? code;
  final String? path;
  final List<FieldError> fieldErrors;

  bool get isUnauthorized => statusCode == 401;
  bool get isValidation => statusCode == 400 && code == 'VALIDATION_ERROR';

  @override
  String toString() => message;
}

class FieldError {
  const FieldError({required this.field, required this.message});

  final String field;
  final String message;
}
