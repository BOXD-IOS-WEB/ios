import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/services/user_stats_service.dart';

void main() {
  group('UserStatsService', () {
    group('calculateTotalHours', () {
      test('calculates hours correctly for race session type', () {
        final logs = [
          _createMockRaceLog(sessionType: 'race'),
          _createMockRaceLog(sessionType: 'race'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 4.0); // 2 races * 2 hours each
      });

      test('calculates hours correctly for sprint session type', () {
        final logs = [
          _createMockRaceLog(sessionType: 'sprint'),
          _createMockRaceLog(sessionType: 'sprint'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 1.0); // 2 sprints * 0.5 hours each
      });

      test('calculates hours correctly for qualifying session type', () {
        final logs = [
          _createMockRaceLog(sessionType: 'qualifying'),
          _createMockRaceLog(sessionType: 'qualifying'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 2.0); // 2 qualifying * 1 hour each
      });

      test('calculates hours correctly for sprint qualifying session type', () {
        final logs = [
          _createMockRaceLog(sessionType: 'sprint qualifying'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 1.0); // 1 sprint qualifying * 1 hour
      });

      test('calculates hours correctly for highlights session type', () {
        final logs = [
          _createMockRaceLog(sessionType: 'highlights'),
          _createMockRaceLog(sessionType: 'highlights'),
          _createMockRaceLog(sessionType: 'highlights'),
          _createMockRaceLog(sessionType: 'highlights'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 1.0); // 4 highlights * 0.25 hours each
      });

      test('calculates hours correctly for mixed session types', () {
        final logs = [
          _createMockRaceLog(sessionType: 'race'),        // 2.0
          _createMockRaceLog(sessionType: 'sprint'),      // 0.5
          _createMockRaceLog(sessionType: 'qualifying'),  // 1.0
          _createMockRaceLog(sessionType: 'highlights'),  // 0.25
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 3.75);
      });

      test('handles case-insensitive session types', () {
        final logs = [
          _createMockRaceLog(sessionType: 'RACE'),
          _createMockRaceLog(sessionType: 'Race'),
          _createMockRaceLog(sessionType: 'race'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 6.0); // 3 races * 2 hours each
      });

      test('returns 0 for empty list', () {
        final totalHours = UserStatsService.calculateTotalHours([]);

        expect(totalHours, 0.0);
      });

      test('returns 0 for unknown session types', () {
        final logs = [
          _createMockRaceLog(sessionType: 'unknown'),
          _createMockRaceLog(sessionType: 'invalid'),
        ];

        final totalHours = UserStatsService.calculateTotalHours(logs);

        expect(totalHours, 0.0);
      });
    });
  });
}

/// Helper function to create a mock RaceLog for testing
RaceLog _createMockRaceLog({required String sessionType}) {
  final now = DateTime.now();
  return RaceLog(
    id: 'test_id',
    userId: 'user_123',
    username: 'Test User',
    raceYear: 2025,
    raceName: 'Test GP',
    raceLocation: 'Test Location',
    dateWatched: now,
    sessionType: sessionType,
    watchMode: 'live',
    rating: 4.0,
    review: 'Test review',
    tags: [],
    companions: [],
    mediaUrls: [],
    spoilerWarning: false,
    visibility: 'public',
    createdAt: now,
    updatedAt: now,
    likesCount: 0,
    commentsCount: 0,
    likedBy: [],
  );
}
