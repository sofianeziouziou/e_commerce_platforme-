import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';

import 'package:freshmarket_mobile/src/app/freshmarket_app.dart';
import 'package:freshmarket_mobile/src/app/shell.dart';
import 'package:freshmarket_mobile/src/features/auth/data/auth_repository.dart';
import 'package:freshmarket_mobile/src/features/auth/data/models.dart';
import 'package:freshmarket_mobile/src/features/auth/presentation/auth_state.dart';
import 'package:freshmarket_mobile/src/features/cart/presentation/cart_state.dart';

class _FakeAuthRepository extends AuthRepository {
  @override
  Future<UserSummary> me() async {
    return const UserSummary(
      id: 1,
      email: 'client@test.local',
      firstName: 'Client',
      lastName: 'Test',
      roles: ['ROLE_CLIENT'],
    );
  }
}

void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  testWidgets('demarrage sans JWT : accueil public, pas de Login', (tester) async {
    await tester.pumpWidget(const FreshMarketApp());
    await tester.pumpAndSettle();

    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.text('Accueil'), findsOneWidget);
    expect(find.text('Connexion'), findsOneWidget);
    expect(find.text('Commandes'), findsNothing);
    expect(find.text('Profil'), findsNothing);
    expect(find.text('Pas encore de compte ? Creer un compte'), findsNothing);
  });

  testWidgets('invite : l onglet Connexion ouvre la page Login', (tester) async {
    await tester.pumpWidget(const FreshMarketApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Connexion'));
    await tester.pumpAndSettle();

    expect(find.text('Pas encore de compte ? Creer un compte'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
  });

  testWidgets('client connecte : onglets commandes et profil, pas de connexion', (tester) async {
    FlutterSecureStorage.setMockInitialValues({'access_token': 'fake-token'});
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(
            create: (_) => AuthState(repository: _FakeAuthRepository())..bootstrap(),
          ),
          ChangeNotifierProvider(create: (_) => CartState()),
        ],
        child: const MaterialApp(home: Shell()),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Connexion'), findsNothing);
    expect(find.text('Commandes'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });
}
