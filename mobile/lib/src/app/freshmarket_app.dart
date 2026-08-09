import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_theme.dart';
import '../features/address/presentation/address_form_page.dart';
import '../features/address/presentation/address_list_page.dart';
import '../features/auth/presentation/auth_state.dart';
import '../features/auth/presentation/login_page.dart';
import '../features/auth/presentation/register_page.dart';
import '../features/cart/presentation/cart_state.dart';
import '../features/catalog/presentation/catalog_page.dart';
import '../features/catalog/presentation/product_detail_page.dart';
import '../features/checkout/presentation/checkout_page.dart';
import '../features/notification/presentation/notification_page.dart';
import '../features/order/presentation/order_detail_page.dart';
import '../features/order/presentation/order_list_page.dart';
import '../features/profile/presentation/profile_page.dart';
import '../features/splash/presentation/splash_page.dart';
import 'shell.dart';

class FreshMarketApp extends StatelessWidget {
  const FreshMarketApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthState()),
        ChangeNotifierProvider(create: (_) => CartState()),
      ],
      child: MaterialApp(
        title: 'FreshMarket',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        initialRoute: SplashPage.route,
        onGenerateRoute: (settings) {
          final arguments = settings.arguments;
          final args = arguments is Map<String, dynamic>
              ? arguments
              : (arguments is Map ? Map<String, dynamic>.from(arguments) : const <String, dynamic>{});
          final page = switch (settings.name) {
            SplashPage.route => const SplashPage(),
            LoginPage.route => const LoginPage(),
            RegisterPage.route => const RegisterPage(),
            Shell.route => const Shell(),
            CatalogPage.route => CatalogPage(
                initialCategory: args['category'] as String?,
                initialSearch: args['search'] as String?,
              ),
            ProductDetailPage.route => ProductDetailPage(slug: args['slug'] as String? ?? ''),
            CheckoutPage.route => const CheckoutPage(),
            OrderListPage.route => const OrderListPage(),
            OrderDetailPage.route => OrderDetailPage(orderId: (args['orderId'] as num?)?.toInt() ?? 0),
            ProfilePage.route => const ProfilePage(),
            AddressListPage.route => const AddressListPage(),
            AddressFormPage.route => AddressFormPage(address: args['address']),
            NotificationPage.route => const NotificationPage(),
            _ => const SplashPage(),
          };
          return MaterialPageRoute(builder: (_) => page, settings: settings);
        },
      ),
    );
  }
}
