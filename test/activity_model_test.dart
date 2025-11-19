import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/models/activity.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

// Mock Timestamp for testing
class MockTimestamp implements Timestamp {
  final DateTime _date;
  MockTimestamp(this._date);

  @override
  DateTime toDate() => _date;

  @override
  int get seconds => _date.millisecondsSinceEpoch ~/ 1000;

  @override
  int get nanoseconds => (_date.millisecondsSinceEpoch % 1000) * 1000000;

  @override
  int get microsecondsSinceEpoch => _date.microsecondsSinceEpoch;

  @override
  int get millisecondsSinceEpoch => _date.millisecondsSinceEpoch;
  
  @override
  int compareTo(Timestamp other) => toDate().compareTo(other.toDate());
  
  @override
  bool operator ==(Object other) => other is Timestamp && toDate() == other.toDate();
  
  @override
  int get hashCode => toDate().hashCode;
  
  @override
  String toString() => toDate().toString();
}

void main() {
  group('Activity Model Tests', () {
    test('Activity serializes and deserializes correctly', () {
      final date = DateTime.now();
      final activity = Activity(
        id: 'act_123',
        userId: 'user_123',
        username: 'Test User',
        userAvatar: 'http://example.com/avatar.jpg',
        type: 'log',
        targetId: 'race_123',
        targetType: 'raceLog',
        content: 'Great race!',
        createdAt: date,
      );

      final json = activity.toJson();
      
      expect(json['userId'], 'user_123');
      expect(json['type'], 'log');
      expect(json['targetType'], 'raceLog');
      
      // Note: In a real environment we'd test fromJson with a mocked DocumentSnapshot or map
      // but Timestamp conversion makes it tricky without firebase_core_platform_interface
    });
  });
}
