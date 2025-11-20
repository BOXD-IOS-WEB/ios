import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/models/user_stats.dart';
import 'package:boxboxd/core/services/race_log_service.dart';
import 'package:boxboxd/core/services/user_stats_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

// Provider for RaceLogService
final raceLogServiceProvider = Provider<RaceLogService>((ref) => RaceLogService());

// Provider for UserStatsService
final userStatsServiceProvider = Provider<UserStatsService>((ref) => UserStatsService());

// Provider for current user
final currentUserProvider = StreamProvider<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

// State class for diary
class DiaryState {
  final List<RaceLog> logs;
  final bool isLoading;
  final String? error;
  final UserStats? stats;

  DiaryState({
    this.logs = const [],
    this.isLoading = false,
    this.error,
    this.stats,
  });

  DiaryState copyWith({
    List<RaceLog>? logs,
    bool? isLoading,
    String? error,
    UserStats? stats,
  }) {
    return DiaryState(
      logs: logs ?? this.logs,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      stats: stats ?? this.stats,
    );
  }
}

// Provider for diary state - using FutureProvider for simplicity
final diaryProvider = FutureProvider.family<DiaryState, String>((ref, userId) async {
  final raceLogService = ref.read(raceLogServiceProvider);
  final userStatsService = ref.read(userStatsServiceProvider);
  
  try {
    final logs = await raceLogService.getUserRaceLogs(userId);
    
    // Sort by date watched descending
    logs.sort((a, b) => b.dateWatched.compareTo(a.dateWatched));
    
    // Fetch user stats
    UserStats? stats;
    try {
      stats = await userStatsService.getUserStats(userId);
    } catch (e) {
      // Stats might not exist yet, create a temporary one
      stats = UserStats(
        userId: userId,
        racesWatched: logs.length,
        totalHoursWatched: UserStatsService.calculateTotalHours(logs),
      );
    }
    
    return DiaryState(
      logs: logs,
      isLoading: false,
      stats: stats,
    );
  } catch (e) {
    return DiaryState(
      isLoading: false,
      error: e.toString(),
    );
  }
});

// Helper methods for diary operations
class DiaryOperations {
  static Future<void> deleteLog(WidgetRef ref, String userId, String logId) async {
    final raceLogService = ref.read(raceLogServiceProvider);
    await raceLogService.deleteRaceLog(logId);
    // Invalidate the provider to trigger a refresh
    ref.invalidate(diaryProvider(userId));
  }
  
  static void refresh(WidgetRef ref, String userId) {
    ref.invalidate(diaryProvider(userId));
  }
}
