package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.application.catalog.CatalogQueryService;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.CategoryResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.common.PageResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.promotion.PromotionResponse;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalog")
public class CatalogController {

    private final CatalogQueryService catalogQueryService;

    public CatalogController(CatalogQueryService catalogQueryService) {
        this.catalogQueryService = catalogQueryService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return catalogQueryService.getCategories();
    }

    @GetMapping("/products")
    public PageResponse<ProductResponse> products(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "48") int size,
            @RequestParam(defaultValue = "featured") String sort
    ) {
        return catalogQueryService.getProducts(search, category, PageRequest.of(page, Math.min(size, 96), resolveSort(sort)));
    }

    @GetMapping("/products/featured")
    public List<ProductResponse> featuredProducts(@RequestParam(defaultValue = "12") int size) {
        return catalogQueryService.getFeaturedProducts(PageRequest.of(0, Math.min(size, 24), resolveSort("featured")));
    }

    @GetMapping("/products/{slug}")
    public ProductResponse product(@PathVariable String slug) {
        return catalogQueryService.getProduct(slug);
    }

    @GetMapping("/products/{slug}/similar")
    public List<ProductResponse> similarProducts(@PathVariable String slug, @RequestParam(defaultValue = "8") int size) {
        Pageable pageable = PageRequest.of(0, Math.min(size + 1, 16), Sort.by("featured").descending().and(Sort.by("name")));
        return catalogQueryService.getSimilarProducts(slug, pageable);
    }

    @GetMapping("/promotions")
    public List<PromotionResponse> promotions() {
        return catalogQueryService.getActivePromotions();
    }

    private Sort resolveSort(String sort) {
        return switch (sort) {
            case "price-asc" -> Sort.by("price").ascending();
            case "price-desc" -> Sort.by("price").descending();
            case "name" -> Sort.by("name").ascending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("featured").descending().and(Sort.by("name").ascending());
        };
    }
}
