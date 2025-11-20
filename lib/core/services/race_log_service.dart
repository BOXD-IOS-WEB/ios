import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:firebase_auth/firebase_auth.dart';

class RaceLogService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<String> createRaceLog(RaceLog log) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    // Get latest user profile data
    final userDoc = await _firestore.collection('users').doc(user.uid).get();
    final userData = userDoc.data();
    
    final String username = userData?['name'] ?? user.displayName ?? 'User';
    final String userAvatar = userData?['photoURL'] ?? user.photoURL ?? '';

    final newLog = RaceLog(
      userId: user.uid,
      username: username,
      userAvatar: userAvatar,
      raceYear: log.raceYear,
      raceName: log.raceName,
      raceLocation: log.raceLocation,
      round: log.round,
      countryCode: log.countryCode,
      dateWatched: log.dateWatched,
      sessionType: log.sessionType,
      watchMode: log.watchMode,
      rating: log.rating,
      review: log.review,
      tags: log.tags,
      companions: log.companions,
      driverOfTheDay: log.driverOfTheDay,
      raceWinner: log.raceWinner,
      mediaUrls: log.mediaUrls,
      spoilerWarning: log.spoilerWarning,
      visibility: log.visibility,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
    );

    final docRef = await _firestore.collection('raceLogs').add(newLog.toJson());
    
    // Update user stats
    await _updateUserStats(user.uid);

    return docRef.id;
  }

  Future<List<RaceLog>> getPublicRaceLogs({int? limit}) async {
    print('[RaceLogService] Fetching ALL public race logs');
    var query = _firestore
        .collection('raceLogs')
        .where('visibility', isEqualTo: 'public')
        .orderBy('createdAt', descending: true);
    
    // Only apply limit if specified
    if (limit != null) {
      query = query.limit(limit);
    }
    
    final snapshot = await query.get();
    print('[RaceLogService] Found ${snapshot.docs.length} public race logs');

    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }

  Future<List<RaceLog>> getHighRatedLogs({int? limit}) async {
    print('[RaceLogService] Fetching ALL high-rated logs');
    var query = _firestore
        .collection('raceLogs')
        .where('visibility', isEqualTo: 'public')
        .where('rating', isGreaterThanOrEqualTo: 4.0)
        .orderBy('rating', descending: true)
        .orderBy('createdAt', descending: true);
    
    // Only apply limit if specified
    if (limit != null) {
      query = query.limit(limit);
    }
    
    final snapshot = await query.get();
    print('[RaceLogService] Found ${snapshot.docs.length} high-rated logs');

    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }

  Future<List<RaceLog>> getUserRaceLogs(String userId) async {
    final snapshot = await _firestore
        .collection('raceLogs')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .get();

    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }

  Future<void> _updateUserStats(String userId) async {
    final logs = await getUserRaceLogs(userId);
    
    final racesWatched = logs.length;
    final reviewsCount = logs.where((l) => l.review.isNotEmpty).length;
    final totalHoursWatched = _calculateTotalHours(logs);

    await _firestore.collection('userStats').doc(userId).set({
      'racesWatched': racesWatched,
      'reviewsCount': reviewsCount,
      'totalHoursWatched': totalHoursWatched,
    }, SetOptions(merge: true));
  }

  double _calculateTotalHours(List<RaceLog> logs) {
    return logs.fold(0.0, (total, log) {
      double hours = 0;
      switch (log.sessionType) {
        case 'race': hours = 2.0; break;
        case 'sprint': hours = 0.5; break;
        case 'qualifying': hours = 1.0; break;
        case 'highlights': hours = 0.25; break;
      }
      return total + hours;
    });
  }

  /// Get ALL race logs from the collection
  Future<List<RaceLog>> getAllRaceLogs() async {
    print('[RaceLogService] Fetching ALL race logs');
    final snapshot = await _firestore
        .collection('raceLogs')
        .orderBy('createdAt', descending: true)
        .get();

    print('[RaceLogService] Found ${snapshot.docs.length} race logs');
    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }

  /// Update an existing race log
  Future<void> updateRaceLog(String logId, RaceLog updates) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    // Verify the log belongs to the current user
    final logDoc = await _firestore.collection('raceLogs').doc(logId).get();
    if (!logDoc.exists) {
      throw Exception('Race log not found');
    }
    
    final logData = logDoc.data();
    if (logData?['userId'] != user.uid) {
      throw Exception('Unauthorized: Cannot update another user\'s race log');
    }

    // Create updated log data with new updatedAt timestamp
    final updatedData = updates.toJson();
    updatedData['updatedAt'] = Timestamp.fromDate(DateTime.now());
    
    // Update the document
    await _firestore.collection('raceLogs').doc(logId).update(updatedData);
    
    // Recalculate user stats
    await _updateUserStats(user.uid);
  }

  /// Delete a race log
  Future<void> deleteRaceLog(String logId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    // Verify the log belongs to the current user
    final logDoc = await _firestore.collection('raceLogs').doc(logId).get();
    if (!logDoc.exists) {
      throw Exception('Race log not found');
    }
    
    final logData = logDoc.data();
    if (logData?['userId'] != user.uid) {
      throw Exception('Unauthorized: Cannot delete another user\'s race log');
    }

    // Delete the document
    await _firestore.collection('raceLogs').doc(logId).delete();
    
    // Recalculate user stats
    await _updateUserStats(user.uid);
  }

  /// Get race logs by year for a specific user
  Future<List<RaceLog>> getRaceLogsByYear(String userId, int year) async {
    final snapshot = await _firestore
        .collection('raceLogs')
        .where('userId', isEqualTo: userId)
        .where('raceYear', isEqualTo: year)
        .orderBy('createdAt', descending: true)
        .get();

    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }

  /// Get race logs by tag for a specific user
  Future<List<RaceLog>> getRaceLogsByTag(String userId, String tag) async {
    final snapshot = await _firestore
        .collection('raceLogs')
        .where('userId', isEqualTo: userId)
        .where('tags', arrayContains: tag)
        .orderBy('createdAt', descending: true)
        .get();

    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }
}
