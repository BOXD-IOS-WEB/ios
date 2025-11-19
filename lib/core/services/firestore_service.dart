import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/user_profile.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<void> createUserProfile(String uid, String name, String email) async {
    final userRef = _firestore.collection('users').doc(uid);
    final statsRef = _firestore.collection('userStats').doc(uid);

    await userRef.set({
      'name': name,
      'email': email,
      'description': '',
      'photoURL': '',
      'created_at': FieldValue.serverTimestamp(),
      'updated_at': FieldValue.serverTimestamp(),
    });

    await statsRef.set({
      'racesWatched': 0,
      'reviewsCount': 0,
      'listsCount': 0,
      'followersCount': 0,
      'followingCount': 0,
      'totalHoursWatched': 0,
      'favoriteDriver': '',
      'favoriteCircuit': '',
      'favoriteTeam': '',
    });
  }

  Future<UserProfile?> getUserProfile(String uid) async {
    try {
      final userDoc = await _firestore.collection('users').doc(uid).get();
      final statsDoc = await _firestore.collection('userStats').doc(uid).get();

      if (userDoc.exists) {
        final userData = userDoc.data()!;
        final statsData = statsDoc.exists ? statsDoc.data()! : <String, dynamic>{};

        // Merge data for the model
        final mergedData = {
          ...userData,
          ...statsData,
        };

        return UserProfile.fromJson(mergedData, uid);
      }
      return null;
    } catch (e) {
      print('Error getting user profile: $e');
      return null;
    }
  }

  Future<void> updateUserProfile(String uid, Map<String, dynamic> data) async {
    await _firestore.collection('users').doc(uid).update({
      ...data,
      'updated_at': FieldValue.serverTimestamp(),
    });
  }

  Future<void> updateUserStats(String uid, Map<String, dynamic> stats) async {
    await _firestore.collection('userStats').doc(uid).update({
      ...stats,
      'updated_at': FieldValue.serverTimestamp(),
    });
  }
}
