package com.ziouziou.freshmarket.application.admin;

import com.ziouziou.freshmarket.application.exception.BusinessException;
import com.ziouziou.freshmarket.domain.notification.NotificationService;
import com.ziouziou.freshmarket.domain.notification.NotificationType;
import com.ziouziou.freshmarket.interfaces.rest.dto.admin.DashboardSummaryResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.CategoryCreateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.CategoryUpdateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductCreateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.ProductUpdateRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.catalog.UpdateInventoryRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.order.UpdateOrderStatusRequest;
import java.util.List;
import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminService {

    private final JdbcTemplate jdbcTemplate;
    private final NotificationService notificationService;

    public AdminService(JdbcTemplate jdbcTemplate, NotificationService notificationService) {
        this.jdbcTemplate = jdbcTemplate;
        this.notificationService = notificationService;
    }

    public Long resolveStoreId(Long userId) {
        Long storeId = jdbcTemplate.query(
                "SELECT store_id FROM admin_profiles WHERE user_id = ?",
                rs -> rs.next() ? rs.getLong("store_id") : null,
                userId
        );
        if (storeId == null) {
            throw new BusinessException("NOT_ADMIN", "Acces refuse.");
        }
        return storeId;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        Long storeId = resolveStoreId(userId);
        return jdbcTemplate.query("""
                SELECT
                    (SELECT COUNT(*) FROM products WHERE store_id = ?) AS totalProducts,
                    (SELECT COUNT(*) FROM products WHERE store_id = ? AND active = TRUE) AS activeProducts,
                    (SELECT COUNT(*) FROM inventory i JOIN products p ON p.id = i.product_id WHERE p.store_id = ? AND i.quantity <= i.low_stock_threshold) AS lowStockProducts,
                    (SELECT COUNT(*) FROM orders WHERE store_id = ? AND status = 'PENDING') AS pendingOrders,
                    (SELECT COUNT(*) FROM orders WHERE store_id = ? AND status = 'DELIVERED') AS deliveredOrders,
                    (SELECT COUNT(*) FROM orders WHERE store_id = ? AND created_at::date = CURRENT_DATE) AS todayOrders,
                    (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE store_id = ?) AS totalCustomers,
                    (SELECT COUNT(*) FROM promotions WHERE store_id = ? AND active = TRUE AND CURRENT_TIMESTAMP BETWEEN starts_at AND ends_at) AS activePromotions,
                    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE store_id = ? AND status = 'DELIVERED') AS totalRevenue
                """, rs -> {
            if (rs.next()) return new DashboardSummaryResponse(
                    rs.getLong("totalProducts"), rs.getLong("activeProducts"),
                    rs.getLong("lowStockProducts"), rs.getLong("pendingOrders"),
                    rs.getLong("deliveredOrders"), rs.getLong("todayOrders"),
                    rs.getLong("totalCustomers"), rs.getLong("activePromotions"),
                    rs.getBigDecimal("totalRevenue"));
            throw new BusinessException("DASHBOARD_ERROR", "Impossible de generer le tableau de bord.");
        }, storeId, storeId, storeId, storeId, storeId, storeId, storeId, storeId, storeId);
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getCategories(Long userId) {
        Long storeId = resolveStoreId(userId);
        return jdbcTemplate.query("""
                SELECT id, name, slug, description, image_url, active, display_order, created_at
                FROM categories WHERE store_id = ? ORDER BY display_order ASC, name ASC
                """, (rs, rowNum) -> new java.util.HashMap<>(java.util.Map.of(
                "id", rs.getLong("id"),
                "name", rs.getString("name"),
                "slug", rs.getString("slug"),
                "description", rs.getString("description"),
                "imageUrl", rs.getString("image_url"),
                "active", rs.getBoolean("active"),
                "displayOrder", rs.getInt("display_order")
        )), storeId);
    }

    public java.util.Map<String, Object> createCategory(Long userId, CategoryCreateRequest request) {
        Long storeId = resolveStoreId(userId);
        String slug = slugify(request.name());
        Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM categories WHERE store_id = ? AND slug = ?",
                Integer.class, storeId, slug);
        if (exists != null && exists > 0) {
            throw new BusinessException("SLUG_EXISTS", "Une categorie avec ce nom existe deja.");
        }
        Long id = insertAndReturnId("""
                INSERT INTO categories (store_id, name, slug, description, image_url, display_order)
                VALUES (?, ?, ?, ?, ?, ?)
                """, storeId, request.name(), slug, request.description(), request.imageUrl(), request.displayOrder());
        return categoryMap(id, storeId, request.name(), slug, request.description(), request.imageUrl(), true, request.displayOrder());
    }

    public java.util.Map<String, Object> updateCategory(Long userId, Long categoryId, CategoryUpdateRequest request) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("categories", categoryId, storeId, "Categorie");
        jdbcTemplate.update("""
                UPDATE categories SET name = ?, description = ?, image_url = ?, active = ?, display_order = ?
                WHERE id = ?
                """, request.name(), request.description(), request.imageUrl(), request.active(), request.displayOrder(), categoryId);
        return categoryMap(categoryId, storeId, request.name(), null, request.description(), request.imageUrl(), request.active(), request.displayOrder());
    }

    public void deleteCategory(Long userId, Long categoryId) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("categories", categoryId, storeId, "Categorie");
        jdbcTemplate.update("DELETE FROM categories WHERE id = ?", categoryId);
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getProducts(Long userId, String search, int page, int size) {
        Long storeId = resolveStoreId(userId);
        int offset = page * size;
        if (search != null && !search.isBlank()) {
            return jdbcTemplate.query("""
                    SELECT p.id, p.name, p.slug, p.description, p.brand, p.sku, p.unit_label,
                           p.price, p.old_price, p.image_url, p.active, p.featured,
                           c.name AS category_name, i.quantity AS stock,
                           p.created_at, p.updated_at
                    FROM products p
                    JOIN categories c ON c.id = p.category_id
                    LEFT JOIN inventory i ON i.product_id = p.id
                    WHERE p.store_id = ? AND LOWER(p.name) LIKE LOWER(?)
                    ORDER BY p.created_at DESC LIMIT ? OFFSET ?
                    """, (rs, rowNum) -> productMap(rs), storeId, "%" + search + "%", size, offset);
        }
        return jdbcTemplate.query("""
                SELECT p.id, p.name, p.slug, p.description, p.brand, p.sku, p.unit_label,
                       p.price, p.old_price, p.image_url, p.active, p.featured,
                       c.name AS category_name, i.quantity AS stock,
                       p.created_at, p.updated_at
                FROM products p
                JOIN categories c ON c.id = p.category_id
                LEFT JOIN inventory i ON i.product_id = p.id
                WHERE p.store_id = ?
                ORDER BY p.created_at DESC LIMIT ? OFFSET ?
                """, (rs, rowNum) -> productMap(rs), storeId, size, offset);
    }

    public java.util.Map<String, Object> createProduct(Long userId, ProductCreateRequest request) {
        Long storeId = resolveStoreId(userId);
        verifyCategoryStore(storeId, request.categoryId());
        String slug = slugify(request.name());
        Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE store_id = ? AND slug = ?",
                Integer.class, storeId, slug);
        if (exists != null && exists > 0) {
            throw new BusinessException("SLUG_EXISTS", "Un produit avec ce nom existe deja.");
        }
        Long productId = insertAndReturnId("""
                INSERT INTO products (store_id, category_id, name, slug, description, brand, sku, unit_label, price, old_price, image_url, active, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
                """, storeId, request.categoryId(), request.name(), slug,
                request.description(), request.brand(), request.sku(),
                request.unitLabel(), request.price(), request.oldPrice(),
                request.imageUrl(), request.featured());
        if (request.initialQuantity() != null) {
            jdbcTemplate.update("INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES (?, ?, 5)",
                    productId, request.initialQuantity());
        }
        return productMapFromDb(productId);
    }

    public java.util.Map<String, Object> updateProduct(Long userId, Long productId, ProductUpdateRequest request) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("products", productId, storeId, "Produit");
        verifyCategoryStore(storeId, request.categoryId());
        jdbcTemplate.update("""
                UPDATE products SET category_id = ?, name = ?, description = ?, brand = ?, sku = ?,
                    unit_label = ?, price = ?, old_price = ?, image_url = ?, active = ?, featured = ?
                WHERE id = ?
                """, request.categoryId(), request.name(), request.description(), request.brand(),
                request.sku(), request.unitLabel(), request.price(), request.oldPrice(),
                request.imageUrl(), request.active(), request.featured(), productId);
        return productMapFromDb(productId);
    }

    public void deleteProduct(Long userId, Long productId) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("products", productId, storeId, "Produit");
        jdbcTemplate.update("DELETE FROM products WHERE id = ?", productId);
    }

    public void updateInventory(Long userId, Long productId, UpdateInventoryRequest request) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("products", productId, storeId, "Produit");
        jdbcTemplate.update("""
                INSERT INTO inventory (product_id, quantity, low_stock_threshold)
                VALUES (?, ?, ?)
                ON CONFLICT (product_id) DO UPDATE SET quantity = ?, low_stock_threshold = ?
                """, productId, request.quantity(), request.lowStockThreshold(),
                request.quantity(), request.lowStockThreshold());
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getOrders(Long userId, String status, int page, int size) {
        Long storeId = resolveStoreId(userId);
        int offset = page * size;
        if (status != null && !status.isBlank()) {
            return jdbcTemplate.query("""
                    SELECT o.id, o.order_number, o.status, o.subtotal_amount, o.delivery_fee,
                           o.discount_amount, o.total_amount, o.customer_note, o.created_at,
                           u.email AS customer_email, u.first_name || ' ' || u.last_name AS customer_name
                    FROM orders o
                    JOIN customers c ON c.id = o.customer_id
                    JOIN users u ON u.id = c.user_id
                    WHERE o.store_id = ? AND o.status = ?::text
                    ORDER BY o.created_at DESC LIMIT ? OFFSET ?
                    """, (rs, rowNum) -> orderMap(rs), storeId, status.toUpperCase(), size, offset);
        }
        return jdbcTemplate.query("""
                SELECT o.id, o.order_number, o.status, o.subtotal_amount, o.delivery_fee,
                       o.discount_amount, o.total_amount, o.customer_note, o.created_at,
                       u.email AS customer_email, u.first_name || ' ' || u.last_name AS customer_name
                FROM orders o
                JOIN customers c ON c.id = o.customer_id
                JOIN users u ON u.id = c.user_id
                WHERE o.store_id = ?
                ORDER BY o.created_at DESC LIMIT ? OFFSET ?
                """, (rs, rowNum) -> orderMap(rs), storeId, size, offset);
    }

    public java.util.Map<String, Object> updateOrderStatus(Long userId, Long orderId, UpdateOrderStatusRequest request) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("orders", orderId, storeId, "Commande");

        String currentStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM orders WHERE id = ?", String.class, orderId);

        String newStatus = request.status().name();

        if ("CONFIRMEE".equals(newStatus) && "EN_ATTENTE".equals(currentStatus)) {
            jdbcTemplate.update("""
                    UPDATE inventory i SET quantity = i.quantity - oi.quantity
                    FROM order_items oi
                    WHERE oi.order_id = ? AND i.product_id = oi.product_id
                    """, orderId);
        }

        jdbcTemplate.update("UPDATE orders SET status = ? WHERE id = ?", newStatus, orderId);

        String orderNumber = jdbcTemplate.queryForObject(
                "SELECT order_number FROM orders WHERE id = ?", String.class, orderId);
        String statusLabel = switch (newStatus) {
            case "EN_ATTENTE" -> "En attente";
            case "CONFIRMEE" -> "Confirmée";
            case "EN_PREPARATION" -> "En préparation";
            case "EXPEDIEE" -> "Expédiée";
            case "LIVREE" -> "Livrée";
            case "ANNULEE" -> "Annulée";
            default -> newStatus;
        };
        Long customerUserId = jdbcTemplate.queryForObject(
                "SELECT c.user_id FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = ?",
                Long.class, orderId);
        if (customerUserId != null) {
            notificationService.create(customerUserId,
                    "Commande " + orderNumber,
                    "Votre commande est maintenant " + statusLabel.toLowerCase() + ".",
                    NotificationType.ORDER_STATUS);
        }

        return jdbcTemplate.queryForMap("""
                SELECT o.id, o.order_number, o.status, o.subtotal_amount, o.delivery_fee,
                       o.discount_amount, o.total_amount, o.customer_note, o.created_at
                FROM orders o WHERE o.id = ?
                """, orderId);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getOrderDetail(Long userId, Long orderId) {
        Long storeId = resolveStoreId(userId);
        verifyOwnership("orders", orderId, storeId, "Commande");

        var order = jdbcTemplate.query("""
                SELECT o.id, o.order_number, o.status, o.subtotal_amount, o.delivery_fee,
                       o.discount_amount, o.total_amount, o.customer_note, o.created_at,
                       u.email AS customer_email,
                       u.first_name AS customer_first_name,
                       u.last_name AS customer_last_name
                FROM orders o
                JOIN customers c ON c.id = o.customer_id
                JOIN users u ON u.id = c.user_id
                WHERE o.id = ?
                """, (rs) -> {
            if (!rs.next()) throw new BusinessException("NOT_FOUND", "Commande introuvable.");
            var map = new java.util.HashMap<String, Object>();
            map.put("id", rs.getLong("id"));
            map.put("orderNumber", rs.getString("order_number"));
            map.put("status", rs.getString("status"));
            map.put("subtotalAmount", rs.getBigDecimal("subtotal_amount"));
            map.put("deliveryFee", rs.getBigDecimal("delivery_fee"));
            map.put("discountAmount", rs.getBigDecimal("discount_amount"));
            map.put("totalAmount", rs.getBigDecimal("total_amount"));
            map.put("customerNote", rs.getString("customer_note"));
            map.put("customerEmail", rs.getString("customer_email"));
            map.put("customerFirstName", rs.getString("customer_first_name"));
            map.put("customerLastName", rs.getString("customer_last_name"));
            map.put("createdAt", rs.getObject("created_at", java.time.OffsetDateTime.class).toString());
            return map;
        }, orderId);

        var address = jdbcTemplate.query("""
                SELECT a.recipient_name, a.phone_number, a.street_line,
                       a.city, a.governorate, a.postal_code
                FROM addresses a WHERE a.id = (
                    SELECT address_id FROM orders WHERE id = ?
                )
                """, (rs) -> {
            if (rs.next()) {
                var map = new java.util.HashMap<String, Object>();
                map.put("recipientName", rs.getString("recipient_name"));
                map.put("phoneNumber", rs.getString("phone_number"));
                map.put("streetLine", rs.getString("street_line"));
                map.put("city", rs.getString("city"));
                map.put("governorate", rs.getString("governorate"));
                map.put("postalCode", rs.getString("postal_code"));
                return map;
            }
            return null;
        }, orderId);
        order.put("address", address);

        var items = jdbcTemplate.query("""
                SELECT oi.id, oi.product_name, oi.unit_label, oi.unit_price,
                       oi.quantity, oi.line_total, p.image_url
                FROM order_items oi
                LEFT JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = ?
                """, (rs, rowNum) -> {
            var map = new java.util.HashMap<String, Object>();
            map.put("id", rs.getLong("id"));
            map.put("productName", rs.getString("product_name"));
            map.put("unitLabel", rs.getString("unit_label"));
            map.put("unitPrice", rs.getBigDecimal("unit_price"));
            map.put("quantity", rs.getBigDecimal("quantity"));
            map.put("lineTotal", rs.getBigDecimal("line_total"));
            map.put("imageUrl", rs.getString("image_url"));
            return map;
        }, orderId);
        order.put("items", items);

        return order;
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getPromotions(Long userId) {
        Long storeId = resolveStoreId(userId);
        return jdbcTemplate.query("""
                SELECT p.id, p.name, p.description, p.discount_type AS discountType,
                       p.discount_value AS discountValue, p.starts_at AS startsAt,
                       p.ends_at AS endsAt, p.active,
                       (SELECT COUNT(*) FROM product_promotions pp WHERE pp.promotion_id = p.id) AS productCount
                FROM promotions p
                WHERE p.store_id = ?
                ORDER BY p.created_at DESC
                """, (rs, rowNum) -> {
            var map = new java.util.HashMap<String, Object>();
            map.put("id", rs.getLong("id"));
            map.put("name", rs.getString("name"));
            map.put("description", rs.getString("description"));
            map.put("discountType", rs.getString("discountType"));
            map.put("discountValue", rs.getBigDecimal("discountValue"));
            map.put("startsAt", rs.getObject("startsAt", java.time.OffsetDateTime.class).toString());
            map.put("endsAt", rs.getObject("endsAt", java.time.OffsetDateTime.class).toString());
            map.put("active", rs.getBoolean("active"));
            map.put("productCount", rs.getLong("productCount"));
            return map;
        }, storeId);
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getCustomers(Long userId, String search, int page, int size) {
        Long storeId = resolveStoreId(userId);
        int offset = page * size;
        if (search != null && !search.isBlank()) {
            return jdbcTemplate.query("""
                    SELECT u.id, u.first_name AS firstName, u.last_name AS lastName, u.email, u.phone_number AS phoneNumber,
                           u.created_at AS createdAt,
                           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.store_id = ?) AS orderCount,
                           (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE o.customer_id = c.id AND o.store_id = ?) AS totalSpent
                    FROM customers c
                    JOIN users u ON u.id = c.user_id
                    WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.store_id = ?)
                      AND (LOWER(u.first_name) LIKE LOWER(?) OR LOWER(u.last_name) LIKE LOWER(?) OR LOWER(u.email) LIKE LOWER(?))
                    ORDER BY u.created_at DESC LIMIT ? OFFSET ?
                    """, (rs, rowNum) -> customerMap(rs),
                    storeId, storeId, storeId,
                    "%" + search + "%", "%" + search + "%", "%" + search + "%",
                    size, offset);
        }
        return jdbcTemplate.query("""
                SELECT u.id, u.first_name AS firstName, u.last_name AS lastName, u.email, u.phone_number AS phoneNumber,
                       u.created_at AS createdAt,
                       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.store_id = ?) AS orderCount,
                       (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE o.customer_id = c.id AND o.store_id = ?) AS totalSpent
                FROM customers c
                JOIN users u ON u.id = c.user_id
                WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.store_id = ?)
                ORDER BY u.created_at DESC LIMIT ? OFFSET ?
                """, (rs, rowNum) -> customerMap(rs),
                storeId, storeId, storeId, size, offset);
    }

    public long getNotificationCount(Long userId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL",
                Long.class, userId);
        return count != null ? count : 0;
    }

    private java.util.Map<String, Object> customerMap(java.sql.ResultSet rs) throws java.sql.SQLException {
        var map = new java.util.HashMap<String, Object>();
        map.put("id", rs.getLong("id"));
        map.put("firstName", rs.getString("firstName"));
        map.put("lastName", rs.getString("lastName"));
        map.put("email", rs.getString("email"));
        map.put("phoneNumber", rs.getString("phoneNumber"));
        map.put("createdAt", rs.getObject("createdAt", java.time.OffsetDateTime.class).toString());
        map.put("orderCount", rs.getLong("orderCount"));
        map.put("totalSpent", rs.getBigDecimal("totalSpent"));
        return map;
    }

    private void verifyOwnership(String table, Long id, Long storeId, String label) {
        Long actualStore = jdbcTemplate.query(
                "SELECT store_id FROM " + table + " WHERE id = ?",
                rs -> rs.next() ? rs.getLong("store_id") : null, id);
        if (actualStore == null) throw new com.ziouziou.freshmarket.application.exception.ResourceNotFoundException(label, id);
        if (!actualStore.equals(storeId)) throw new BusinessException("FORBIDDEN", "Acces refuse a cette ressource.");
    }

    private void verifyCategoryStore(Long storeId, Long categoryId) {
        Long actualStore = jdbcTemplate.query(
                "SELECT store_id FROM categories WHERE id = ?",
                rs -> rs.next() ? rs.getLong("store_id") : null, categoryId);
        if (actualStore == null) throw new com.ziouziou.freshmarket.application.exception.ResourceNotFoundException("Categorie", categoryId);
        if (!actualStore.equals(storeId)) throw new BusinessException("FORBIDDEN", "Cette categorie ne vous appartient pas.");
    }

    private java.util.Map<String, Object> categoryMap(Long id, Long storeId, String name, String slug, String description, String imageUrl, boolean active, int displayOrder) {
        var map = new java.util.HashMap<String, Object>();
        map.put("id", id); map.put("storeId", storeId); map.put("name", name);
        map.put("slug", slug); map.put("description", description);
        map.put("imageUrl", imageUrl); map.put("active", active);
        map.put("displayOrder", displayOrder);
        return map;
    }

    private java.util.Map<String, Object> productMap(java.sql.ResultSet rs) throws java.sql.SQLException {
        var map = new java.util.HashMap<String, Object>();
        map.put("id", rs.getLong("id")); map.put("name", rs.getString("name"));
        map.put("slug", rs.getString("slug")); map.put("description", rs.getString("description"));
        map.put("brand", rs.getString("brand")); map.put("sku", rs.getString("sku"));
        map.put("unitLabel", rs.getString("unit_label"));
        map.put("price", rs.getBigDecimal("price")); map.put("oldPrice", rs.getBigDecimal("old_price"));
        map.put("imageUrl", rs.getString("image_url")); map.put("active", rs.getBoolean("active"));
        map.put("featured", rs.getBoolean("featured"));
        map.put("categoryName", rs.getString("category_name"));
        map.put("stock", rs.getBigDecimal("stock"));
        return map;
    }

    private java.util.Map<String, Object> productMapFromDb(Long productId) {
        return jdbcTemplate.queryForMap("""
                SELECT p.id, p.name, p.slug, p.description, p.brand, p.sku, p.unit_label,
                       p.price, p.old_price, p.image_url, p.active, p.featured,
                       p.category_id, c.name AS category_name, i.quantity AS stock
                FROM products p
                JOIN categories c ON c.id = p.category_id
                LEFT JOIN inventory i ON i.product_id = p.id
                WHERE p.id = ?
                """, productId);
    }

    private java.util.Map<String, Object> orderMap(java.sql.ResultSet rs) throws java.sql.SQLException {
        var map = new java.util.HashMap<String, Object>();
        map.put("id", rs.getLong("id")); map.put("orderNumber", rs.getString("order_number"));
        map.put("status", rs.getString("status"));
        map.put("subtotalAmount", rs.getBigDecimal("subtotal_amount"));
        map.put("deliveryFee", rs.getBigDecimal("delivery_fee"));
        map.put("discountAmount", rs.getBigDecimal("discount_amount"));
        map.put("totalAmount", rs.getBigDecimal("total_amount"));
        map.put("customerNote", rs.getString("customer_note"));
        map.put("customerEmail", rs.getString("customer_email"));
        map.put("customerName", rs.getString("customer_name"));
        map.put("createdAt", rs.getObject("created_at", java.time.OffsetDateTime.class).toString());
        return map;
    }

    private Long insertAndReturnId(String sql, Object... args) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement(sql, new String[]{"id"});
            for (int i = 0; i < args.length; i++) {
                if (args[i] == null) statement.setObject(i + 1, null);
                else statement.setObject(i + 1, args[i]);
            }
            return statement;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) throw new BusinessException("INSERT_FAILED", "Creation impossible.");
        return key.longValue();
    }

    private String slugify(String value) {
        String slug = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "element" : slug;
    }
}
