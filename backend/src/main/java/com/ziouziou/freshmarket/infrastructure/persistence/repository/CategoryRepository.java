package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.catalog.Category;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByStoreIdAndActiveTrueOrderByDisplayOrderAscNameAsc(Long storeId);
}

