import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/formatters.dart';
import '../../../features/address/data/address_repository.dart';
import '../../../features/address/data/models.dart';
import '../../../features/address/presentation/address_list_page.dart';
import '../../../features/cart/data/models.dart';
import '../../../features/cart/presentation/cart_state.dart';
import '../../../features/order/data/order_repository.dart';
import '../../../features/order/presentation/order_detail_page.dart';
import '../../../features/order/presentation/order_list_page.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/product_image.dart';

enum _Step { review, address, confirm, done }

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  static const String route = '/checkout';

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final AddressRepository _addressRepository = AddressRepository();
  final OrderRepository _orderRepository = OrderRepository();

  _Step _step = _Step.review;
  bool _loading = true;
  String? _error;
  List<Address> _addresses = const [];
  int? _selectedAddressId;
  String _customerNote = '';
  bool _creating = false;
  int? _createdOrderId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final cartState = context.read<CartState>();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (cartState.cart == null) await cartState.load();
      final addresses = await _addressRepository.getAddresses();
      if (!mounted) return;
      setState(() {
        _addresses = addresses;
        int? defaultId;
        for (final a in addresses) {
          if (a.defaultAddress) {
            defaultId = a.id;
            break;
          }
        }
        _selectedAddressId = defaultId ?? (addresses.isNotEmpty ? addresses.first.id : null);
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

  Future<void> _createOrder() async {
    final cartState = context.read<CartState>();
    if (cartState.cart == null || _selectedAddressId == null) return;
    setState(() => _creating = true);
    try {
      final order = await _orderRepository.createOrder(
        addressId: _selectedAddressId!,
        customerNote: _customerNote.trim().isEmpty ? null : _customerNote.trim(),
      );
      await cartState.clear();
      if (!mounted) return;
      setState(() {
        _createdOrderId = order.id;
        _step = _Step.done;
      });
    } on Exception catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Commande')),
      body: _loading
          ? const LoadingView()
          : _error != null && _step != _Step.done
              ? ErrorView(message: _error!, onRetry: _loadData)
              : _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    final cartState = context.watch<CartState>();
    final cart = cartState.cart;

    if (_step == _Step.done) {
      return _DoneView(orderId: _createdOrderId);
    }

    if (cart == null || cart.items.isEmpty) {
      return EmptyView(
        icon: Icons.shopping_cart_outlined,
        title: 'Votre panier est vide',
        message: 'Ajoutez des produits avant de passer commande.',
        actionLabel: 'Voir le catalogue',
        onAction: () => Navigator.of(context).pop(),
      );
    }

    Address? selected;
    for (final a in _addresses) {
      if (a.id == _selectedAddressId) {
        selected = a;
        break;
      }
    }
    final selectedAddress = selected;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _StepIndicator(current: _step),
        const SizedBox(height: 16),
        switch (_step) {
          _Step.review => _buildReview(context, cart),
          _Step.address => _buildAddress(context),
          _Step.confirm => _buildConfirm(context, cart, selectedAddress),
          _Step.done => const SizedBox.shrink(),
        },
      ],
    );
  }

  Widget _buildReview(BuildContext context, Cart cart) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Verification du panier', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...cart.items.map(
          (item) => Card(
            child: ListTile(
              leading: ProductImage(url: item.imageUrl, width: 48, height: 48),
              title: Text(item.productName),
              subtitle: Text('${item.unitLabel} x${item.quantity}'),
              trailing: Text(
                Formatters.price(item.lineTotal),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 52,
          child: FilledButton(
            onPressed: () => setState(() => _step = _Step.address),
            child: const Text('Choisir l\'adresse de livraison'),
          ),
        ),
      ],
    );
  }

  Widget _buildAddress(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Adresse de livraison', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            TextButton(
              onPressed: () => Navigator.of(context)
                  .pushNamed(AddressListPage.route)
                  .then((_) => _loadData()),
              child: const Text('Gerer mes adresses'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (_addresses.isEmpty)
          EmptyView(
            icon: Icons.location_on_outlined,
            title: 'Aucune adresse enregistree',
            message: 'Ajoutez une adresse avant de continuer.',
            actionLabel: 'Ajouter une adresse',
            onAction: () => Navigator.of(context).pushNamed(AddressListPage.route).then((_) => _loadData()),
          )
        else
          RadioGroup<int>(
            groupValue: _selectedAddressId,
            onChanged: (value) => setState(() => _selectedAddressId = value),
            child: Column(
              children: [
                for (final address in _addresses)
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: address.id == _selectedAddressId
                            ? Theme.of(context).colorScheme.primary
                            : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: RadioListTile<int>(
                      title: Text(address.label),
                      subtitle: Text('${address.recipientName} - ${address.phoneNumber}\n${address.streetLine}, ${address.city}'),
                      value: address.id,
                    ),
                  ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        TextField(
          controller: null,
          decoration: const InputDecoration(
            labelText: 'Note pour le livreur (optionnelle)',
            hintText: 'Instructions de livraison, code d\'acces, interphone...',
          ),
          maxLines: 3,
          onChanged: (value) => setState(() => _customerNote = value),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 52,
          child: FilledButton(
            onPressed: _selectedAddressId == null
                ? null
                : () => setState(() => _step = _Step.confirm),
            child: const Text('Continuer vers le resume'),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirm(BuildContext context, Cart cart, Address? address) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Resume de la commande', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (address != null)
          Card(
            child: ListTile(
              leading: const Icon(Icons.local_shipping_outlined),
              title: Text(address.label),
              subtitle: Text('${address.recipientName} - ${address.phoneNumber}\n${address.streetLine}, ${address.city}, ${address.governorate}'),
            ),
          ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _SummaryRow(label: 'Sous-total', value: Formatters.price(cart.subtotal)),
                _SummaryRow(label: 'Livraison', value: Formatters.price(cart.deliveryFee)),
                if (cart.discountAmount > 0)
                  _SummaryRow(label: 'Remise', value: '-${Formatters.price(cart.discountAmount)}'),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    Text(
                      Formatters.price(cart.totalAmount),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Paiement a la livraison (especes ou carte).',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 52,
          child: FilledButton(
            onPressed: _creating ? null : _createOrder,
            child: _creating
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Confirmer la commande'),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(
            _error!,
            style: TextStyle(color: Theme.of(context).colorScheme.error),
          ),
        ],
      ],
    );
  }
}

class _StepIndicator extends StatelessWidget {
  const _StepIndicator({required this.current});

  final _Step current;

  static const _labels = ['Panier', 'Adresse', 'Confirmation'];
  static const _allSteps = [_Step.review, _Step.address, _Step.confirm, _Step.done];

  @override
  Widget build(BuildContext context) {
    final currentIndex = _allSteps.indexOf(current);
    return Row(
      children: [
        for (var i = 0; i < _labels.length; i++) ...[
          if (i > 0) const Expanded(child: Divider()),
          CircleAvatar(
            radius: 14,
            backgroundColor: i <= currentIndex
                ? Theme.of(context).colorScheme.primary
                : Theme.of(context).colorScheme.outlineVariant,
            child: Text(
              '${i + 1}',
              style: TextStyle(
                color: i <= currentIndex ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 4),
          Text(
            _labels[i],
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: i <= currentIndex ? FontWeight.bold : FontWeight.normal,
                ),
          ),
        ],
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text(value, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}

class _DoneView extends StatelessWidget {
  const _DoneView({required this.orderId});

  final int? orderId;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, size: 72, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text(
              'Commande confirmee !',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Votre commande a ete creee avec succes. Vous recevrez une confirmation.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: orderId != null
                  ? () => Navigator.of(context).pushNamedAndRemoveUntil(
                        OrderDetailPage.route,
                        (route) => false,
                        arguments: {'orderId': orderId},
                      )
                  : null,
              child: const Text('Voir le detail'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil(
                    OrderListPage.route,
                    (route) => false,
                  ),
              child: const Text('Mes commandes'),
            ),
          ],
        ),
      ),
    );
  }
}
