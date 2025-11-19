import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/widgets/responsive_flex.dart';

void main() {
  testWidgets('ResponsiveFlex renders Row when width > breakpoint', (WidgetTester tester) async {
    // Set screen size to be larger than breakpoint (600)
    tester.view.physicalSize = const Size(800, 600);
    tester.view.devicePixelRatio = 1.0;

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: ResponsiveFlex(
            breakpoint: 600,
            children: [
              Text('Item 1'),
              Text('Item 2'),
            ],
          ),
        ),
      ),
    );

    // Find the Flex widget
    final flexFinder = find.byType(Flex);
    expect(flexFinder, findsOneWidget);

    final flex = tester.widget<Flex>(flexFinder);
    expect(flex.direction, Axis.horizontal);

    // Reset view
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });

  testWidgets('ResponsiveFlex renders Column when width < breakpoint', (WidgetTester tester) async {
    // Set screen size to be smaller than breakpoint (600)
    tester.view.physicalSize = const Size(400, 600);
    tester.view.devicePixelRatio = 1.0;

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: ResponsiveFlex(
            breakpoint: 600,
            children: [
              Text('Item 1'),
              Text('Item 2'),
            ],
          ),
        ),
      ),
    );

    // Find the Flex widget
    final flexFinder = find.byType(Flex);
    expect(flexFinder, findsOneWidget);

    final flex = tester.widget<Flex>(flexFinder);
    expect(flex.direction, Axis.vertical);

    // Reset view
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });

  testWidgets('ResponsiveFlex adds spacing correctly', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 600);
    tester.view.devicePixelRatio = 1.0;

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: ResponsiveFlex(
            breakpoint: 600,
            spacing: 20,
            children: [
              Text('Item 1'),
              Text('Item 2'),
            ],
          ),
        ),
      ),
    );

    // Should have 3 children: Item 1, SizedBox, Item 2
    final flexFinder = find.byType(Flex);
    final flex = tester.widget<Flex>(flexFinder);
    expect(flex.children.length, 3);
    expect(flex.children[1], isA<SizedBox>());
    
    final sizedBox = flex.children[1] as SizedBox;
    expect(sizedBox.width, 20);

    // Reset view
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  });
}
