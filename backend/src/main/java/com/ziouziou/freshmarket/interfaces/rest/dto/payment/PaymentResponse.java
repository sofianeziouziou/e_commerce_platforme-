package com.ziouziou.freshmarket.interfaces.rest.dto.payment;

import com.ziouziou.freshmarket.domain.payment.PaymentMethod;
import com.ziouziou.freshmarket.domain.payment.PaymentStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
        Long id,
        Long orderId,
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount,
        OffsetDateTime paidAt
) {
}

