package com.ziouziou.freshmarket.domain.customer;

import com.ziouziou.freshmarket.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "addresses")
public class Address extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 80)
    private String label;

    @Column(name = "recipient_name", nullable = false, length = 160)
    private String recipientName;

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(name = "street_line", nullable = false)
    private String streetLine;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 120)
    private String governorate;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "is_default", nullable = false)
    private boolean defaultAddress;

    protected Address() {
    }

    public Address(Customer customer, String label, String recipientName, String phoneNumber,
                   String streetLine, String city, String governorate, String postalCode,
                   BigDecimal latitude, BigDecimal longitude, boolean defaultAddress) {
        this.customer = customer;
        this.label = label;
        this.recipientName = recipientName;
        this.phoneNumber = phoneNumber;
        this.streetLine = streetLine;
        this.city = city;
        this.governorate = governorate;
        this.postalCode = postalCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.defaultAddress = defaultAddress;
    }

    public void setDefaultAddress(boolean defaultAddress) {
        this.defaultAddress = defaultAddress;
    }

    public void update(String label, String recipientName, String phoneNumber,
                       String streetLine, String city, String governorate, String postalCode,
                       BigDecimal latitude, BigDecimal longitude, boolean defaultAddress) {
        this.label = label;
        this.recipientName = recipientName;
        this.phoneNumber = phoneNumber;
        this.streetLine = streetLine;
        this.city = city;
        this.governorate = governorate;
        this.postalCode = postalCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.defaultAddress = defaultAddress;
    }

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public String getLabel() {
        return label;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getStreetLine() {
        return streetLine;
    }

    public String getCity() {
        return city;
    }

    public String getGovernorate() {
        return governorate;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public boolean isDefaultAddress() {
        return defaultAddress;
    }
}

