import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:freshmarket_mobile/src/features/auth/presentation/auth_state.dart';
import 'package:freshmarket_mobile/src/features/auth/presentation/login_page.dart';

void main() {
  testWidgets('login page renders freshmarket branding', (tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthState(),
        child: const MaterialApp(home: LoginPage()),
      ),
    );

    expect(find.text('FreshMarket'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
    expect(find.text('Pas encore de compte ? Creer un compte'), findsOneWidget);
  });

  testWidgets('login page validates empty fields', (tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthState(),
        child: const MaterialApp(home: LoginPage()),
      ),
    );

    await tester.tap(find.text('Se connecter'));
    await tester.pump();

    expect(find.text('Email requis.'), findsOneWidget);
    expect(find.text('Mot de passe requis.'), findsOneWidget);
  });
}
