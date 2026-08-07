package com.ziouziou.freshmarket.application.cart;

import com.ziouziou.freshmarket.application.promotion.PromotionPricingService;
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
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PromotionPricingService promotionPricingService;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       CustomerRepository customerRepository, ProductRepository productRepository,
                       PromotionPricingService promotionPricingService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.promotionPricingService = promotionPricingService;
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

        if (!product.isActive()) {
            throw new com.ziouziou.freshmarket.application.exception.BusinessException(
                    "PRODUCT_INACTIVE", "Ce produit n'est plus disponible.");
        }

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
        requireOwnership(userId, item);
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return toResponse(item.getCart());
    }

    public CartResponse removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Article introuvable"));
        requireOwnership(userId, item);
        Cart cart = item.getCart();
        cartItemRepository.delete(item);
        return toResponse(cart);
    }

    private void requireOwnership(Long userId, CartItem item) {
        Long ownerCustomerId = item.getCart().getCustomer().getId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        if (!ownerCustomerId.equals(customer.getId())) {
            throw new com.ziouziou.freshmarket.application.exception.BusinessException(
                    "FORBIDDEN", "Acces refuse a cet article.");
        }
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
        OffsetDateTime now = OffsetDateTime.now();
        BigDecimal deliveryFee = promotionPricingService.deliveryFee();

        if (items.isEmpty()) {
            return new CartResponse(cart.getId(), List.of(), BigDecimal.ZERO, deliveryFee, BigDecimal.ZERO, deliveryFee);
        }

        Long storeId = items.get(0).getProduct().getStore().getId();
        List<Product> products = items.stream().map(CartItem::getProduct).toList();
        Map<Long, BigDecimal> promoPrices = promotionPricingService.effectivePrices(storeId, products, now);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountedSubtotal = BigDecimal.ZERO;
        List<CartItemResponse> itemResponses = new ArrayList<>();
        for (CartItem item : items) {
            Product product = item.getProduct();
            BigDecimal basePrice = product.getPrice();
            BigDecimal unitPrice = promoPrices.getOrDefault(product.getId(), basePrice);
            BigDecimal lineTotal = unitPrice.multiply(item.getQuantity()).setScale(3, RoundingMode.HALF_UP);
            subtotal = subtotal.add(basePrice.multiply(item.getQuantity())).setScale(3, RoundingMode.HALF_UP);
            discountedSubtotal = discountedSubtotal.add(lineTotal);
            itemResponses.add(new CartItemResponse(item.getId(), product.getId(), product.getName(),
                    product.getImageUrl(), product.getUnitLabel(), unitPrice, item.getQuantity(), lineTotal));
        }

        BigDecimal discountAmount = subtotal.subtract(discountedSubtotal).max(BigDecimal.ZERO);
        BigDecimal totalAmount = discountedSubtotal.add(deliveryFee);
        return new CartResponse(cart.getId(), itemResponses, subtotal, deliveryFee, discountAmount, totalAmount);
    }
}
