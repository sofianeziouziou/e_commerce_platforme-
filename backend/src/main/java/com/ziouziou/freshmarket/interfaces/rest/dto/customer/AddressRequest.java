package com.ziouziou.freshmarket.interfaces.rest.dto.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AddressRequest(
        @NotBlank
        @Size(max = 80)
        String label,

        @NotBlank
        @Size(max = 160)
        String recipientName,

        @NotBlank
        @Size(max = 30)
        String phoneNumber,

        @NotBlank
        @Size(max = 255)
        String streetLine,

        @NotBlank
        @Size(max = 120)
        String city,

        @NotBlank
        @Size(max = 120)
        String governorate,

        @Size(max = 20)
        String postalCode,

        BigDecimal latitude,
        BigDecimal longitude,
        boolean defaultAddress
) {
}

