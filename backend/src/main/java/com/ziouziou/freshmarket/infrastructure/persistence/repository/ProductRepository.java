package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.catalog.Product;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByStoreIdAndSlug(Long storeId, String slug);

    Page<Product> findByStoreIdAndActiveTrue(Long storeId, Pageable pageable);

    Page<Product> findByStoreIdAndActiveTrueAndCategorySlug(Long storeId, String categorySlug, Pageable pageable);

    @Query(value = """
            SELECT p.* FROM products p
            WHERE p.store_id = :storeId AND p.active = true
              AND unaccent(lower(p.name)) LIKE '%' || unaccent(lower(:keyword)) || '%'
            """, countQuery = """
            SELECT count(*) FROM products p
            WHERE p.store_id = :storeId AND p.active = true
              AND unaccent(lower(p.name)) LIKE '%' || unaccent(lower(:keyword)) || '%'
            """, nativeQuery = true)
    Page<Product> searchByNameUnaccent(@Param("storeId") Long storeId, @Param("keyword") String keyword, Pageable pageable);

    Page<Product> findByStoreIdAndActiveTrueAndFeaturedTrue(Long storeId, Pageable pageable);
}

