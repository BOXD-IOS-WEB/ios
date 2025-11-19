import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/services/firestore_service.dart';
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

  Future<List<RaceLog>> getPublicRaceLogs({int limit = 20}) async {
    final snapshot = await _firestore
        .collection('raceLogs')
        .where('visibility', isEqualTo: 'public')
        .orderBy('createdAt', descending: true)
        .limit(limit)
        .get();

    return snapshot.docs
        .map((doc) => RaceLog.fromJson(doc.data(), doc.id))
        .toList();
  }

  Future<List<RaceLog>> getHighRatedLogs({int limit = 10}) async {
    final snapshot = await _firestore
        .collection('raceLogs')
        .where('visibility', isEqualTo: 'public')
        .where('rating', isGreaterThanOrEqualTo: 4.0)
        .orderBy('rating', descending: true)
        .orderBy('createdAt', descending: true)
        .limit(limit)
        .get();

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
}
