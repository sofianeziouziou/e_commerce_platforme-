package com.ziouziou.freshmarket.interfaces.rest.dto.catalog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateInventoryRequest(
        @NotNull
        @DecimalMin(value = "0.000")
        BigDecimal quantity,

        @NotNull
        @DecimalMin(value = "0.000")
        BigDecimal lowStockThreshold
) {
}

