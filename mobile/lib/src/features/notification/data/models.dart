class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.readAt,
    required this.createdAt,
  });

  final int id;
  final String title;
  final String message;
  final String type;
  final DateTime? readAt;
  final DateTime? createdAt;

  bool get isRead => readAt != null;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: (json['id'] as num).toInt(),
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      readAt: DateTime.tryParse(json['readAt']?.toString() ?? ''),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}
