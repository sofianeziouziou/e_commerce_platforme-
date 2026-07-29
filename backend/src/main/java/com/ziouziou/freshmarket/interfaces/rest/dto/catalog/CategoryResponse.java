package com.ziouziou.freshmarket.interfaces.rest.dto.catalog;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        boolean active,
        int displayOrder
) {
}

