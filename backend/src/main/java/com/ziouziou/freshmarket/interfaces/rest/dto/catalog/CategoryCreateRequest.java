package com.ziouziou.freshmarket.interfaces.rest.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
        @NotBlank
        @Size(max = 120)
        String name,

        @Size(max = 500)
        String imageUrl,

        String description,

        int displayOrder
) {
}

