class Address {
  const Address({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.phoneNumber,
    required this.streetLine,
    required this.city,
    required this.governorate,
    this.postalCode,
    this.latitude,
    this.longitude,
    required this.defaultAddress,
  });

  final int id;
  final String label;
  final String recipientName;
  final String phoneNumber;
  final String streetLine;
  final String city;
  final String governorate;
  final String? postalCode;
  final num? latitude;
  final num? longitude;
  final bool defaultAddress;

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: (json['id'] as num).toInt(),
      label: json['label']?.toString() ?? '',
      recipientName: json['recipientName']?.toString() ?? '',
      phoneNumber: json['phoneNumber']?.toString() ?? '',
      streetLine: json['streetLine']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      governorate: json['governorate']?.toString() ?? '',
      postalCode: json['postalCode']?.toString(),
      latitude: json['latitude'] as num?,
      longitude: json['longitude'] as num?,
      defaultAddress: json['defaultAddress'] as bool? ?? false,
    );
  }
}

class AddressRequest {
  const AddressRequest({
    required this.label,
    required this.recipientName,
    required this.phoneNumber,
    required this.streetLine,
    required this.city,
    required this.governorate,
    this.postalCode,
    this.defaultAddress = false,
  });

  final String label;
  final String recipientName;
  final String phoneNumber;
  final String streetLine;
  final String city;
  final String governorate;
  final String? postalCode;
  final bool defaultAddress;

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'recipientName': recipientName,
      'phoneNumber': phoneNumber,
      'streetLine': streetLine,
      'city': city,
      'governorate': governorate,
      if (postalCode != null && postalCode!.isNotEmpty) 'postalCode': postalCode,
      'defaultAddress': defaultAddress,
    };
  }
}
