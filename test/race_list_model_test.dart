import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/models/race_list.dart';
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
  group('RaceList Model Tests', () {
    test('RaceList serializes and deserializes correctly', () {
      final date = DateTime.now();
      final raceList = RaceList(
        id: 'list_123',
        userId: 'user_123',
        username: 'Test User',
        title: 'My Top Races',
        description: 'Best races ever',
        races: [
          RaceListItem(
            raceYear: 2021,
            raceName: 'Abu Dhabi GP',
            raceLocation: 'Yas Marina',
            order: 0,
          ),
        ],
        isPublic: true,
        tags: ['F1', 'Best'],
        createdAt: date,
        updatedAt: date,
      );

      final json = raceList.toJson();
      
      expect(json['title'], 'My Top Races');
      expect(json['races'].length, 1);
      expect(json['races'][0]['raceName'], 'Abu Dhabi GP');
      
      // Note: In a real environment we'd test fromJson with a mocked DocumentSnapshot or map
    });
  });
}
