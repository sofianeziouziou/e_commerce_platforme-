package com.ziouziou.freshmarket.interfaces.rest.error;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiErrorResponse(
        String code,
        String message,
        String path,
        OffsetDateTime timestamp,
        List<FieldErrorResponse> fieldErrors
) {
    public static ApiErrorResponse of(String code, String message, String path) {
        return new ApiErrorResponse(code, message, path, OffsetDateTime.now(), List.of());
    }

    public static ApiErrorResponse withFields(
            String code,
            String message,
            String path,
            List<FieldErrorResponse> fieldErrors
    ) {
        return new ApiErrorResponse(code, message, path, OffsetDateTime.now(), fieldErrors);
    }
}

