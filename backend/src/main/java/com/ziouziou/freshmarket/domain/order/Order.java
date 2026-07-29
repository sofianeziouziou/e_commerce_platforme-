package com.ziouziou.freshmarket.domain.order;

import com.ziouziou.freshmarket.domain.common.BaseEntity;
import com.ziouziou.freshmarket.domain.customer.Address;
import com.ziouziou.freshmarket.domain.customer.Customer;
import com.ziouziou.freshmarket.domain.store.Store;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Column(name = "order_number", nullable = false, unique = true, length = 40)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private OrderStatus status = OrderStatus.EN_ATTENTE;

    @Column(name = "subtotal_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal subtotalAmount;

    @Column(name = "delivery_fee", nullable = false, precision = 12, scale = 3)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal totalAmount;

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected Order() {
    }

    public Order(Customer customer, Store store, Address address, String orderNumber,
                 BigDecimal subtotalAmount, BigDecimal deliveryFee, BigDecimal discountAmount,
                 BigDecimal totalAmount, String customerNote) {
        this.customer = customer;
        this.store = store;
        this.address = address;
        this.orderNumber = orderNumber;
        this.status = OrderStatus.EN_ATTENTE;
        this.subtotalAmount = subtotalAmount;
        this.deliveryFee = deliveryFee;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
        this.customerNote = customerNote;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Store getStore() {
        return store;
    }

    public Address getAddress() {
        return address;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getSubtotalAmount() {
        return subtotalAmount;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getCustomerNote() {
        return customerNote;
    }

    public List<OrderItem> getItems() {
        return items;
    }
}

