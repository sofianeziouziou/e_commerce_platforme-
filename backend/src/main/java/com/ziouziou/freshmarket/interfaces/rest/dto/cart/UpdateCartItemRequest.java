package com.ziouziou.freshmarket.interfaces.rest.dto.cart;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateCartItemRequest(
        @NotNull
        @DecimalMin(value = "0.001")
        BigDecimal quantity
) {
}

