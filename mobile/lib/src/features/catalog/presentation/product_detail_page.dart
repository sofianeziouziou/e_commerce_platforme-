import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/formatters.dart';
import '../../../features/cart/presentation/cart_state.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/product_image.dart';
import '../data/catalog_repository.dart';
import '../data/models.dart' hide ProductImage;

class ProductDetailPage extends StatefulWidget {
  const ProductDetailPage({super.key, required this.slug});

  static const String route = '/product';

  final String slug;

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  final CatalogRepository _repository = CatalogRepository();

  bool _loading = true;
  String? _error;
  Product? _product;
  List<Product> _similar = const [];
  num _quantity = 1;
  bool _adding = false;

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
      final results = await Future.wait([
        _repository.getProduct(widget.slug),
        _repository.getSimilar(widget.slug),
      ]);
      if (!mounted) return;
      setState(() {
        _product = results[0] as Product;
        _similar = results[1] as List<Product>;
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

  Future<void> _addToCart() async {
    final product = _product;
    if (product == null) return;
    setState(() => _adding = true);
    final ok = await context.read<CartState>().add(productId: product.id, quantity: _quantity);
    if (!mounted) return;
    setState(() => _adding = false);
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${product.name} ajoute au panier.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Produit')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final product = _product!;
    final cartState = context.watch<CartState>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: ProductImage(url: product.mainImageUrl, height: 260, width: double.infinity),
        ),
        const SizedBox(height: 16),
        Text(
          product.categoryName,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(color: Theme.of(context).colorScheme.primary),
        ),
        const SizedBox(height: 4),
        Text(
          product.name,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        if (product.brand != null && product.brand!.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text('Marque : ${product.brand}', style: Theme.of(context).textTheme.bodyMedium),
        ],
        const SizedBox(height: 12),
        Row(
          children: [
            Text(
              Formatters.price(product.price),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
            if (product.oldPrice != null) ...[
              const SizedBox(width: 12),
              Text(
                Formatters.price(product.oldPrice),
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      decoration: TextDecoration.lineThrough,
                      color: Theme.of(context).colorScheme.outline,
                    ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        Text(
          product.unitLabel,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 16),
        if (product.description != null && product.description!.isNotEmpty) ...[
          Text('Description', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(product.description!, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 16),
        ],
        Row(
          children: [
            Text('Quantite', style: Theme.of(context).textTheme.titleSmall),
            const Spacer(),
            IconButton.outlined(
              icon: const Icon(Icons.remove),
              onPressed: _quantity > 1 ? () => setState(() => _quantity -= 1) : null,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text('${_quantity.toInt()}'),
            ),
            IconButton.outlined(
              icon: const Icon(Icons.add),
              onPressed: () => setState(() => _quantity += 1),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 52,
          child: FilledButton(
            onPressed: product.available ? (_adding ? null : _addToCart) : null,
            child: _adding
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : Text(product.available ? 'Ajouter au panier' : 'Produit indisponible'),
          ),
        ),
        if (cartState.error != null) ...[
          const SizedBox(height: 12),
          Text(
            cartState.error!,
            style: TextStyle(color: Theme.of(context).colorScheme.error),
          ),
        ],
        if (_similar.isNotEmpty) ...[
          const SizedBox(height: 24),
          Text('Produits similaires', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            height: 180,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _similar.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) => _SimilarCard(product: _similar[index]),
            ),
          ),
        ],
      ],
    );
  }
}

class _SimilarCard extends StatelessWidget {
  const _SimilarCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => Navigator.of(context).pushReplacementNamed(
            ProductDetailPage.route,
            arguments: {'slug': product.slug},
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: ProductImage(url: product.mainImageUrl, width: double.infinity)),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      Formatters.price(product.price),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
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
      ),
    );
  }
}
