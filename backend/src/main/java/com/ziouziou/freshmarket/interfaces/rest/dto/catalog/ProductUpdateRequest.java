package com.ziouziou.freshmarket.interfaces.rest.dto.catalog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductUpdateRequest(
        @NotNull
        Long categoryId,

        @NotBlank
        @Size(max = 180)
        String name,

        String description,

        @Size(max = 120)
        String brand,

        @Size(max = 80)
        String sku,

        @NotBlank
        @Size(max = 40)
        String unitLabel,

        @NotNull
        @DecimalMin(value = "0.000")
        BigDecimal price,

        @DecimalMin(value = "0.000")
        BigDecimal oldPrice,

        @Size(max = 500)
        String imageUrl,

        boolean active,
        boolean featured
) {
}

