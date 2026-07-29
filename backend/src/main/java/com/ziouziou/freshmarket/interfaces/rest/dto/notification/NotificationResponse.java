package com.ziouziou.freshmarket.interfaces.rest.dto.notification;

import com.ziouziou.freshmarket.domain.notification.NotificationType;
import java.time.OffsetDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        NotificationType type,
        boolean read,
        OffsetDateTime readAt,
        OffsetDateTime createdAt
) {
}

