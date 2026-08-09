import 'package:flutter/material.dart';

import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../data/models.dart';
import '../data/notification_repository.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  static const String route = '/notifications';

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  final NotificationRepository _repository = NotificationRepository();

  bool _loading = true;
  String? _error;
  List<AppNotification> _notifications = const [];

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
      final notifications = await _repository.getNotifications();
      if (!mounted) return;
      setState(() {
        _notifications = notifications;
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

  Future<void> _markAllRead() async {
    try {
      await _repository.markAllRead();
      if (!mounted) return;
      setState(() {
        _notifications = _notifications
            .map((n) => AppNotification(
                  id: n.id,
                  title: n.title,
                  message: n.message,
                  type: n.type,
                  readAt: n.readAt ?? DateTime.now(),
                  createdAt: n.createdAt,
                ))
            .toList();
      });
    } on Exception catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Tout marquer comme lu',
            onPressed: _notifications.isEmpty ? null : _markAllRead,
          ),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _notifications.isEmpty
                  ? const EmptyView(
                      icon: Icons.notifications_none,
                      title: 'Aucune notification',
                      message: 'Vous serez informe de l\'avancement de vos commandes.',
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) =>
                            _NotificationTile(notification: _notifications[index]),
                      ),
                    ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.notification});

  final AppNotification notification;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: notification.isRead
          ? Theme.of(context).colorScheme.surface
          : Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.4),
      child: ListTile(
        title: Text(
          notification.title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
              ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(notification.message),
            const SizedBox(height: 4),
            Text(
              Formatters.dateTime(notification.createdAt?.toIso8601String()),
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ],
        ),
        leading: Icon(
          notification.isRead ? Icons.notifications_outlined : Icons.notifications,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}
