import '../../../core/network/api_client.dart';

import 'models.dart';

class OrderRepository {
  OrderRepository({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<Order> createOrder({required int addressId, String? customerNote}) async {
    final data = await _client.post('/orders', body: {
      'addressId': addressId,
      if (customerNote != null && customerNote.isNotEmpty) 'customerNote': customerNote,
    });
    return Order.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Order>> getOrders({int page = 0, int size = 20}) async {
    final data = await _client.get('/orders?page=$page&size=$size');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Order.fromJson)
        .toList();
  }

  Future<Order> getOrder(int orderId) async {
    final data = await _client.get('/orders/$orderId');
    return Order.fromJson(data as Map<String, dynamic>);
  }
}
