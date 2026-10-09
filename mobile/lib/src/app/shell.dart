import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../features/auth/presentation/auth_state.dart';
import '../features/auth/presentation/login_page.dart';
import '../features/cart/presentation/cart_page.dart';
import '../features/cart/presentation/cart_state.dart';
import '../features/catalog/presentation/catalog_page.dart';
import '../features/home/presentation/home_page.dart';
import '../features/order/presentation/order_list_page.dart';
import '../features/profile/presentation/profile_page.dart';

class Shell extends StatefulWidget {
  const Shell({super.key});

  static const String route = '/shell';

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final cart = context.watch<CartState>();

    final guest = !auth.isAuthenticated;
    final pages = [
      const HomePage(),
      const CatalogPage(),
      const CartPage(),
      if (!guest) const OrderListPage(),
      if (!guest) const ProfilePage(),
    ];
    final destinations = [
      const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Accueil'),
      const NavigationDestination(icon: Icon(Icons.storefront_outlined), selectedIcon: Icon(Icons.storefront), label: 'Catalogue'),
      NavigationDestination(
        icon: _CartBadge(icon: Icons.shopping_cart_outlined, count: cart.itemCount),
        selectedIcon: _CartBadge(icon: Icons.shopping_cart, count: cart.itemCount),
        label: 'Panier',
      ),
      if (guest)
        const NavigationDestination(icon: Icon(Icons.login), selectedIcon: Icon(Icons.login), label: 'Connexion')
      else ...[
        const NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Commandes'),
        const NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profil'),
      ],
    ];
    final currentIndex = _index < destinations.length ? _index : 0;

    return Scaffold(
      body: IndexedStack(index: currentIndex, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (i) {
          if (guest && i == 3) {
            Navigator.of(context).pushNamed(LoginPage.route);
            return;
          }
          setState(() => _index = i);
        },
        destinations: destinations,
      ),
    );
  }
}

class _CartBadge extends StatelessWidget {
  const _CartBadge({required this.icon, required this.count});

  final IconData icon;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Badge(
      isLabelVisible: count > 0,
      label: Text('$count'),
      child: Icon(icon),
    );
  }
}
