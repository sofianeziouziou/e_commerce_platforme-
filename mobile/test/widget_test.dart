import 'package:flutter_test/flutter_test.dart';
import 'package:freshmarket_mobile/src/app/freshmarket_app.dart';

void main() {
  testWidgets('renders FreshMarket application', (tester) async {
    await tester.pumpWidget(const FreshMarketApp());

    expect(find.text('FreshMarket'), findsWidgets);
  });
}

