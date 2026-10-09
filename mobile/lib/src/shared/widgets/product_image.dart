import 'package:flutter/material.dart';

class ProductImage extends StatelessWidget {
  const ProductImage({super.key, required this.url, this.width, this.height});

  final String? url;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    // Les dimensions infinies (ex. width: double.infinity) sont resumees
    // par les contraintes du parent : une taille non finie (icone, image)
    // provoquerait une assertion de rendu.
    final double? boxWidth = width?.isFinite == true ? width : null;
    final double? boxHeight = height?.isFinite == true ? height : null;

    final fallback = Container(
      width: boxWidth,
      height: boxHeight,
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      alignment: Alignment.center,
      child: Icon(
        Icons.local_grocery_store_outlined,
        size: (boxWidth ?? 80) * 0.4,
        color: Theme.of(context).colorScheme.outline,
      ),
    );

    final urlValue = url;
    if (urlValue == null || urlValue.isEmpty) return fallback;

    return Image.network(
      urlValue,
      width: boxWidth,
      height: boxHeight,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => fallback,
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Container(
          width: boxWidth,
          height: boxHeight,
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
