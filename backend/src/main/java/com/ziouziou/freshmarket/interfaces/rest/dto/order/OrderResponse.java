package com.ziouziou.freshmarket.interfaces.rest.dto.order;

import com.ziouziou.freshmarket.domain.order.OrderStatus;
import com.ziouziou.freshmarket.interfaces.rest.dto.customer.AddressResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        BigDecimal subtotalAmount,
        BigDecimal deliveryFee,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String customerNote,
        AddressResponse address,
        List<OrderItemResponse> items,
        OffsetDateTime createdAt
) {
}

