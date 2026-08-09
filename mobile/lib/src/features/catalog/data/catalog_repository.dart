import '../../../core/network/api_client.dart';

import 'models.dart';

class CatalogRepository {
  CatalogRepository({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<List<Category>> getCategories() async {
    final data = await _client.get('/catalog/categories');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Category.fromJson)
        .toList();
  }

  Future<List<Product>> getFeatured({int size = 12}) async {
    final data = await _client.get('/catalog/products/featured?size=$size');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Product.fromJson)
        .toList();
  }

  Future<PageResponse<Product>> getProducts({
    String? search,
    String? category,
    int page = 0,
    int size = 48,
    String sort = 'featured',
  }) async {
    final params = <String, String>{
      'page': '$page',
      'size': '$size',
      'sort': sort,
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category.isNotEmpty) 'category': category,
    };
    final uri = params.entries.map((e) => '${e.key}=${Uri.encodeQueryComponent(e.value)}').join('&');
    final data = await _client.get('/catalog/products?$uri');
    final map = data as Map<String, dynamic>;
    return PageResponse<Product>(
      content: (map['content'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList(),
      page: (map['page'] as num?)?.toInt() ?? 0,
      size: (map['size'] as num?)?.toInt() ?? 0,
      totalElements: (map['totalElements'] as num?)?.toInt() ?? 0,
      totalPages: (map['totalPages'] as num?)?.toInt() ?? 0,
      first: map['first'] as bool? ?? true,
      last: map['last'] as bool? ?? true,
    );
  }

  Future<Product> getProduct(String slug) async {
    final data = await _client.get('/catalog/products/${Uri.encodeComponent(slug)}');
    return Product.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Product>> getSimilar(String slug, {int size = 8}) async {
    final data = await _client
        .get('/catalog/products/${Uri.encodeComponent(slug)}/similar?size=$size');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Product.fromJson)
        .toList();
  }

  Future<List<Promotion>> getPromotions() async {
    final data = await _client.get('/catalog/promotions');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Promotion.fromJson)
        .toList();
  }
}
