package com.ziouziou.freshmarket.interfaces.rest.dto.catalog;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        String altText,
        int displayOrder
) {
}

