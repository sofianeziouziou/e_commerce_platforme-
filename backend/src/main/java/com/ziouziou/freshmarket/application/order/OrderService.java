package com.ziouziou.freshmarket.application.order;

import com.ziouziou.freshmarket.application.exception.BusinessException;
import com.ziouziou.freshmarket.domain.cart.Cart;
import com.ziouziou.freshmarket.domain.cart.CartItem;
import com.ziouziou.freshmarket.domain.catalog.Product;
import com.ziouziou.freshmarket.domain.customer.Address;
import com.ziouziou.freshmarket.domain.customer.Customer;
import com.ziouziou.freshmarket.domain.order.Order;
import com.ziouziou.freshmarket.domain.order.OrderItem;
import com.ziouziou.freshmarket.domain.store.Store;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.*;
import com.ziouziou.freshmarket.interfaces.rest.dto.customer.AddressResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.CreateOrderRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.OrderItemResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.OrderResponse;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {

    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;
    private final StoreRepository storeRepository;

    public OrderService(CustomerRepository customerRepository, CartRepository cartRepository,
                        CartItemRepository cartItemRepository, OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository, AddressRepository addressRepository,
                        StoreRepository storeRepository) {
        this.customerRepository = customerRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.addressRepository = addressRepository;
        this.storeRepository = storeRepository;
    }

    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BusinessException("CART_EMPTY", "Votre panier est vide."));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BusinessException("CART_EMPTY", "Votre panier est vide.");
        }

        Address address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new EntityNotFoundException("Adresse introuvable"));

        List<Store> stores = storeRepository.findAll();
        if (stores.isEmpty()) {
            throw new BusinessException("NO_STORE", "Aucun magasin disponible.");
        }
        Store store = stores.get(0);

        String orderNumber = "CMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        while (orderRepository.existsByOrderNumber(orderNumber)) {
            orderNumber = "CMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        BigDecimal deliveryFee = new BigDecimal("5.000");
        BigDecimal subtotal = cartItems.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(ci.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = subtotal.add(deliveryFee);

        Order order = new Order(customer, store, address, orderNumber,
                subtotal, deliveryFee, BigDecimal.ZERO, total, request.customerNote());

        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            BigDecimal lineTotal = product.getPrice().multiply(ci.getQuantity());
            OrderItem item = new OrderItem(product, product.getName(), product.getUnitLabel(),
                    product.getPrice(), ci.getQuantity(), lineTotal);
            order.addItem(item);
        }

        order = orderRepository.save(order);

        cartItemRepository.findByCartId(cart.getId()).forEach(cartItemRepository::delete);

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Long userId, int page, int size) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        Page<Order> orders = orderRepository.findByCustomerId(customer.getId(), PageRequest.of(page, size));
        return orders.map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long orderId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Commande introuvable"));
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new BusinessException("FORBIDDEN", "Cette commande ne vous appartient pas.");
        }
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        Address addr = order.getAddress();
        AddressResponse addressResponse = addr != null ? new AddressResponse(
                addr.getId(), "", addr.getRecipientName(), addr.getPhoneNumber(),
                addr.getStreetLine(), addr.getCity(), addr.getGovernorate(),
                addr.getPostalCode(), addr.getLatitude(), addr.getLongitude(), false
        ) : null;

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemResponse> itemResponses = items.stream()
                .map(i -> new OrderItemResponse(i.getId(), i.getProduct() != null ? i.getProduct().getId() : null,
                        i.getProductName(), i.getUnitLabel(), i.getUnitPrice(), i.getQuantity(), i.getLineTotal(),
                        i.getProduct() != null ? i.getProduct().getImageUrl() : null))
                .toList();

        return new OrderResponse(order.getId(), order.getOrderNumber(), order.getStatus(),
                order.getSubtotalAmount(), order.getDeliveryFee(), order.getDiscountAmount(),
                order.getTotalAmount(), order.getCustomerNote(), addressResponse,
                itemResponses, order.getCreatedAt());
    }
}
