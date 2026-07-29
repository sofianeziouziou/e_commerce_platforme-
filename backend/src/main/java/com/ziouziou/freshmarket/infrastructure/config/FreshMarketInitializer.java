package com.ziouziou.freshmarket.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class FreshMarketInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(FreshMarketInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public FreshMarketInitializer(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        Integer adminCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE r.name = 'ROLE_ADMIN'
                """, Integer.class);

        if (adminCount != null && adminCount > 0) {
            log.info("Un compte administrateur existe deja. Aucune creation automatique necessaire.");
            return;
        }

        log.warn("========================================");
        log.warn(" AUCUN COMPTE ADMINISTRATEUR TROUVE !");
        log.warn(" Creation d'un compte par defaut pour le developpement.");
        log.warn("  Email   : admin@freshmarket.tn");
        log.warn("  Mot de passe : Admin@12345");
        log.warn("----------------------------------------");
        log.warn(" ATTENTION : Ce compte est destine UNIQUEMENT");
        log.warn(" au developpement local. CHANGEZ LE MOT DE PASSE");
        log.warn(" avant toute mise en production !");
        log.warn("========================================");

        String hashedPassword = passwordEncoder.encode("Admin@12345");
        jdbcTemplate.update("""
                INSERT INTO users (email, password_hash, first_name, last_name, phone_number, enabled, account_locked)
                VALUES (?, ?, ?, ?, ?, TRUE, FALSE)
                """, "admin@freshmarket.tn", hashedPassword, "Admin", "FreshMarket", "00000000");

        Long userId = jdbcTemplate.queryForObject(
                "SELECT id FROM users WHERE email = ?", Long.class, "admin@freshmarket.tn");

        Long roleId = jdbcTemplate.queryForObject(
                "SELECT id FROM roles WHERE name = 'ROLE_ADMIN'", Long.class);

        jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", userId, roleId);

        Long storeId = jdbcTemplate.queryForObject(
                "SELECT id FROM stores ORDER BY id ASC LIMIT 1", Long.class);

        jdbcTemplate.update("INSERT INTO admin_profiles (user_id, store_id) VALUES (?, ?)", userId, storeId);

        log.info("Compte administrateur cree avec succes.");
    }
}
