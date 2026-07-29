package com.ziouziou.freshmarket.interfaces.rest.dto.order;

import com.ziouziou.freshmarket.domain.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull
        OrderStatus status
) {
}

