package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.application.order.OrderService;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.CreateOrderRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.OrderResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(getUserId(jwt), request);
    }

    @GetMapping
    public List<OrderResponse> getOrders(@AuthenticationPrincipal Jwt jwt,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        return orderService.getOrders(getUserId(jwt), page, Math.min(size, 50));
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrder(@AuthenticationPrincipal Jwt jwt, @PathVariable Long orderId) {
        return orderService.getOrder(getUserId(jwt), orderId);
    }

    private Long getUserId(Jwt jwt) {
        return jwt.getClaim("userId");
    }
}
