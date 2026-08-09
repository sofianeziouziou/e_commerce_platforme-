class AppEnvironment {
  const AppEnvironment._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8089/api/v1',
  );
}
