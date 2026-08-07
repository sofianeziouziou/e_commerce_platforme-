package com.ziouziou.freshmarket.application.catalog;

import com.ziouziou.freshmarket.application.exception.BusinessException;
import com.ziouziou.freshmarket.application.exception.ResourceNotFoundException;
import com.ziouziou.freshmarket.application.promotion.PromotionPricingService;
import com.ziouziou.freshmarket.domain.catalog.Category;
import com.ziouziou.freshmarket.domain.catalog.Product;
import com.ziouziou.freshmarket.domain.promotion.Promotion;
import com.ziouziou.freshmarket.domain.store.Store;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.CategoryRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.ProductRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.PromotionRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.StoreRepository;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.CategoryResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductImageResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.common.PageResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.promotion.PromotionResponse;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class CatalogQueryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionPricingService promotionPricingService;
    private final StoreRepository storeRepository;
    private final Long defaultStoreId;

    public CatalogQueryService(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            PromotionRepository promotionRepository,
            PromotionPricingService promotionPricingService,
            StoreRepository storeRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
        this.promotionPricingService = promotionPricingService;
        this.storeRepository = storeRepository;
        this.defaultStoreId = storeRepository.findFirstByActiveTrueOrderByIdAsc()
                .map(Store::getId)
                .orElseThrow(() -> new BusinessException("NO_STORE", "Aucun magasin actif configure."));
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findByStoreIdAndActiveTrueOrderByDisplayOrderAscNameAsc(defaultStoreId)
                .stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    public PageResponse<ProductResponse> getProducts(String search, String categorySlug, Pageable pageable) {
        Page<Product> products;
        if (StringUtils.hasText(search)) {
            products = productRepository.searchByNameUnaccent(defaultStoreId, search.trim(), pageable);
        } else if (StringUtils.hasText(categorySlug)) {
            products = productRepository.findByStoreIdAndActiveTrueAndCategorySlug(defaultStoreId, categorySlug.trim(), pageable);
        } else {
            products = productRepository.findByStoreIdAndActiveTrue(defaultStoreId, pageable);
        }

        java.util.Map<Long, java.math.BigDecimal> promoPrices = promotionPricingService.effectivePrices(
                defaultStoreId, products.getContent(), OffsetDateTime.now());

        return new PageResponse<>(
                products.map(p -> toProductResponse(p, promoPrices.get(p.getId()))).getContent(),
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                products.isFirst(),
                products.isLast()
        );
    }

    public ProductResponse getProduct(String slug) {
        Product product = productRepository.findByStoreIdAndSlug(defaultStoreId, slug)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", slug));
        java.math.BigDecimal promoPrice = promotionPricingService.effectivePrice(
                defaultStoreId, product, OffsetDateTime.now());
        return toProductResponse(product, promoPrice);
    }

    public List<ProductResponse> getFeaturedProducts(Pageable pageable) {
        Page<Product> products = productRepository.findByStoreIdAndActiveTrueAndFeaturedTrue(defaultStoreId, pageable);
        java.util.Map<Long, java.math.BigDecimal> promoPrices = promotionPricingService.effectivePrices(
                defaultStoreId, products.getContent(), OffsetDateTime.now());
        return products.map(p -> toProductResponse(p, promoPrices.get(p.getId()))).getContent();
    }

    public List<ProductResponse> getSimilarProducts(String slug, Pageable pageable) {
        Product product = productRepository.findByStoreIdAndSlug(defaultStoreId, slug)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", slug));

        List<Product> candidates = productRepository.findByStoreIdAndActiveTrueAndCategorySlug(defaultStoreId, product.getCategory().getSlug(), pageable)
                .stream()
                .filter(candidate -> !candidate.getSlug().equals(slug))
                .toList();
        java.util.Map<Long, java.math.BigDecimal> promoPrices = promotionPricingService.effectivePrices(
                defaultStoreId, candidates, OffsetDateTime.now());
        return candidates.stream()
                .map(candidate -> toProductResponse(candidate, promoPrices.get(candidate.getId())))
                .toList();
    }

    public List<PromotionResponse> getActivePromotions() {
        OffsetDateTime now = OffsetDateTime.now();
        return promotionRepository.findByStoreIdAndActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanEqual(defaultStoreId, now, now)
                .stream()
                .map(this::toPromotionResponse)
                .toList();
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.isActive(),
                category.getDisplayOrder()
        );
    }

    private ProductResponse toProductResponse(Product product, java.math.BigDecimal promoPrice) {
        java.math.BigDecimal basePrice = product.getPrice();
        java.math.BigDecimal displayPrice = promoPrice != null ? promoPrice : basePrice;
        java.math.BigDecimal displayOldPrice = promoPrice != null ? basePrice : product.getOldPrice();
        return new ProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBrand(),
                product.getSku(),
                product.getUnitLabel(),
                displayPrice,
                displayOldPrice,
                product.getImageUrl(),
                product.isActive(),
                product.isFeatured(),
                product.getInventory() == null ? null : product.getInventory().getQuantity(),
                product.getImages().stream()
                        .sorted(Comparator.comparingInt(image -> image.getDisplayOrder()))
                        .map(image -> new ProductImageResponse(
                                image.getId(),
                                image.getImageUrl(),
                                image.getAltText(),
                                image.getDisplayOrder()
                        ))
                        .toList()
        );
    }

    private PromotionResponse toPromotionResponse(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getName(),
                promotion.getDescription(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getStartsAt(),
                promotion.getEndsAt(),
                promotion.isActive(),
                promotion.getProducts().stream().map(Product::getId).collect(java.util.stream.Collectors.toSet())
        );
    }
}
