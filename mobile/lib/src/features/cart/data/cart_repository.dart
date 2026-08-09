import '../../../core/network/api_client.dart';

import 'models.dart';

class CartRepository {
  CartRepository({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<Cart> getCart() async {
    final data = await _client.get('/cart');
    return Cart.fromJson(data as Map<String, dynamic>);
  }

  Future<Cart> addItem({required int productId, required num quantity}) async {
    final data = await _client.post('/cart/items', body: {
      'productId': productId,
      'quantity': quantity,
    });
    return Cart.fromJson(data as Map<String, dynamic>);
  }

  Future<Cart> updateItem({required int itemId, required num quantity}) async {
    final data = await _client.put('/cart/items/$itemId', body: {
      'quantity': quantity,
    });
    return Cart.fromJson(data as Map<String, dynamic>);
  }

  Future<Cart> removeItem({required int itemId}) async {
    final data = await _client.delete('/cart/items/$itemId');
    return Cart.fromJson(data as Map<String, dynamic>);
  }

  Future<void> clearCart() async {
    await _client.delete('/cart');
  }
}
