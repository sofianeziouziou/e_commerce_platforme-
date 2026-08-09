import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../app/shell.dart';
import 'auth_state.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  static const String route = '/auth/register';

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    final auth = context.read<AuthState>();
    final ok = await auth.register(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _submitting = false);
    if (ok) {
      Navigator.of(context).pushReplacementNamed(Shell.route);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Inscription impossible.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Creer un compte')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _firstNameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Prenom', prefixIcon: Icon(Icons.person_outline)),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Prenom requis.' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _lastNameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Nom requis.' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Telephone (optionnel)', prefixIcon: Icon(Icons.phone_outlined)),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
                  validator: (value) {
                    final v = value?.trim() ?? '';
                    if (v.isEmpty) return 'Email requis.';
                    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v)) return 'Email invalide.';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Mot de passe', prefixIcon: Icon(Icons.lock_outline)),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Mot de passe requis.';
                    if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caracteres.';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _confirmController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Confirmer le mot de passe', prefixIcon: Icon(Icons.lock_outline)),
                  validator: (value) {
                    if (value != _passwordController.text) return 'Les mots de passe ne correspondent pas.';
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting ? null : _submit,
                  child: _submitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Creer mon compte'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
