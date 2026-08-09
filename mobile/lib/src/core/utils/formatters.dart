import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final NumberFormat _priceFormat = NumberFormat.currency(
    locale: 'fr',
    symbol: 'DT',
    decimalDigits: 3,
  );

  static String price(num? value) {
    if (value == null) return '0 DT';
    return _priceFormat.format(value);
  }

  static final DateFormat _dateTimeFormat = DateFormat('dd/MM/yyyy HH:mm');

  static String dateTime(String? iso) {
    if (iso == null) return '';
    final parsed = DateTime.tryParse(iso);
    if (parsed == null) return '';
    return _dateTimeFormat.format(parsed.toLocal());
  }
}
