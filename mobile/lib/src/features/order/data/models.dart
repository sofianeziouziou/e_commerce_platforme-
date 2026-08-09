import '../../../features/address/data/models.dart' as address_models;

class OrderItem {
  const OrderItem({
    required this.id,
    this.productId,
    required this.productName,
    required this.unitLabel,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
    this.imageUrl,
  });

  final int id;
  final int? productId;
  final String productName;
  final String unitLabel;
  final num unitPrice;
  final num quantity;
  final num lineTotal;
  final String? imageUrl;

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: (json['id'] as num).toInt(),
      productId: (json['productId'] as num?)?.toInt(),
      productName: json['productName']?.toString() ?? '',
      unitLabel: json['unitLabel']?.toString() ?? '',
      unitPrice: json['unitPrice'] as num? ?? 0,
      quantity: json['quantity'] as num? ?? 0,
      lineTotal: json['lineTotal'] as num? ?? 0,
      imageUrl: json['imageUrl']?.toString(),
    );
  }
}

class Order {
  const Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.subtotalAmount,
    required this.deliveryFee,
    required this.discountAmount,
    required this.totalAmount,
    this.customerNote,
    this.address,
    required this.items,
    required this.createdAt,
  });

  final int id;
  final String orderNumber;
  final String status;
  final num subtotalAmount;
  final num deliveryFee;
  final num discountAmount;
  final num totalAmount;
  final String? customerNote;
  final address_models.Address? address;
  final List<OrderItem> items;
  final DateTime? createdAt;

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: (json['id'] as num).toInt(),
      orderNumber: json['orderNumber']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      subtotalAmount: json['subtotalAmount'] as num? ?? 0,
      deliveryFee: json['deliveryFee'] as num? ?? 0,
      discountAmount: json['discountAmount'] as num? ?? 0,
      totalAmount: json['totalAmount'] as num? ?? 0,
      customerNote: json['customerNote']?.toString(),
      address: json['address'] is Map<String, dynamic>
          ? address_models.Address.fromJson(json['address'] as Map<String, dynamic>)
          : null,
      items: (json['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(OrderItem.fromJson)
          .toList(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}
