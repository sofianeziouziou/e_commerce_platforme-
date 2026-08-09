import 'package:flutter/material.dart';

import '../../../core/constants/governorates.dart';
import '../data/address_repository.dart';
import '../data/models.dart';

class AddressFormPage extends StatefulWidget {
  const AddressFormPage({super.key, this.address});

  static const String route = '/addresses/form';

  final Address? address;

  @override
  State<AddressFormPage> createState() => _AddressFormPageState();
}

class _AddressFormPageState extends State<AddressFormPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _labelController;
  late final TextEditingController _recipientNameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _streetController;
  late final TextEditingController _cityController;
  late final TextEditingController _postalController;
  late String _governorate;
  late bool _defaultAddress;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final address = widget.address;
    _labelController = TextEditingController(text: address?.label ?? '');
    _recipientNameController = TextEditingController(text: address?.recipientName ?? '');
    _phoneController = TextEditingController(text: address?.phoneNumber ?? '');
    _streetController = TextEditingController(text: address?.streetLine ?? '');
    _cityController = TextEditingController(text: address?.city ?? '');
    _postalController = TextEditingController(text: address?.postalCode ?? '');
    _governorate = address?.governorate ?? '';
    _defaultAddress = address?.defaultAddress ?? false;
  }

  @override
  void dispose() {
    _labelController.dispose();
    _recipientNameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _postalController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final repository = AddressRepository();
    final request = AddressRequest(
      label: _labelController.text.trim(),
      recipientName: _recipientNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      streetLine: _streetController.text.trim(),
      city: _cityController.text.trim(),
      governorate: _governorate,
      postalCode: _postalController.text.trim(),
      defaultAddress: _defaultAddress,
    );
    try {
      final existing = widget.address;
      if (existing == null) {
        await repository.createAddress(request);
      } else {
        await repository.updateAddress(existing.id, request);
      }
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on Exception catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.address != null;
    return Scaffold(
      appBar: AppBar(title: Text(isEdit ? 'Modifier l\'adresse' : 'Nouvelle adresse')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              TextFormField(
                controller: _labelController,
                decoration: const InputDecoration(labelText: 'Libelle', hintText: 'Domicile, Bureau...'),
                validator: (value) => (value == null || value.trim().isEmpty) ? 'Libelle requis.' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _recipientNameController,
                      decoration: const InputDecoration(labelText: 'Nom du destinataire'),
                      validator: (value) => (value == null || value.trim().isEmpty) ? 'Requis.' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'Telephone'),
                      validator: (value) => (value == null || value.trim().isEmpty) ? 'Requis.' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _streetController,
                decoration: const InputDecoration(labelText: 'Adresse', hintText: 'Rue, numero, residence...'),
                validator: (value) => (value == null || value.trim().isEmpty) ? 'Adresse requise.' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(labelText: 'Ville'),
                validator: (value) => (value == null || value.trim().isEmpty) ? 'Ville requise.' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _governorate.isEmpty ? null : _governorate,
                decoration: const InputDecoration(labelText: 'Gouvernorat'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Choisir...')),
                  ...kGovernorates.map(
                    (g) => DropdownMenuItem(value: g, child: Text(g)),
                  ),
                ],
                onChanged: (value) => setState(() => _governorate = value ?? ''),
                validator: (value) =>
                    (_governorate.isEmpty) ? 'Gouvernorat requis.' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _postalController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Code postal (optionnel)'),
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Adresse par defaut'),
                value: _defaultAddress,
                onChanged: (value) => setState(() => _defaultAddress = value),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(isEdit ? 'Enregistrer' : 'Ajouter'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
