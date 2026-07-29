package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.domain.notification.Notification;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.NotificationRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Notification> getNotifications(@AuthenticationPrincipal Jwt jwt,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(getUserId(jwt), PageRequest.of(page, Math.min(size, 50)))
                .getContent();
    }

    @GetMapping("/unread-count")
    public long unreadCount(@AuthenticationPrincipal Jwt jwt) {
        return notificationRepository.countByUserIdAndReadAtIsNull(getUserId(jwt));
    }

    @PutMapping("/read-all")
    public void markAllRead(@AuthenticationPrincipal Jwt jwt) {
        var notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(getUserId(jwt), PageRequest.of(0, 100))
                .getContent();
        var now = java.time.OffsetDateTime.now();
        notifications.stream()
                .filter(n -> n.getReadAt() == null)
                .forEach(n -> n.setReadAt(now));
        notificationRepository.saveAll(notifications);
    }

    private Long getUserId(Jwt jwt) {
        return jwt.getClaim("userId");
    }
}
