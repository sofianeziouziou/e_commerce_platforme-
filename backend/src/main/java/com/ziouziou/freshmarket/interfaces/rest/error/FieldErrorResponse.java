package com.ziouziou.freshmarket.interfaces.rest.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}

