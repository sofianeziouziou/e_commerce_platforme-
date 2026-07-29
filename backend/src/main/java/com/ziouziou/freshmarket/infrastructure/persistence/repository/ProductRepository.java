package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.catalog.Product;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findByStoreIdAndSlug(Long storeId, String slug);

    boolean existsBySlug(String slug);

    boolean existsBySku(String sku);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByStoreIdAndActiveTrue(Long storeId, Pageable pageable);

    Page<Product> findByActiveTrueAndCategorySlug(String categorySlug, Pageable pageable);

    Page<Product> findByStoreIdAndActiveTrueAndCategorySlug(Long storeId, String categorySlug, Pageable pageable);

    Page<Product> findByActiveTrueAndNameContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Product> findByStoreIdAndActiveTrueAndNameContainingIgnoreCase(Long storeId, String keyword, Pageable pageable);

    Page<Product> findByActiveTrueAndFeaturedTrue(Pageable pageable);

    Page<Product> findByStoreIdAndActiveTrueAndFeaturedTrue(Long storeId, Pageable pageable);
}

