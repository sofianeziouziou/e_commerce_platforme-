package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.application.admin.AdminService;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.CategoryCreateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.CategoryUpdateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductCreateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductUpdateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.UpdateInventoryRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.UpdateOrderStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public Object dashboard(@AuthenticationPrincipal Jwt jwt) {
        return adminService.getDashboardSummary(getUserId(jwt));
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> categories(@AuthenticationPrincipal Jwt jwt) {
        return adminService.getCategories(getUserId(jwt));
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createCategory(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CategoryCreateRequest request) {
        return adminService.createCategory(getUserId(jwt), request);
    }

    @PutMapping("/categories/{id}")
    public Map<String, Object> updateCategory(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody CategoryUpdateRequest request) {
        return adminService.updateCategory(getUserId(jwt), id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        adminService.deleteCategory(getUserId(jwt), id);
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return adminService.getProducts(getUserId(jwt), search, page, Math.min(size, 100));
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createProduct(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProductCreateRequest request) {
        return adminService.createProduct(getUserId(jwt), request);
    }

    @PutMapping("/products/{id}")
    public Map<String, Object> updateProduct(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
        return adminService.updateProduct(getUserId(jwt), id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        adminService.deleteProduct(getUserId(jwt), id);
    }

    @PutMapping("/products/{id}/inventory")
    public void updateInventory(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody UpdateInventoryRequest request) {
        adminService.updateInventory(getUserId(jwt), id, request);
    }

    @GetMapping("/orders/{id}")
    public Map<String, Object> orderDetail(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return adminService.getOrderDetail(getUserId(jwt), id);
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> orders(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return adminService.getOrders(getUserId(jwt), status, page, Math.min(size, 100));
    }

    @PutMapping("/orders/{id}/status")
    public Map<String, Object> updateOrderStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return adminService.updateOrderStatus(getUserId(jwt), id, request);
    }

    @GetMapping("/promotions")
    public List<Map<String, Object>> promotions(@AuthenticationPrincipal Jwt jwt) {
        return adminService.getPromotions(getUserId(jwt));
    }

    @GetMapping("/customers")
    public List<Map<String, Object>> customers(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return adminService.getCustomers(getUserId(jwt), search, page, Math.min(size, 100));
    }

    @GetMapping("/notifications/count")
    public Map<String, Long> notificationCount(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("count", adminService.getNotificationCount(getUserId(jwt)));
    }

    private Long getUserId(Jwt jwt) {
        return jwt.getClaim("userId");
    }
}
