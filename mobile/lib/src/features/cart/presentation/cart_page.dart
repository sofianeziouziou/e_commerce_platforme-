import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/formatters.dart';
import '../../../features/auth/presentation/auth_state.dart';
import '../../../features/auth/presentation/login_page.dart';
import '../../../features/catalog/presentation/catalog_page.dart';
import '../../../features/checkout/presentation/checkout_page.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/product_image.dart';
import '../data/models.dart';
import 'cart_state.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<CartState>().load();
    });
  }

  Future<void> _changeQuantity(CartItem item, num delta) async {
    final next = (item.quantity + delta).clamp(0, 999);
    if (next == item.quantity) return;
    if (next == 0) {
      await context.read<CartState>().remove(itemId: item.id);
    } else {
      await context.read<CartState>().update(itemId: item.id, quantity: next);
    }
  }

  void _startCheckout() {
    final auth = context.read<AuthState>();
    if (auth.isAuthenticated) {
      Navigator.of(context).pushNamed(CheckoutPage.route);
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Connectez-vous pour continuer votre commande.')),
    );
    Navigator.of(context).pushNamed(
      LoginPage.route,
      arguments: {'redirectTo': CheckoutPage.route},
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<CartState>();
    final auth = context.watch<AuthState>();
    final cart = state.cart;
    final guestCartError = !auth.isAuthenticated && state.unauthorized;

    return Scaffold(
      appBar: AppBar(title: const Text('Panier')),
      body: state.loading && cart == null
          ? const LoadingView()
          : guestCartError
              ? EmptyView(
                  icon: Icons.lock_outline,
                  title: 'Connectez-vous pour retrouver votre panier',
                  message: 'Votre panier est enregistre sur votre compte.',
                  actionLabel: 'Se connecter',
                  onAction: () =>
                      Navigator.of(context).pushNamed(LoginPage.route),
                )
              : state.error != null && cart == null
                  ? ErrorView(message: state.error!, onRetry: state.load)
                  : cart == null || cart.items.isEmpty
                      ? EmptyView(
                          icon: Icons.shopping_cart_outlined,
                          title: 'Votre panier est vide',
                          message: 'Decouvrez nos produits frais.',
                          actionLabel: 'Voir le catalogue',
                          onAction: () =>
                              Navigator.of(context).pushNamed(CatalogPage.route),
                        )
                      : _buildContent(context, cart),
    );
  }

  Widget _buildContent(BuildContext context, Cart cart) {
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: cart.items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = cart.items[index];
              return _CartItemTile(item: item, onChangeQuantity: (d) => _changeQuantity(item, d));
            },
          ),
        ),
        _SummaryBar(cart: cart, onCheckout: _startCheckout),
      ],
    );
  }
}

class _CartItemTile extends StatelessWidget {
  const _CartItemTile({required this.item, required this.onChangeQuantity});

  final CartItem item;
  final ValueChanged<num> onChangeQuantity;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ProductImage(url: item.imageUrl, width: 64, height: 64),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.productName, style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(
                    '${item.unitLabel} · ${Formatters.price(item.unitPrice)}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton.outlined(
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(Icons.remove, size: 18),
                        onPressed: () => onChangeQuantity(-1),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        child: Text('${item.quantity}'),
                      ),
                      IconButton.outlined(
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(Icons.add, size: 18),
                        onPressed: () => onChangeQuantity(1),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  Formatters.price(item.lineTotal),
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => onChangeQuantity(-item.quantity),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryBar extends StatelessWidget {
  const _SummaryBar({required this.cart, required this.onCheckout});

  final Cart cart;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Sous-total', style: Theme.of(context).textTheme.bodyLarge),
                Text(Formatters.price(cart.subtotal), style: Theme.of(context).textTheme.bodyLarge),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Livraison', style: Theme.of(context).textTheme.bodyMedium),
                Text(Formatters.price(cart.deliveryFee), style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
            if (cart.discountAmount > 0) ...[
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Remise', style: Theme.of(context).textTheme.bodyMedium),
                  Text(
                    '-${Formatters.price(cart.discountAmount)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.primary),
                  ),
                ],
              ),
            ],
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
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: onCheckout,
                child: const Text('Passer la commande'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
