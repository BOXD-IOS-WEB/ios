import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/features/settings/widgets/notifications_section.dart';

void main() {
  group('NotificationsSection', () {
    testWidgets('displays all notification toggles', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NotificationsSection(
              initialEmailNotifications: true,
              initialPushNotifications: true,
              initialLikesCommentsNotifications: true,
              initialFollowersNotifications: true,
              onSave: ({
                required bool emailNotifications,
                required bool pushNotifications,
                required bool likesCommentsNotifications,
                required bool followersNotifications,
              }) async {},
            ),
          ),
        ),
      );

      // Verify all toggles are present
      expect(find.text('Email Notifications'), findsOneWidget);
      expect(find.text('Push Notifications'), findsOneWidget);
      expect(find.text('Likes & Comments'), findsOneWidget);
      expect(find.text('New Followers'), findsOneWidget);
    });

    testWidgets('toggles are initialized with correct values', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NotificationsSection(
              initialEmailNotifications: true,
              initialPushNotifications: false,
              initialLikesCommentsNotifications: true,
              initialFollowersNotifications: false,
              onSave: ({
                required bool emailNotifications,
                required bool pushNotifications,
                required bool likesCommentsNotifications,
                required bool followersNotifications,
              }) async {},
            ),
          ),
        ),
      );

      // Find all switches
      final switches = tester.widgetList<Switch>(find.byType(Switch)).toList();
      
      expect(switches.length, 4);
      expect(switches[0].value, true);  // Email
      expect(switches[1].value, false); // Push
      expect(switches[2].value, true);  // Likes & Comments
      expect(switches[3].value, false); // Followers
    });

    testWidgets('calls onSave when toggle is changed', (WidgetTester tester) async {
      bool onSaveCalled = false;
      bool savedEmailValue = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NotificationsSection(
              initialEmailNotifications: true,
              initialPushNotifications: true,
              initialLikesCommentsNotifications: true,
              initialFollowersNotifications: true,
              onSave: ({
                required bool emailNotifications,
                required bool pushNotifications,
                required bool likesCommentsNotifications,
                required bool followersNotifications,
              }) async {
                onSaveCalled = true;
                savedEmailValue = emailNotifications;
              },
            ),
          ),
        ),
      );

      // Tap the first switch (Email Notifications)
      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();

      expect(onSaveCalled, true);
      expect(savedEmailValue, false); // Should be toggled from true to false
    });

    testWidgets('shows success message after saving', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NotificationsSection(
              initialEmailNotifications: true,
              initialPushNotifications: true,
              initialLikesCommentsNotifications: true,
              initialFollowersNotifications: true,
              onSave: ({
                required bool emailNotifications,
                required bool pushNotifications,
                required bool likesCommentsNotifications,
                required bool followersNotifications,
              }) async {
                // Simulate successful save
              },
            ),
          ),
        ),
      );

      // Tap a switch
      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();

      // Verify success message is shown
      expect(find.text('Notification preferences saved'), findsOneWidget);
    });

    testWidgets('shows error message when save fails', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NotificationsSection(
              initialEmailNotifications: true,
              initialPushNotifications: true,
              initialLikesCommentsNotifications: true,
              initialFollowersNotifications: true,
              onSave: ({
                required bool emailNotifications,
                required bool pushNotifications,
                required bool likesCommentsNotifications,
                required bool followersNotifications,
              }) async {
                throw Exception('Network error');
              },
            ),
          ),
        ),
      );

      // Tap a switch
      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();

      // Verify error message is shown
      expect(find.textContaining('Error saving notification preferences'), findsOneWidget);
    });

    testWidgets('all notification preferences can be toggled independently', (WidgetTester tester) async {
      bool emailValue = true;
      bool pushValue = true;
      bool likesValue = true;
      bool followersValue = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NotificationsSection(
              initialEmailNotifications: emailValue,
              initialPushNotifications: pushValue,
              initialLikesCommentsNotifications: likesValue,
              initialFollowersNotifications: followersValue,
              onSave: ({
                required bool emailNotifications,
                required bool pushNotifications,
                required bool likesCommentsNotifications,
                required bool followersNotifications,
              }) async {
                emailValue = emailNotifications;
                pushValue = pushNotifications;
                likesValue = likesCommentsNotifications;
                followersValue = followersNotifications;
              },
            ),
          ),
        ),
      );

      // Toggle each switch and verify the value changes
      final switches = find.byType(Switch);
      
      // Toggle email notifications
      await tester.tap(switches.at(0));
      await tester.pumpAndSettle();
      expect(emailValue, false);

      // Toggle push notifications
      await tester.tap(switches.at(1));
      await tester.pumpAndSettle();
      expect(pushValue, false);

      // Toggle likes & comments
      await tester.tap(switches.at(2));
      await tester.pumpAndSettle();
      expect(likesValue, false);

      // Toggle followers
      await tester.tap(switches.at(3));
      await tester.pumpAndSettle();
      expect(followersValue, false);
    });
  });
}
