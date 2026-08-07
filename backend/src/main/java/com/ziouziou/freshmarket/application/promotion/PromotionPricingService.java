package com.ziouziou.freshmarket.application.promotion;

import com.ziouziou.freshmarket.domain.catalog.Product;
import com.ziouziou.freshmarket.domain.promotion.DiscountType;
import com.ziouziou.freshmarket.domain.promotion.Promotion;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.PromotionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PromotionPricingService {

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("5.000");
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final PromotionRepository promotionRepository;

    public PromotionPricingService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    /**
     * Effective (promo) price for a single product, or {@code null} when no active
     * promotion applies. The stored price is never modified.
     */
    public BigDecimal effectivePrice(Long storeId, Product product, OffsetDateTime now) {
        List<Promotion> active = activePromotions(storeId, now);
        return applyBestDiscount(product, active);
    }

    /**
     * Builds a map of productId -> effective price for the given products. Only
     * products with an applicable active promotion are present in the result.
     */
    public Map<Long, BigDecimal> effectivePrices(Long storeId, Collection<Product> products, OffsetDateTime now) {
        List<Promotion> active = activePromotions(storeId, now);
        Map<Long, BigDecimal> result = new HashMap<>();
        for (Product product : products) {
            BigDecimal effective = applyBestDiscount(product, active);
            if (effective != null) {
                result.put(product.getId(), effective);
            }
        }
        return result;
    }

    public BigDecimal deliveryFee() {
        return DELIVERY_FEE;
    }

    private List<Promotion> activePromotions(Long storeId, OffsetDateTime now) {
        return promotionRepository.findByStoreIdAndActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanEqual(
                storeId, now, now);
    }

    private BigDecimal applyBestDiscount(Product product, List<Promotion> active) {
        BigDecimal base = product.getPrice();
        if (base == null) {
            return null;
        }
        BigDecimal bestEffective = null;
        BigDecimal bestReduction = BigDecimal.ZERO;
        for (Promotion promotion : active) {
            if (!appliesTo(promotion, product)) {
                continue;
            }
            BigDecimal effective;
            if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
                BigDecimal factor = BigDecimal.ONE.subtract(
                        promotion.getDiscountValue().divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP));
                effective = base.multiply(factor).setScale(3, RoundingMode.HALF_UP);
            } else {
                effective = base.subtract(promotion.getDiscountValue()).setScale(3, RoundingMode.HALF_UP);
            }
            if (effective.compareTo(BigDecimal.ZERO) < 0) {
                effective = BigDecimal.ZERO;
            }
            BigDecimal reduction = base.subtract(effective);
            if (reduction.compareTo(bestReduction) > 0) {
                bestReduction = reduction;
                bestEffective = effective;
            }
        }
        return bestEffective;
    }

    private boolean appliesTo(Promotion promotion, Product product) {
        for (Product linked : promotion.getProducts()) {
            if (linked.getId().equals(product.getId())) {
                return true;
            }
        }
        return false;
    }
}
