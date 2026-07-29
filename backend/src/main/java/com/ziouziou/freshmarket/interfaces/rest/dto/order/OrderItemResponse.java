package com.ziouziou.freshmarket.interfaces.rest.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        String unitLabel,
        BigDecimal unitPrice,
        BigDecimal quantity,
        BigDecimal lineTotal,
        String imageUrl
) {
}

