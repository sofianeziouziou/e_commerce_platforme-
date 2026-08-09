import 'package:flutter/material.dart';

import '../../../core/constants/order_status.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/product_image.dart';
import '../data/models.dart';
import '../data/order_repository.dart';

class OrderDetailPage extends StatefulWidget {
  const OrderDetailPage({super.key, required this.orderId});

  static const String route = '/orders/detail';

  final int orderId;

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  final OrderRepository _repository = OrderRepository();

  bool _loading = true;
  String? _error;
  Order? _order;

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
      final order = await _repository.getOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = order;
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
      appBar: AppBar(title: const Text('Detail de commande')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final order = _order!;
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
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
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    _StatusBadge(status: order.status),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Passe le ${Formatters.dateTime(order.createdAt?.toIso8601String())}',
                  style: theme.textTheme.bodySmall,
                ),
                if (order.customerNote != null && order.customerNote!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text('Note : ${order.customerNote}', style: theme.textTheme.bodyMedium),
                ],
              ],
            ),
          ),
        ),
        if (order.address != null) ...[
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.local_shipping_outlined),
              title: Text(order.address!.label),
              subtitle: Text(
                '${order.address!.recipientName} - ${order.address!.phoneNumber}\n'
                '${order.address!.streetLine}, ${order.address!.city}, ${order.address!.governorate}',
              ),
            ),
          ),
        ],
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: order.items
                .map(
                  (item) => ListTile(
                    leading: ProductImage(url: item.imageUrl, width: 48, height: 48),
                    title: Text(item.productName),
                    subtitle: Text('${item.unitLabel} x${item.quantity}'),
                    trailing: Text(
                      Formatters.price(item.lineTotal),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _SummaryRow(label: 'Sous-total', value: Formatters.price(order.subtotalAmount)),
                _SummaryRow(label: 'Livraison', value: Formatters.price(order.deliveryFee)),
                if (order.discountAmount > 0)
                  _SummaryRow(label: 'Remise', value: '-${Formatters.price(order.discountAmount)}'),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    Text(
                      Formatters.price(order.totalAmount),
                      style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = status == 'ANNULEE'
        ? Theme.of(context).colorScheme.error
        : Theme.of(context).colorScheme.primary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        orderStatusLabel(status),
        style: Theme.of(context)
            .textTheme
            .labelSmall
            ?.copyWith(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text(value, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
