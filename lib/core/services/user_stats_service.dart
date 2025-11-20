import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/models/user_stats.dart';

/// Service for managing user statistics in Firestore
/// Handles CRUD operations for the userStats collection
class UserStatsService {
  final FirebaseFirestore _firestore;

  UserStatsService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  /// Get user statistics from Firestore
  /// Returns a UserStats object
  /// Throws an exception if the document doesn't exist
  Future<UserStats> getUserStats(String userId) async {
    final doc = await _firestore.collection('userStats').doc(userId).get();
    
    if (!doc.exists) {
      throw Exception('User stats not found for user: $userId');
    }
    
    return UserStats.fromJson(doc.data()!, userId);
  }

  /// Update user statistics with the provided updates
  /// Uses merge to only update specified fields
  Future<void> updateUserStats(String userId, Map<String, dynamic> updates) async {
    await _firestore.collection('userStats').doc(userId).set({
      ...updates,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  /// Calculate total hours watched from a list of race logs
  /// Uses session type to determine hours:
  /// - race: 2 hours
  /// - sprint: 0.5 hours
  /// - qualifying: 1 hour
  /// - highlights: 0.25 hours
  static double calculateTotalHours(List<RaceLog> logs) {
    return logs.fold(0.0, (total, log) {
      double hours = 0;
      switch (log.sessionType.toLowerCase()) {
        case 'race':
          hours = 2.0;
          break;
        case 'sprint':
          hours = 0.5;
          break;
        case 'qualifying':
        case 'sprint qualifying':
          hours = 1.0;
          break;
        case 'highlights':
          hours = 0.25;
          break;
        default:
          hours = 0.0;
      }
      return total + hours;
    });
  }

  /// Recalculate all statistics for a user based on their race logs
  /// Fetches all race logs for the user and updates their stats
  Future<void> recalculateStats(String userId) async {
    // Fetch all race logs for the user
    final logsSnapshot = await _firestore
        .collection('raceLogs')
        .where('userId', isEqualTo: userId)
        .get();

    final logs = logsSnapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();

    // Calculate statistics
    final racesWatched = logs.length;
    final reviewsCount = logs.where((log) => log.review.isNotEmpty).length;
    final totalHoursWatched = UserStatsService.calculateTotalHours(logs);

    // Update user stats
    await updateUserStats(userId, {
      'racesWatched': racesWatched,
      'reviewsCount': reviewsCount,
      'totalHoursWatched': totalHoursWatched,
    });
  }
}
