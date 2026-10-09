import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../data/cart_repository.dart';
import '../data/models.dart';

class CartState extends ChangeNotifier {
  CartState({CartRepository? repository})
      : _repository = repository ?? CartRepository();

  final CartRepository _repository;

  Cart? _cart;
  bool _loading = false;
  String? _error;
  bool _unauthorized = false;

  Cart? get cart => _cart;
  bool get loading => _loading;
  String? get error => _error;
  bool get unauthorized => _unauthorized;
  int get itemCount => _cart?.itemCount ?? 0;

  Future<void> load() async {
    _loading = true;
    _error = null;
    _unauthorized = false;
    notifyListeners();
    try {
      _cart = await _repository.getCart();
    } on ApiException catch (e) {
      _error = e.message;
      _unauthorized = e.isUnauthorized;
    } on Exception catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> add({required int productId, required num quantity}) async {
    try {
      _cart = await _repository.addItem(productId: productId, quantity: quantity);
      _error = null;
      _unauthorized = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _unauthorized = e.isUnauthorized;
      notifyListeners();
      return false;
    }
  }

  Future<bool> update({required int itemId, required num quantity}) async {
    try {
      _cart = await _repository.updateItem(itemId: itemId, quantity: quantity);
      _error = null;
      _unauthorized = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _unauthorized = e.isUnauthorized;
      notifyListeners();
      return false;
    }
  }

  Future<bool> remove({required int itemId}) async {
    try {
      _cart = await _repository.removeItem(itemId: itemId);
      _error = null;
      _unauthorized = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _unauthorized = e.isUnauthorized;
      notifyListeners();
      return false;
    }
  }

  Future<void> clear() async {
    await _repository.clearCart();
    _cart = null;
    _error = null;
    _unauthorized = false;
    notifyListeners();
  }
}
