class Category {
  const Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.imageUrl,
    required this.active,
    required this.displayOrder,
  });

  final int id;
  final String name;
  final String slug;
  final String? description;
  final String? imageUrl;
  final bool active;
  final int displayOrder;

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: (json['id'] as num).toInt(),
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString(),
      imageUrl: json['imageUrl']?.toString(),
      active: json['active'] as bool? ?? false,
      displayOrder: (json['displayOrder'] as num?)?.toInt() ?? 0,
    );
  }
}

class ProductImage {
  const ProductImage({required this.id, required this.imageUrl, this.altText, required this.displayOrder});

  final int id;
  final String imageUrl;
  final String? altText;
  final int displayOrder;

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: (json['id'] as num).toInt(),
      imageUrl: json['imageUrl']?.toString() ?? '',
      altText: json['altText']?.toString(),
      displayOrder: (json['displayOrder'] as num?)?.toInt() ?? 0,
    );
  }
}

class Product {
  const Product({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.name,
    required this.slug,
    this.description,
    this.brand,
    this.sku,
    required this.unitLabel,
    required this.price,
    this.oldPrice,
    this.imageUrl,
    required this.active,
    required this.featured,
    this.availableQuantity,
    this.images = const [],
  });

  final int id;
  final int categoryId;
  final String categoryName;
  final String name;
  final String slug;
  final String? description;
  final String? brand;
  final String? sku;
  final String unitLabel;
  final num price;
  final num? oldPrice;
  final String? imageUrl;
  final bool active;
  final bool featured;
  final num? availableQuantity;
  final List<ProductImage> images;

  bool get available => availableQuantity == null || availableQuantity! > 0;

  String? get mainImageUrl {
    if (imageUrl != null && imageUrl!.isNotEmpty) return imageUrl;
    if (images.isNotEmpty) return images.first.imageUrl;
    return null;
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['id'] as num).toInt(),
      categoryId: (json['categoryId'] as num?)?.toInt() ?? 0,
      categoryName: json['categoryName']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString(),
      brand: json['brand']?.toString(),
      sku: json['sku']?.toString(),
      unitLabel: json['unitLabel']?.toString() ?? '',
      price: json['price'] as num? ?? 0,
      oldPrice: json['oldPrice'] as num?,
      imageUrl: json['imageUrl']?.toString(),
      active: json['active'] as bool? ?? false,
      featured: json['featured'] as bool? ?? false,
      availableQuantity: json['availableQuantity'] as num?,
      images: (json['images'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(ProductImage.fromJson)
          .toList(),
    );
  }
}

class Promotion {
  const Promotion({
    required this.id,
    required this.name,
    this.description,
    required this.discountType,
    required this.discountValue,
    required this.productIds,
  });

  final int id;
  final String name;
  final String? description;
  final String discountType;
  final num discountValue;
  final List<int> productIds;

  bool get isPercentage => discountType == 'PERCENTAGE';

  factory Promotion.fromJson(Map<String, dynamic> json) {
    return Promotion(
      id: (json['id'] as num).toInt(),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      discountType: json['discountType']?.toString() ?? '',
      discountValue: json['discountValue'] as num? ?? 0,
      productIds: (json['productIds'] as List<dynamic>? ?? const [])
          .map((e) => (e as num).toInt())
          .toList(),
    );
  }
}

class PageResponse<T> {
  const PageResponse({
    required this.content,
    required this.page,
    required this.size,
    required this.totalElements,
    required this.totalPages,
    required this.first,
    required this.last,
  });

  final List<T> content;
  final int page;
  final int size;
  final int totalElements;
  final int totalPages;
  final bool first;
  final bool last;
}
