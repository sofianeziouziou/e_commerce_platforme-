import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/product_image.dart';
import '../data/catalog_repository.dart';
import '../data/models.dart' hide ProductImage;
import 'product_detail_page.dart';

class CatalogPage extends StatefulWidget {
  const CatalogPage({super.key, this.initialCategory, this.initialSearch});

  static const String route = '/catalog';

  final String? initialCategory;
  final String? initialSearch;

  @override
  State<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  final CatalogRepository _repository = CatalogRepository();

  final TextEditingController _searchController = TextEditingController();

  List<Category> _categories = const [];
  List<Product> _products = const [];
  String? _selectedCategory;
  String _sort = 'featured';
  int _page = 0;
  bool _hasMore = true;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _searchController.text = widget.initialSearch ?? '';
    _searchController.addListener(_onSearchChanged);
    _loadInitial();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    _debounce(_loadFirstPage);
  }

  Timer? _debounceTimer;

  void _debounce(VoidCallback action) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 400), action);
  }

  Future<void> _loadInitial() async {
    try {
      final categories = await _repository.getCategories();
      if (!mounted) return;
      setState(() => _categories = categories);
    } on Exception {
      // Les categories peuvent echouer independamment des produits.
    }
    await _loadFirstPage();
  }

  Future<void> _loadFirstPage() async {
    setState(() {
      _loading = true;
      _error = null;
      _page = 0;
      _hasMore = true;
    });
    try {
      final result = await _repository.getProducts(
        search: _searchController.text.trim(),
        category: _selectedCategory,
        page: 0,
        sort: _sort,
      );
      if (!mounted) return;
      setState(() {
        _products = result.content;
        _hasMore = !result.last;
        _page = 1;
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

  Future<void> _loadMore() async {
    if (_loadingMore || !_hasMore) return;
    setState(() => _loadingMore = true);
    try {
      final result = await _repository.getProducts(
        search: _searchController.text.trim(),
        category: _selectedCategory,
        page: _page,
        sort: _sort,
      );
      if (!mounted) return;
      setState(() {
        _products = [..._products, ...result.content];
        _hasMore = !result.last;
        _page += 1;
        _loadingMore = false;
      });
    } on Exception catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingMore = false;
        _error = e.toString();
      });
    }
  }

  void _setSort(String sort) {
    setState(() => _sort = sort);
    _loadFirstPage();
  }

  void _setCategory(String? slug) {
    setState(() => _selectedCategory = slug);
    _loadFirstPage();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catalogue'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Rechercher un produit...',
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort),
            onSelected: _setSort,
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'featured', child: Text('En vedette')),
              PopupMenuItem(value: 'price-asc', child: Text('Prix croissant')),
              PopupMenuItem(value: 'price-desc', child: Text('Prix decroissant')),
              PopupMenuItem(value: 'name', child: Text('Nom')),
              PopupMenuItem(value: 'newest', child: Text('Plus recents')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          _CategoryFilterBar(
            categories: _categories,
            selected: _selectedCategory,
            onSelected: _setCategory,
          ),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) return const LoadingView();
    if (_error != null && _products.isEmpty) {
      return ErrorView(message: _error!, onRetry: _loadFirstPage);
    }
    if (_products.isEmpty) {
      return const EmptyCatalogHint();
    }
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification.metrics.pixels >= notification.metrics.maxScrollExtent - 300) {
          _loadMore();
        }
        return false;
      },
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.72,
        ),
        itemCount: _products.length + (_loadingMore ? 2 : 0),
        itemBuilder: (context, index) {
          if (index >= _products.length) {
            return const Center(child: CircularProgressIndicator());
          }
          return _CatalogProductCard(product: _products[index]);
        },
      ),
    );
  }
}

class EmptyCatalogHint extends StatelessWidget {
  const EmptyCatalogHint({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 56, color: Theme.of(context).colorScheme.outline),
          const SizedBox(height: 16),
          const Text('Aucun produit ne correspond a votre recherche.'),
        ],
      ),
    );
  }
}

class _CategoryFilterBar extends StatelessWidget {
  const _CategoryFilterBar({
    required this.categories,
    required this.selected,
    required this.onSelected,
  });

  final List<Category> categories;
  final String? selected;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: const Text('Tous'),
              selected: selected == null,
              onSelected: (_) => onSelected(null),
            ),
          ),
          ...categories.map(
            (category) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(category.name),
                selected: selected == category.slug,
                onSelected: (_) => onSelected(category.slug),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CatalogProductCard extends StatelessWidget {
  const _CatalogProductCard({required this.product});

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
                  Text(product.unitLabel, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        Formatters.price(product.price),
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                      ),
                      if (product.oldPrice != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          Formatters.price(product.oldPrice),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                decoration: TextDecoration.lineThrough,
                                color: Theme.of(context).colorScheme.outline,
                              ),
                        ),
                      ],
                    ],
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
