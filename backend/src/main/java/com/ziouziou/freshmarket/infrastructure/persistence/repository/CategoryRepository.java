package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.catalog.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    Optional<Category> findByStoreIdAndSlug(Long storeId, String slug);

    boolean existsBySlug(String slug);

    boolean existsByStoreIdAndSlug(Long storeId, String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByStoreIdAndNameIgnoreCase(Long storeId, String name);

    List<Category> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    List<Category> findByStoreIdAndActiveTrueOrderByDisplayOrderAscNameAsc(Long storeId);
}

