package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.application.cart.CartService;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.AddCartItemRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.CartResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.UpdateCartItemRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.getCart(getUserId(jwt));
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse addItem(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(getUserId(jwt), request);
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(@AuthenticationPrincipal Jwt jwt, @PathVariable Long itemId,
                                   @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(getUserId(jwt), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(@AuthenticationPrincipal Jwt jwt, @PathVariable Long itemId) {
        return cartService.removeItem(getUserId(jwt), itemId);
    }

    @DeleteMapping
    public void clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(getUserId(jwt));
    }

    private Long getUserId(Jwt jwt) {
        return jwt.getClaim("userId");
    }
}
