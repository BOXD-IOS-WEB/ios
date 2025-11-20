import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/models/user_profile.dart';

void main() {
  group('Privacy Settings', () {
    test('UserProfile should have default privacy settings', () {
      final user = UserProfile(
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
      );

      expect(user.privateAccount, false);
      expect(user.showActivityStatus, true);
    });

    test('UserProfile should allow setting privacy preferences', () {
      final user = UserProfile(
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        privateAccount: true,
        showActivityStatus: false,
      );

      expect(user.privateAccount, true);
      expect(user.showActivityStatus, false);
    });

    test('UserProfile.fromJson should parse privacy settings', () {
      final json = {
        'name': 'Test User',
        'email': 'test@example.com',
        'privateAccount': true,
        'showActivityStatus': false,
      };

      final user = UserProfile.fromJson(json, 'test-id');

      expect(user.privateAccount, true);
      expect(user.showActivityStatus, false);
    });

    test('UserProfile.fromJson should use defaults when privacy fields missing', () {
      final json = {
        'name': 'Test User',
        'email': 'test@example.com',
      };

      final user = UserProfile.fromJson(json, 'test-id');

      expect(user.privateAccount, false);
      expect(user.showActivityStatus, true);
    });

    test('UserProfile.toJson should include privacy settings', () {
      final user = UserProfile(
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        privateAccount: true,
        showActivityStatus: false,
      );

      final json = user.toJson();

      expect(json['privateAccount'], true);
      expect(json['showActivityStatus'], false);
    });

    test('UserProfile.copyWith should update privacy settings', () {
      final user = UserProfile(
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        privateAccount: false,
        showActivityStatus: true,
      );

      final updated = user.copyWith(
        privateAccount: true,
        showActivityStatus: false,
      );

      expect(updated.privateAccount, true);
      expect(updated.showActivityStatus, false);
      expect(updated.name, 'Test User'); // Other fields unchanged
    });
  });
}
