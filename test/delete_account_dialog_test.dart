import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/features/settings/widgets/delete_account_dialog.dart';

void main() {
  group('DeleteAccountDialog', () {
    testWidgets('displays warning message and data list', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DeleteAccountDialog(),
          ),
        ),
      );

      // Verify warning message is displayed
      expect(find.text('Delete Account'), findsOneWidget);
      expect(
        find.text('This action cannot be undone. All of the following data will be permanently deleted:'),
        findsOneWidget,
      );

      // Verify data items are listed
      expect(find.text('Your user profile and account information'), findsOneWidget);
      expect(find.text('All race logs and reviews'), findsOneWidget);
      expect(find.text('All lists you\'ve created'), findsOneWidget);
      expect(find.text('All comments you\'ve made'), findsOneWidget);
      expect(find.text('All likes and reactions'), findsOneWidget);
      expect(find.text('Your followers and following connections'), findsOneWidget);
      expect(find.text('All notifications'), findsOneWidget);
      expect(find.text('Your viewing statistics'), findsOneWidget);
    });

    testWidgets('has password input field', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DeleteAccountDialog(),
          ),
        ),
      );

      // Verify password field exists
      expect(find.text('Enter your password to confirm:'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('has cancel and delete buttons', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DeleteAccountDialog(),
          ),
        ),
      );

      // Verify buttons exist
      expect(find.text('CANCEL'), findsOneWidget);
      expect(find.text('DELETE ACCOUNT'), findsOneWidget);
    });

    testWidgets('cancel button closes dialog', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => const DeleteAccountDialog(),
                  );
                },
                child: const Text('Show Dialog'),
              ),
            ),
          ),
        ),
      );

      // Open dialog
      await tester.tap(find.text('Show Dialog'));
      await tester.pumpAndSettle();

      // Tap cancel
      await tester.tap(find.text('CANCEL'));
      await tester.pumpAndSettle();

      // Verify dialog is closed
      expect(find.byType(DeleteAccountDialog), findsNothing);
    });

    testWidgets('shows error when password is empty', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DeleteAccountDialog(),
          ),
        ),
      );

      // Tap delete without entering password
      await tester.tap(find.text('DELETE ACCOUNT'));
      await tester.pump();

      // Verify error message is shown
      expect(find.text('Please enter your password to confirm'), findsOneWidget);
    });

    testWidgets('returns password when confirmed', (WidgetTester tester) async {
      String? returnedPassword;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () async {
                  returnedPassword = await showDialog<String>(
                    context: context,
                    builder: (context) => const DeleteAccountDialog(),
                  );
                },
                child: const Text('Show Dialog'),
              ),
            ),
          ),
        ),
      );

      // Open dialog
      await tester.tap(find.text('Show Dialog'));
      await tester.pumpAndSettle();

      // Enter password
      await tester.enterText(find.byType(TextField), 'testpassword123');
      await tester.pump();

      // Tap delete
      await tester.tap(find.text('DELETE ACCOUNT'));
      await tester.pumpAndSettle();

      // Verify password was returned
      expect(returnedPassword, equals('testpassword123'));
    });

    testWidgets('password visibility toggle works', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DeleteAccountDialog(),
          ),
        ),
      );

      // Find the TextField
      final textField = tester.widget<TextField>(find.byType(TextField));
      
      // Initially password should be obscured
      expect(textField.obscureText, isTrue);

      // Tap visibility toggle
      await tester.tap(find.byIcon(Icons.visibility));
      await tester.pump();

      // Password should now be visible
      final updatedTextField = tester.widget<TextField>(find.byType(TextField));
      expect(updatedTextField.obscureText, isFalse);
    });
  });
}
