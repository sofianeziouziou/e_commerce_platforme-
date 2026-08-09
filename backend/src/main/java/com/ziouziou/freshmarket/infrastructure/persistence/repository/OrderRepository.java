package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    boolean existsByAddressId(Long addressId);

    boolean existsByOrderNumber(String orderNumber);
}

