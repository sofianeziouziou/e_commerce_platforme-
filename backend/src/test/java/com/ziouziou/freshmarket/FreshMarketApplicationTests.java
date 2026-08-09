package com.ziouziou.freshmarket;

import com.ziouziou.freshmarket.infrastructure.config.FreshMarketInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:freshmarket_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.hbm2ddl.import_files=import.sql",
        "spring.flyway.enabled=false"
})
class FreshMarketApplicationTests {

    @MockitoBean
    private FreshMarketInitializer freshMarketInitializer;

    @Test
    void contextLoads() {
    }
}
