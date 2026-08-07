package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.application.identity.AuthService;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.AdminRegisterRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.AuthResponse;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.ForgotPasswordRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.LoginRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.RegisterRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.ResetPasswordRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.auth.UpdateProfileRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.registerClient(request);
    }

    @PostMapping("/register-admin")
    public AuthResponse registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        return authService.registerAdmin(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthResponse.UserSummaryResponse getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        Long userId = ((Number) jwt.getClaim("userId")).longValue();
        return authService.getCurrentUser(userId);
    }

    @PutMapping("/me")
    public AuthResponse.UserSummaryResponse updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long userId = ((Number) jwt.getClaim("userId")).longValue();
        return authService.updateProfile(userId, request);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return Map.of("message", "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return Map.of("message", "Mot de passe reinitialise avec succes.");
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Deconnexion reussie.");
    }
}
