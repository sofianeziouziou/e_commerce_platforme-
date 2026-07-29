package com.ziouziou.freshmarket.interfaces.rest.dto.promotion;

import com.ziouziou.freshmarket.domain.promotion.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

public record PromotionRequest(
        @NotBlank
        @Size(max = 160)
        String name,

        String description,

        @NotNull
        DiscountType discountType,

        @NotNull
        @DecimalMin(value = "0.001")
        BigDecimal discountValue,

        @NotNull
        OffsetDateTime startsAt,

        @NotNull
        OffsetDateTime endsAt,

        boolean active,
        Set<Long> productIds
) {
}

