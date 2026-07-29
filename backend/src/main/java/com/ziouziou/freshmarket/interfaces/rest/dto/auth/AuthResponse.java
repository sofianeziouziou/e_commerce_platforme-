package com.ziouziou.freshmarket.interfaces.rest.dto.auth;

import java.time.OffsetDateTime;
import java.util.Set;

public record AuthResponse(
        String accessToken,
        String tokenType,
        OffsetDateTime expiresAt,
        UserSummaryResponse user
) {
    public AuthResponse(String accessToken, OffsetDateTime expiresAt, UserSummaryResponse user) {
        this(accessToken, "Bearer", expiresAt, user);
    }

    public record UserSummaryResponse(
            Long id,
            String email,
            String firstName,
            String lastName,
            String phoneNumber,
            Set<String> roles
    ) {
    }
}

