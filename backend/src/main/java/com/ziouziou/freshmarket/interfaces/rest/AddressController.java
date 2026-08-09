package com.ziouziou.freshmarket.interfaces.rest;

import com.ziouziou.freshmarket.application.customer.AddressService;
import com.ziouziou.freshmarket.interfaces.rest.dto.customer.AddressRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.customer.AddressResponse;
import jakarta.validation.Valid;
import java.util.List;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public List<AddressResponse> getAddresses(@AuthenticationPrincipal Jwt jwt) {
        return addressService.getAddresses(getUserId(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse createAddress(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AddressRequest request) {
        return addressService.createAddress(getUserId(jwt), request);
    }

    @PutMapping("/{addressId}")
    public AddressResponse updateAddress(@AuthenticationPrincipal Jwt jwt, @PathVariable Long addressId,
                                         @Valid @RequestBody AddressRequest request) {
        return addressService.updateAddress(getUserId(jwt), addressId, request);
    }

    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(@AuthenticationPrincipal Jwt jwt, @PathVariable Long addressId) {
        addressService.deleteAddress(getUserId(jwt), addressId);
    }

    private Long getUserId(Jwt jwt) {
        return jwt.getClaim("userId");
    }
}
