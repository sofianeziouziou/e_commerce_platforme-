package com.ziouziou.freshmarket.application.cart;

import com.ziouziou.freshmarket.domain.cart.Cart;
import com.ziouziou.freshmarket.domain.cart.CartItem;
import com.ziouziou.freshmarket.domain.catalog.Product;
import com.ziouziou.freshmarket.domain.customer.Customer;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.CartItemRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.CartRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.CustomerRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.ProductRepository;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.AddCartItemRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.CartItemResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.CartResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.cart.UpdateCartItemRequest;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       CustomerRepository customerRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CartResponse getCart(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> cartRepository.save(new Cart(customer)));
        return toResponse(cart);
    }

    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> cartRepository.save(new Cart(customer)));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new EntityNotFoundException("Produit introuvable"));

        cartItemRepository.findByCartIdAndProductId(cart.getId(), request.productId())
                .ifPresentOrElse(
                        item -> {
                            item.setQuantity(item.getQuantity().add(request.quantity()));
                            cartItemRepository.save(item);
                        },
                        () -> cartItemRepository.save(new CartItem(cart, product, request.quantity()))
                );

        return toResponse(cart);
    }

    public CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Article introuvable"));
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return toResponse(item.getCart());
    }

    public CartResponse removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Article introuvable"));
        Cart cart = item.getCart();
        cartItemRepository.delete(item);
        return toResponse(cart);
    }

    public void clearCart(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        cartRepository.findByCustomerId(customer.getId()).ifPresent(cart -> {
            cartItemRepository.findByCartId(cart.getId()).forEach(cartItemRepository::delete);
        });
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        BigDecimal subtotal = items.stream()
                .map(i -> i.getProduct().getPrice().multiply(i.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<CartItemResponse> itemResponses = items.stream()
                .map(i -> new CartItemResponse(i.getId(), i.getProduct().getId(), i.getProduct().getName(),
                        i.getProduct().getImageUrl(), i.getProduct().getUnitLabel(),
                        i.getProduct().getPrice(), i.getQuantity(),
                        i.getProduct().getPrice().multiply(i.getQuantity())))
                .toList();
        return new CartResponse(cart.getId(), itemResponses, subtotal);
    }
}
