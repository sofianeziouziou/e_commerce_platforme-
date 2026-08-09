import '../../../core/network/api_client.dart';

import 'models.dart';

class AddressRepository {
  AddressRepository({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<List<Address>> getAddresses() async {
    final data = await _client.get('/addresses');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Address.fromJson)
        .toList();
  }

  Future<Address> createAddress(AddressRequest request) async {
    final data = await _client.post('/addresses', body: request.toJson());
    return Address.fromJson(data as Map<String, dynamic>);
  }

  Future<Address> updateAddress(int id, AddressRequest request) async {
    final data = await _client.put('/addresses/$id', body: request.toJson());
    return Address.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteAddress(int id) async {
    await _client.delete('/addresses/$id');
  }
}
