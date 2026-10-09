import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../app/shell.dart';
import '../../../features/auth/presentation/auth_state.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  static const String route = '/';

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final auth = context.read<AuthState>();
    try {
      await auth.bootstrap();
    } catch (_) {
      // Ne jamais rester bloque sur le splash : en cas d'erreur (stockage,
      // reseau, plugin), on poursuit vers l'accueil public.
    }
    if (!mounted) return;
    // L'acces au catalogue est public : tout le monde demarre sur l'accueil.
    // La connexion n'est demandee que lorsqu'une action l'exige.
    Navigator.of(context).pushReplacementNamed(Shell.route);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_basket,
              size: 80,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'FreshMarket',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
