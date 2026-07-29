package com.ziouziou.freshmarket.interfaces.rest.dto.favorite;

import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductResponse;
import java.time.OffsetDateTime;

public record FavoriteResponse(
        Long id,
        ProductResponse product,
        OffsetDateTime createdAt
) {
}

