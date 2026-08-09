import '../../../core/network/api_client.dart';

import 'models.dart';

class NotificationRepository {
  NotificationRepository({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<List<AppNotification>> getNotifications({int page = 0, int size = 20}) async {
    final data = await _client.get('/notifications?page=$page&size=$size');
    return (data as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(AppNotification.fromJson)
        .toList();
  }

  Future<int> getUnreadCount() async {
    final data = await _client.get('/notifications/unread-count');
    return (data as num).toInt();
  }

  Future<void> markAllRead() async {
    await _client.put('/notifications/read-all');
  }
}
