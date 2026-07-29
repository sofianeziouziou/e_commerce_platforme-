package com.ziouziou.freshmarket.interfaces.rest.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminRegisterRequest(
        @Email
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @Size(max = 30)
        String phoneNumber,

        @NotBlank
        @Size(max = 160)
        String storeName,

        @Size(max = 30)
        String storePhoneNumber,

        @Size(max = 255)
        String storeAddressLine,

        @Size(max = 120)
        String storeCity,

        @Size(max = 120)
        String storeGovernorate
) {
}
