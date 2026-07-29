package com.ziouziou.freshmarket.interfaces.rest.dto;

import java.time.OffsetDateTime;

public record HealthResponse(String status, OffsetDateTime timestamp) {
}

