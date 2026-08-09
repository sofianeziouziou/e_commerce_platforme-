class CartItem {
  const CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    this.imageUrl,
    required this.unitLabel,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
  });

  final int id;
  final int productId;
  final String productName;
  final String? imageUrl;
  final String unitLabel;
  final num unitPrice;
  final num quantity;
  final num lineTotal;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: (json['id'] as num).toInt(),
      productId: (json['productId'] as num).toInt(),
      productName: json['productName']?.toString() ?? '',
      imageUrl: json['imageUrl']?.toString(),
      unitLabel: json['unitLabel']?.toString() ?? '',
      unitPrice: json['unitPrice'] as num? ?? 0,
      quantity: json['quantity'] as num? ?? 0,
      lineTotal: json['lineTotal'] as num? ?? 0,
    );
  }
}

class Cart {
  const Cart({
    required this.id,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.discountAmount,
    required this.totalAmount,
  });

  final int id;
  final List<CartItem> items;
  final num subtotal;
  final num deliveryFee;
  final num discountAmount;
  final num totalAmount;

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity.toInt());

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: (json['id'] as num?)?.toInt() ?? 0,
      items: (json['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(CartItem.fromJson)
          .toList(),
      subtotal: json['subtotal'] as num? ?? 0,
      deliveryFee: json['deliveryFee'] as num? ?? 0,
      discountAmount: json['discountAmount'] as num? ?? 0,
      totalAmount: json['totalAmount'] as num? ?? 0,
    );
  }
}
