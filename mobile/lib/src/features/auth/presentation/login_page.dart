import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../app/shell.dart';
import 'auth_state.dart';
import 'register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  static const String route = '/auth/login';

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _submitting = false;

  String? _redirectTo;
  Map<String, dynamic>? _redirectArgs;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_redirectTo == null) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Map<String, dynamic>) {
        _redirectTo = args['redirectTo'] as String?;
        final redirectArgs = args['redirectArgs'];
        if (redirectArgs is Map) {
          _redirectArgs = Map<String, dynamic>.from(redirectArgs);
        }
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    final auth = context.read<AuthState>();
    final ok = await auth.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );
    if (!mounted) return;
    setState(() => _submitting = false);
    if (ok) {
      if (_redirectTo != null) {
        Navigator.of(context).pushReplacementNamed(
          _redirectTo!,
          arguments: _redirectArgs,
        );
      } else {
        Navigator.of(context).pushReplacementNamed(Shell.route);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Connexion impossible.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Icon(
                    Icons.shopping_basket,
                    size: 64,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'FreshMarket',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Connectez-vous pour continuer.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 32),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    validator: (value) {
                      final v = value?.trim() ?? '';
                      if (v.isEmpty) return 'Email requis.';
                      if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v)) {
                        return 'Email invalide.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    autofillHints: const [AutofillHints.password],
                    decoration: const InputDecoration(
                      labelText: 'Mot de passe',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                    validator: (value) =>
                        (value == null || value.isEmpty) ? 'Mot de passe requis.' : null,
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _submitting ? null : _submit,
                    child: _submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Se connecter'),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: _submitting
                        ? null
                        : () => Navigator.of(context).pushNamed(RegisterPage.route),
                    child: const Text('Pas encore de compte ? Creer un compte'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
