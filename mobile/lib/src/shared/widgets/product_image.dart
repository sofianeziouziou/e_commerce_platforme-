import 'package:flutter/material.dart';

class ProductImage extends StatelessWidget {
  const ProductImage({super.key, required this.url, this.width, this.height});

  final String? url;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      width: width,
      height: height,
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      alignment: Alignment.center,
      child: Icon(
        Icons.local_grocery_store_outlined,
        size: (width ?? 80) * 0.4,
        color: Theme.of(context).colorScheme.outline,
      ),
    );

    final urlValue = url;
    if (urlValue == null || urlValue.isEmpty) return fallback;

    return Image.network(
      urlValue,
      width: width,
      height: height,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => fallback,
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Container(
          width: width,
          height: height,
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          alignment: Alignment.center,
          child: const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        );
      },
    );
  }
}
