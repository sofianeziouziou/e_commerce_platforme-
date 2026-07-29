package com.ziouziou.freshmarket.interfaces.rest.dto.customer;

import java.math.BigDecimal;

public record AddressResponse(
        Long id,
        String label,
        String recipientName,
        String phoneNumber,
        String streetLine,
        String city,
        String governorate,
        String postalCode,
        BigDecimal latitude,
        BigDecimal longitude,
        boolean defaultAddress
) {
}

