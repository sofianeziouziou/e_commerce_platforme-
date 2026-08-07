package com.ziouziou.freshmarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
@SpringBootApplication
public class FreshMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreshMarketApplication.class, args);
    }
}
