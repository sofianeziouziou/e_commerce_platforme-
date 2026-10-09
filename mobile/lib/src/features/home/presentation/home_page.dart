import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../app/shell.dart';
import '../../../core/config/app_environment.dart';
import '../../../core/utils/formatters.dart';
import '../../../features/catalog/data/catalog_repository.dart';
import '../../../features/catalog/data/models.dart' hide ProductImage;
import '../../../features/catalog/presentation/catalog_page.dart';
import '../../../features/catalog/presentation/product_detail_page.dart';
import '../../../features/auth/presentation/auth_state.dart';
import '../../../features/auth/presentation/login_page.dart';
import '../../../features/notification/data/notification_repository.dart';
import '../../../features/notification/presentation/notification_page.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/product_image.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final CatalogRepository _catalog = CatalogRepository();
  final NotificationRepository _notifications = NotificationRepository();

  bool _loading = true;
  bool _loadingInProgress = false;
  String? _error;
  List<Category> _categories = const [];
  List<Product> _featured = const [];
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    // Protection contre les cycles multiples : un seul chargement a la fois.
    if (_loadingInProgress) return;
    _loadingInProgress = true;

    final auth = context.read<AuthState>();
    setState(() {
      _loading = true;
      _error = null;
    });

    // Chaque section est chargee independamment : un echec d'un endpoint
    // (ex: notifications reservees aux connectes) ne doit pas faire echouer
    // tout l'accueil public (produits + categories).
    try {
      // Borne maximale de chargement : en mode Web, une requete bloquee par
      // la politique CORS peut ne jamais aboutir. On force alors la sortie de
      // l'etat de chargement pour eviter un spinner infini.
      const loadTimeout = Duration(seconds: 25);

      final categoriesFuture = _catalog.getCategories().timeout(loadTimeout);
      final featuredFuture = _catalog.getFeatured().timeout(loadTimeout);

      List<Category> categories = const [];
      List<Product> featured = const [];
      Object? categoriesError;
      Object? featuredError;

      try {
        categories = await categoriesFuture;
      } on Exception catch (e) {
        categoriesError = e;
      }
      try {
        featured = await featuredFuture;
      } on Exception catch (e) {
        featuredError = e;
      }

      if (!mounted) return;
      if (categoriesError != null && featuredError != null) {
        setState(() {
          _error = 'Impossible de charger le catalogue.';
          _loading = false;
        });
        return;
      }

      setState(() {
        if (categoriesError == null) _categories = categories;
        if (featuredError == null) _featured = featured;
      });

      // Notification : optionnelle et reservee aux utilisateurs connectes.
      // Ne jamais faire echouer l'accueil si elle est indisponible (401/403/
      // erreur reseau) : on garde le compteur a 0.
      if (auth.isAuthenticated) {
        try {
          final count = await _notifications.getUnreadCount().timeout(loadTimeout);
          if (!mounted) return;
          setState(() => _unreadCount = (count as num).toInt());
        } on Exception {
          // Ignore : le compteur reste a 0, l'accueil reste fonctionnel.
        }
      }
    } on Exception catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      _loadingInProgress = false;
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FreshMarket'),
        actions: [
          Consumer<AuthState>(
            builder: (_, auth, __) {
              if (!auth.isAuthenticated) {
                return IconButton(
                  icon: const Icon(Icons.login),
                  tooltip: 'Se connecter',
                  onPressed: () =>
                      Navigator.of(context).pushNamed(LoginPage.route),
                );
              }
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Badge(
                      isLabelVisible: _unreadCount > 0,
                      label: Text('$_unreadCount'),
                      child: const Icon(Icons.notifications_outlined),
                    ),
                    onPressed: () =>
                        Navigator.of(context).pushNamed(NotificationPage.route),
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout),
                    tooltip: 'Se deconnecter',
                    onPressed: () {
                      auth.logout().then((_) {
                        if (!context.mounted) return;
                        Navigator.of(context)
                            .pushNamedAndRemoveUntil(Shell.route, (route) => false);
                      });
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _Banner(),
                      const SizedBox(height: 24),
                      _SectionHeader(
                        title: 'Categories',
                        actionLabel: 'Tout voir',
                        onAction: () => Navigator.of(context)
                            .pushNamed(CatalogPage.route),
                      ),
                      const SizedBox(height: 12),
                      _CategoriesRow(categories: _categories),
                      const SizedBox(height: 24),
                      _SectionHeader(
                        title: 'Produits a la une',
                        actionLabel: 'Tout voir',
                        onAction: () => Navigator.of(context)
                            .pushNamed(CatalogPage.route),
                      ),
                      const SizedBox(height: 12),
                      _FeaturedGrid(products: _featured),
                    ],
                  ),
                ),
    );
  }
}

class _Banner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [theme.colorScheme.primary, theme.colorScheme.primary.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Faites vos courses en ligne en quelques clics.',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Des produits frais, des prix attractifs et une livraison rapide.',
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: theme.colorScheme.primary),
            onPressed: () => Navigator.of(context).pushNamed(CatalogPage.route),
            child: const Text('Explorer le catalogue'),
          ),
          const SizedBox(height: 8),
          Text(
            'API: ${AppEnvironment.apiBaseUrl}',
            style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.actionLabel, required this.onAction});

  final String title;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        TextButton(onPressed: onAction, child: Text(actionLabel)),
      ],
    );
  }
}

class _CategoriesRow extends StatelessWidget {
  const _CategoriesRow({required this.categories});

  final List<Category> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return const SizedBox.shrink();
    }
    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final category = categories[index];
          return _CategoryChip(
            name: category.name,
            imageUrl: category.imageUrl,
            onTap: () => Navigator.of(context).pushNamed(
              CatalogPage.route,
              arguments: {'category': category.slug},
            ),
          );
        },
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({required this.name, required this.imageUrl, required this.onTap});

  final String name;
  final String? imageUrl;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 90,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: ProductImage(url: imageUrl, width: 44, height: 44),
            ),
            const SizedBox(height: 6),
            Text(
              name,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _FeaturedGrid extends StatelessWidget {
  const _FeaturedGrid({required this.products});

  final List<Product> products;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return const Text('Aucun produit disponible pour le moment.');
    }
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) => _ProductCard(product: products[index]),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(
          ProductDetailPage.route,
          arguments: {'slug': product.slug},
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: ProductImage(url: product.mainImageUrl, width: double.infinity)),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.unitLabel,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    Formatters.price(product.price),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
