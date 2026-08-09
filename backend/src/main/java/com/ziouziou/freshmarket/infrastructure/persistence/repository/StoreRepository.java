package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.store.Store;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    Optional<Store> findFirstByActiveTrueOrderByIdAsc();
}
