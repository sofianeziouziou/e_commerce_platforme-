package com.ziouziou.freshmarket.application.identity;

import com.ziouziou.freshmarket.application.exception.BusinessException;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.AdminRegisterRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.AuthResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.ForgotPasswordRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.LoginRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.RegisterRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.ResetPasswordRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.UpdateProfileRequest;
import java.sql.PreparedStatement;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    @Transactional
    public AuthResponse registerClient(RegisterRequest request) {
        Long userId = createUser(request.email(), request.password(), request.firstName(), request.lastName(), request.phoneNumber());
        attachRole(userId, "ROLE_CLIENT");
        jdbcTemplate.update("INSERT INTO customers (user_id) VALUES (?) ON CONFLICT (user_id) DO NOTHING", userId);
        return buildAuthResponse(userId);
    }

    @Transactional
    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        Long userId = createUser(request.email(), request.password(), request.firstName(), request.lastName(), request.phoneNumber());
        attachRole(userId, "ROLE_ADMIN");

        Long storeId = insertAndReturnId("""
                INSERT INTO stores (owner_user_id, name, slug, phone_number, address_line, city, governorate)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                userId,
                request.storeName(),
                uniqueSlug("stores", request.storeName()),
                request.storePhoneNumber(),
                request.storeAddressLine(),
                request.storeCity(),
                request.storeGovernorate()
        );
        jdbcTemplate.update("INSERT INTO admin_profiles (user_id, store_id) VALUES (?, ?)", userId, storeId);
        return buildAuthResponse(userId);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserSummaryResponse getCurrentUser(Long userId) {
        UserSummary summary = loadUserSummary(userId);
        return new AuthResponse.UserSummaryResponse(userId, summary.email(), summary.firstName(), summary.lastName(), summary.phoneNumber(), summary.roles());
    }

    @Transactional
    public AuthResponse.UserSummaryResponse updateProfile(Long userId, UpdateProfileRequest request) {
        jdbcTemplate.update("""
                UPDATE users SET first_name = ?, last_name = ?, phone_number = ?
                WHERE id = ?
                """, request.firstName(), request.lastName(), request.phoneNumber(), userId);
        return getCurrentUser(userId);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserRow user = jdbcTemplate.query("""
                SELECT id, email, password_hash, first_name, last_name, enabled, account_locked
                FROM users
                WHERE lower(email) = lower(?)
                """, rs -> rs.next()
                ? new UserRow(rs.getLong("id"), rs.getString("email"), rs.getString("password_hash"),
                rs.getString("first_name"), rs.getString("last_name"), rs.getBoolean("enabled"), rs.getBoolean("account_locked"))
                : null, request.email());

        if (user == null || !passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new BusinessException("INVALID_CREDENTIALS", "Email ou mot de passe incorrect.");
        }
        if (!user.enabled() || user.accountLocked()) {
            throw new BusinessException("ACCOUNT_DISABLED", "Ce compte est desactive ou verrouille.");
        }
        return buildAuthResponse(user.id());
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        Long userId = jdbcTemplate.query("SELECT id FROM users WHERE lower(email) = lower(?)",
                rs -> rs.next() ? rs.getLong("id") : null, request.email());
        if (userId == null) {
            throw new BusinessException("USER_NOT_FOUND", "Aucun compte avec cet email.");
        }
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        jdbcTemplate.update("""
                INSERT INTO password_reset_tokens (user_id, token, expires_at)
                VALUES (?, ?, ?)
                """, userId, token, OffsetDateTime.now().plusHours(1));
        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Long tokenUserId = jdbcTemplate.query("""
                SELECT user_id FROM password_reset_tokens
                WHERE token = ? AND used = FALSE AND expires_at > NOW()
                """, rs -> rs.next() ? rs.getLong("user_id") : null, request.token());
        if (tokenUserId == null) {
            throw new BusinessException("INVALID_TOKEN", "Token invalide ou expire.");
        }
        jdbcTemplate.update("UPDATE users SET password_hash = ? WHERE id = ?",
                passwordEncoder.encode(request.newPassword()), tokenUserId);
        jdbcTemplate.update("UPDATE password_reset_tokens SET used = TRUE WHERE token = ?", request.token());
    }

    private Long createUser(String email, String password, String firstName, String lastName, String phoneNumber) {
        Integer exists = jdbcTemplate.queryForObject("SELECT count(*) FROM users WHERE lower(email) = lower(?)", Integer.class, email);
        if (exists != null && exists > 0) {
            throw new BusinessException("EMAIL_ALREADY_USED", "Cette adresse email est deja utilisee.");
        }
        return insertAndReturnId("""
                INSERT INTO users (email, password_hash, first_name, last_name, phone_number)
                VALUES (?, ?, ?, ?, ?)
                """, email, passwordEncoder.encode(password), firstName, lastName, phoneNumber);
    }

    private void attachRole(Long userId, String roleName) {
        jdbcTemplate.update("""
                INSERT INTO user_roles (user_id, role_id)
                SELECT ?, id FROM roles WHERE name = ?
                ON CONFLICT DO NOTHING
                """, userId, roleName);
    }

    private AuthResponse buildAuthResponse(Long userId) {
        UserSummary summary = loadUserSummary(userId);
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(24 * 60 * 60);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("freshmarket-api")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(summary.email())
                .claim("userId", userId)
                .claim("roles", summary.roles().stream().sorted().toList())
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, OffsetDateTime.ofInstant(expiresAt, ZoneOffset.UTC),
                new AuthResponse.UserSummaryResponse(userId, summary.email(), summary.firstName(), summary.lastName(), summary.phoneNumber(), summary.roles()));
    }

    private UserSummary loadUserSummary(Long userId) {
        UserSummary base = jdbcTemplate.query("""
                SELECT id, email, first_name, last_name, phone_number FROM users WHERE id = ?
                """, rs -> {
            if (!rs.next()) {
                throw new BusinessException("USER_NOT_FOUND", "Utilisateur introuvable.");
            }
            return new UserSummary(rs.getLong("id"), rs.getString("email"), rs.getString("first_name"), rs.getString("last_name"), rs.getString("phone_number"), Set.of());
        }, userId);
        Set<String> roles = jdbcTemplate.queryForList("""
                SELECT r.name FROM roles r
                JOIN user_roles ur ON ur.role_id = r.id
                WHERE ur.user_id = ?
                """, String.class, userId).stream().collect(Collectors.toSet());
        return new UserSummary(base.id(), base.email(), base.firstName(), base.lastName(), base.phoneNumber(), roles);
    }

    private Long insertAndReturnId(String sql, Object... args) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, new String[]{"id"});
            for (int i = 0; i < args.length; i++) {
                statement.setObject(i + 1, args[i]);
            }
            return statement;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new BusinessException("INSERT_FAILED", "Creation impossible.");
        }
        return key.longValue();
    }

    private String uniqueSlug(String table, String value) {
        String base = slugify(value);
        String slug = base;
        int suffix = 2;
        while (Boolean.TRUE.equals(jdbcTemplate.queryForObject("SELECT EXISTS (SELECT 1 FROM " + table + " WHERE slug = ?)", Boolean.class, slug))) {
            slug = base + "-" + suffix;
            suffix++;
        }
        return slug;
    }

    public static String slugify(String value) {
        String slug = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "element" : slug;
    }

    private record UserRow(Long id, String email, String passwordHash, String firstName, String lastName, boolean enabled, boolean accountLocked) {
    }

    private record UserSummary(Long id, String email, String firstName, String lastName, String phoneNumber, Set<String> roles) {
    }
}
