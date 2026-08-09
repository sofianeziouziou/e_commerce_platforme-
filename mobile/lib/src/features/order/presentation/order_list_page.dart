import 'package:flutter/material.dart';

import '../../../core/constants/order_status.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../data/models.dart';
import '../data/order_repository.dart';
import 'order_detail_page.dart';

class OrderListPage extends StatefulWidget {
  const OrderListPage({super.key});

  static const String route = '/orders';

  @override
  State<OrderListPage> createState() => _OrderListPageState();
}

class _OrderListPageState extends State<OrderListPage> {
  final OrderRepository _repository = OrderRepository();

  bool _loading = true;
  String? _error;
  List<Order> _orders = const [];

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
      final orders = await _repository.getOrders();
      if (!mounted) return;
      setState(() {
        _orders = orders;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mes commandes')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _orders.isEmpty
                  ? EmptyView(
                      icon: Icons.receipt_long_outlined,
                      title: 'Aucune commande',
                      message: 'Vos commandes apparaitront ici.',
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) => _OrderTile(order: _orders[index]),
                      ),
                    ),
    );
  }
}

class _OrderTile extends StatelessWidget {
  const _OrderTile({required this.order});

  final Order order;

  @override
  Widget build(BuildContext context) {
    final statusColor = order.status == 'ANNULEE'
        ? Theme.of(context).colorScheme.error
        : Theme.of(context).colorScheme.primary;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).pushNamed(
          OrderDetailPage.route,
          arguments: {'orderId': order.id},
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order.orderNumber,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      orderStatusLabel(order.status),
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(color: statusColor, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${order.items.length} article(s) · ${Formatters.dateTime(order.createdAt?.toIso8601String())}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total', style: Theme.of(context).textTheme.bodyMedium),
                  Text(
                    Formatters.price(order.totalAmount),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
