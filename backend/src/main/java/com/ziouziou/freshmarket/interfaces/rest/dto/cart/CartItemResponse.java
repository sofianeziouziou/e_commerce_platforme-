package com.ziouziou.freshmarket.interfaces.rest.dto.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        String unitLabel,
        BigDecimal unitPrice,
        BigDecimal quantity,
        BigDecimal lineTotal
) {
}

