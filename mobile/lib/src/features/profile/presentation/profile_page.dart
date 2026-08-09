import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../features/address/presentation/address_list_page.dart';
import '../../../features/auth/presentation/auth_state.dart';
import '../../../features/auth/presentation/login_page.dart';
import '../../../features/notification/presentation/notification_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  static const String route = '/profile';

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameController;
  late final TextEditingController _lastNameController;
  late final TextEditingController _phoneController;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthState>().user;
    _firstNameController = TextEditingController(text: user?.firstName ?? '');
    _lastNameController = TextEditingController(text: user?.lastName ?? '');
    _phoneController = TextEditingController(text: user?.phoneNumber ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final auth = context.read<AuthState>();
    final ok = await auth.updateProfile(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? 'Profil mis a jour.' : (auth.error ?? 'Erreur lors de la mise a jour.'))),
    );
  }

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Se deconnecter ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Se deconnecter'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    if (!mounted) return;
    await context.read<AuthState>().logout();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil(LoginPage.route, (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Se deconnecter',
            onPressed: _confirmLogout,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Text(
              user != null ? '${user.firstName[0]}${user.lastName[0]}'.toUpperCase() : '?',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            user != null ? '${user.firstName} ${user.lastName}' : '',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          if (user != null) ...[
            Text(user.email, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
            if (user.roles.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  user.roles.join(', '),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ),
          ],
          const SizedBox(height: 24),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.location_on_outlined),
                  title: const Text('Mes adresses'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).pushNamed(AddressListPage.route),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Notifications'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).pushNamed(NotificationPage.route),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('Informations personnelles', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _firstNameController,
                  decoration: const InputDecoration(labelText: 'Prenom', prefixIcon: Icon(Icons.person_outline)),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Prenom requis.' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _lastNameController,
                  decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
                  validator: (value) => (value == null || value.trim().isEmpty) ? 'Nom requis.' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Telephone (optionnel)', prefixIcon: Icon(Icons.phone_outlined)),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Enregistrer'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
