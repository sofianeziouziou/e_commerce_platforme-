package com.ziouziou.freshmarket.interfaces.rest.dto.payment;

import com.ziouziou.freshmarket.domain.payment.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePaymentStatusRequest(
        @NotNull
        PaymentStatus status
) {
}

