package com.ziouziou.freshmarket.interfaces.rest.dto.promotion;

import com.ziouziou.freshmarket.domain.promotion.DiscountType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

public record PromotionResponse(
        Long id,
        String name,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        boolean active,
        Set<Long> productIds
) {
}

