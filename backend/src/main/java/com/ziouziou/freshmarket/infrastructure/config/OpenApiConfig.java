package com.ziouziou.freshmarket.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI freshMarketOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FreshMarket API")
                        .description("API REST pour la plateforme e-commerce alimentaire FreshMarket / Magasin Ziouziou.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Magasin Ziouziou")
                                .url("https://maps.app.goo.gl/j6VrwimKg8Lp2Z4X7"))
                        .license(new License().name("Private")));
    }
}

