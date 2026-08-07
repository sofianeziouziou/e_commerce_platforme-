package com.ziouziou.freshmarket.application.customer;

import com.ziouziou.freshmarket.domain.customer.Address;
import com.ziouziou.freshmarket.domain.customer.Customer;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.AddressRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.CustomerRepository;
import com.ziouziou.freshmarket.infrastructure.persistence.repository.OrderRepository;
import com.ziouziou.freshmarket.interfaces.rest.dto.customer.AddressRequest;
import com.ziouziou.freshmarket.interfaces.rest.dto.customer.AddressResponse;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public AddressService(AddressRepository addressRepository, CustomerRepository customerRepository,
                          OrderRepository orderRepository) {
        this.addressRepository = addressRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        return addressRepository.findByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(customer.getId())
                .stream().map(this::toResponse).toList();
    }

    public AddressResponse createAddress(Long userId, AddressRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));

        if (request.defaultAddress()) {
            addressRepository.findByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(customer.getId())
                    .forEach(a -> {
                        a.setDefaultAddress(false);
                        addressRepository.save(a);
                    });
        }

        Address address = new Address(customer, request.label(), request.recipientName(),
                request.phoneNumber(), request.streetLine(), request.city(),
                request.governorate(), request.postalCode(), request.latitude(),
                request.longitude(), request.defaultAddress());
        address = addressRepository.save(address);
        return toResponse(address);
    }

    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Adresse introuvable"));
        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new com.ziouziou.freshmarket.application.exception.BusinessException("FORBIDDEN", "Acces refuse.");
        }

        if (request.defaultAddress() && !address.isDefaultAddress()) {
            addressRepository.findByCustomerIdOrderByDefaultAddressDescCreatedAtDesc(customer.getId())
                    .forEach(a -> {
                        a.setDefaultAddress(false);
                        addressRepository.save(a);
                    });
        }

        address.update(request.label(), request.recipientName(), request.phoneNumber(),
                request.streetLine(), request.city(), request.governorate(),
                request.postalCode(), request.latitude(), request.longitude(),
                request.defaultAddress());
        address = addressRepository.save(address);
        return toResponse(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable"));
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Adresse introuvable"));
        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new com.ziouziou.freshmarket.application.exception.BusinessException("FORBIDDEN", "Acces refuse.");
        }
        if (orderRepository.existsByAddressId(addressId)) {
            throw new com.ziouziou.freshmarket.application.exception.BusinessException("ADDRESS_HAS_ORDERS",
                    "Impossible de supprimer cette adresse : elle est liee a des commandes existantes.");
        }
        addressRepository.delete(address);
    }

    private AddressResponse toResponse(Address a) {
        return new AddressResponse(a.getId(), a.getLabel(), a.getRecipientName(), a.getPhoneNumber(),
                a.getStreetLine(), a.getCity(), a.getGovernorate(), a.getPostalCode(),
                a.getLatitude(), a.getLongitude(), a.isDefaultAddress());
    }
}
