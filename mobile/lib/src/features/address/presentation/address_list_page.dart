import 'package:flutter/material.dart';

import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../data/address_repository.dart';
import '../data/models.dart';
import 'address_form_page.dart';

class AddressListPage extends StatefulWidget {
  const AddressListPage({super.key});

  static const String route = '/addresses';

  @override
  State<AddressListPage> createState() => _AddressListPageState();
}

class _AddressListPageState extends State<AddressListPage> {
  final AddressRepository _repository = AddressRepository();

  bool _loading = true;
  String? _error;
  List<Address> _addresses = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final addresses = await _repository.getAddresses();
      if (!mounted) return;
      setState(() {
        _addresses = addresses;
        _loading = false;
      });
    } on Exception catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _openForm([Address? address]) async {
    final result = await Navigator.of(context).pushNamed(
      AddressFormPage.route,
      arguments: {'address': address},
    );
    if (result == true) _load();
  }

  Future<void> _delete(Address address) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer cette adresse ?'),
        content: Text(address.label),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _repository.deleteAddress(address.id);
      _load();
    } on Exception catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes adresses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Ajouter une adresse',
            onPressed: () => _openForm(),
          ),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _addresses.isEmpty
                  ? EmptyView(
                      icon: Icons.location_on_outlined,
                      title: 'Aucune adresse enregistree',
                      message: 'Ajoutez une adresse pour pouvoir passer commande.',
                      actionLabel: 'Ajouter une adresse',
                      onAction: () => _openForm(),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _addresses.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) => _AddressTile(
                          address: _addresses[index],
                          onEdit: () => _openForm(_addresses[index]),
                          onDelete: () => _delete(_addresses[index]),
                        ),
                      ),
                    ),
    );
  }
}

class _AddressTile extends StatelessWidget {
  const _AddressTile({required this.address, required this.onEdit, required this.onDelete});

  final Address address;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    address.label,
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                if (address.defaultAddress)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Par defaut',
                      style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onPrimaryContainer),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text('${address.recipientName} - ${address.phoneNumber}',
                style: theme.textTheme.bodyMedium),
            Text(address.streetLine, style: theme.textTheme.bodyMedium),
            Text(
              '${address.city}, ${address.governorate}${address.postalCode != null && address.postalCode!.isNotEmpty ? ' - ${address.postalCode}' : ''}',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                TextButton.icon(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text('Modifier'),
                ),
                TextButton.icon(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                  label: Text('Supprimer', style: TextStyle(color: Colors.red)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
