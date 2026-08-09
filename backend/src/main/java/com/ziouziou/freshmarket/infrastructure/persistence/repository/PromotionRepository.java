package com.ziouziou.freshmarket.infrastructure.persistence.repository;

import com.ziouziou.freshmarket.domain.promotion.Promotion;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByStoreIdAndActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanEqual(
            Long storeId,
            OffsetDateTime startsAt,
            OffsetDateTime endsAt
    );
}

