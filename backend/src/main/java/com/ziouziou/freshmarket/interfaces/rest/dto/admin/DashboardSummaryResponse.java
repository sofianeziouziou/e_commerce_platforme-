package com.ziouziou.freshmarket.interfaces.rest.dto.admin;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long totalProducts,
        long activeProducts,
        long lowStockProducts,
        long pendingOrders,
        long deliveredOrders,
        long todayOrders,
        long totalCustomers,
        long activePromotions,
        BigDecimal totalRevenue
) {
}

