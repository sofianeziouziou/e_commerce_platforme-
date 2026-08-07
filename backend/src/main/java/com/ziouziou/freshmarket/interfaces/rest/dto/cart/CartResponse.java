package com.ziouziou.freshmarket.interfaces.rest.dto.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Long id,
        List<CartItemResponse> items,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal discountAmount,
        BigDecimal totalAmount
) {
}

