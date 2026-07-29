package com.ziouziou.freshmarket.interfaces.rest.dto.catalog;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        String slug,
        String description,
        String brand,
        String sku,
        String unitLabel,
        BigDecimal price,
        BigDecimal oldPrice,
        String imageUrl,
        boolean active,
        boolean featured,
        BigDecimal availableQuantity,
        List<ProductImageResponse> images
) {
}

