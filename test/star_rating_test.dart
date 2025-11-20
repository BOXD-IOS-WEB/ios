import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/widgets/star_rating.dart';

void main() {
  group('StarRating Widget Tests', () {
    testWidgets('displays 5 star icons', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(rating: 0),
          ),
        ),
      );

      // Should display 5 stars
      expect(find.byIcon(Icons.star_border), findsNWidgets(5));
    });

    testWidgets('displays filled stars based on rating', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(rating: 3),
          ),
        ),
      );

      // Should display 3 filled stars and 2 empty stars
      expect(find.byIcon(Icons.star), findsNWidgets(3));
      expect(find.byIcon(Icons.star_border), findsNWidgets(2));
    });

    testWidgets('handles tap events in interactive mode', (WidgetTester tester) async {
      double? tappedRating;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StarRating(
              rating: 0,
              onRatingChanged: (rating) {
                tappedRating = rating;
              },
            ),
          ),
        ),
      );

      // Tap the third star
      await tester.tap(find.byIcon(Icons.star_border).at(2));
      await tester.pump();

      // Should set rating to 3
      expect(tappedRating, equals(3.0));
    });

    testWidgets('does not respond to taps in read-only mode', (WidgetTester tester) async {
      double? tappedRating;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StarRating(
              rating: 2,
              readOnly: true,
              onRatingChanged: (rating) {
                tappedRating = rating;
              },
            ),
          ),
        ),
      );

      // Try to tap a star
      await tester.tap(find.byIcon(Icons.star).first);
      await tester.pump();

      // Rating should not change
      expect(tappedRating, isNull);
    });

    testWidgets('uses custom size', (WidgetTester tester) async {
      const customSize = 32.0;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(
              rating: 3,
              size: customSize,
            ),
          ),
        ),
      );

      // Find the first star icon
      final iconWidget = tester.widget<Icon>(find.byType(Icon).first);
      expect(iconWidget.size, equals(customSize));
    });

    testWidgets('uses custom colors', (WidgetTester tester) async {
      const activeColor = Colors.red;
      const inactiveColor = Colors.blue;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(
              rating: 2,
              activeColor: activeColor,
              inactiveColor: inactiveColor,
            ),
          ),
        ),
      );

      // Check that filled stars use active color
      final filledStar = tester.widget<Icon>(find.byIcon(Icons.star).first);
      expect(filledStar.color, equals(activeColor));

      // Check that empty stars use inactive color
      final emptyStar = tester.widget<Icon>(find.byIcon(Icons.star_border).first);
      expect(emptyStar.color, equals(inactiveColor));
    });

    testWidgets('displays half stars for decimal ratings', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(rating: 3.5),
          ),
        ),
      );

      // Should display 3 filled stars, 1 half star, and 1 empty star
      expect(find.byIcon(Icons.star), findsNWidgets(3));
      expect(find.byIcon(Icons.star_half), findsNWidgets(1));
      expect(find.byIcon(Icons.star_border), findsNWidgets(1));
    });

    testWidgets('handles zero rating', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(rating: 0),
          ),
        ),
      );

      // All stars should be empty
      expect(find.byIcon(Icons.star_border), findsNWidgets(5));
    });

    testWidgets('handles maximum rating', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StarRating(rating: 5),
          ),
        ),
      );

      // All stars should be filled
      expect(find.byIcon(Icons.star), findsNWidgets(5));
    });
  });
}
