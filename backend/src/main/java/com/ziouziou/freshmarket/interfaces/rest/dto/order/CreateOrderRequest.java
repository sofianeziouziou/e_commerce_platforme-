package com.ziouziou.freshmarket.interfaces.rest.dto.order;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotNull
        Long addressId,

        @Size(max = 1000)
        String customerNote
) {
}

