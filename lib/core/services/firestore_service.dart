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
      'privateAccount': false,
      'showActivityStatus': true,
      'emailNotifications': true,
      'pushNotifications': true,
      'likesCommentsNotifications': true,
      'followersNotifications': true,
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

  /// Get ALL users from the collection
  Future<List<UserProfile>> getAllUsers() async {
    print('[FirestoreService] Fetching ALL users');
    final snapshot = await _firestore
        .collection('users')
        .get();

    print('[FirestoreService] Found ${snapshot.docs.length} users');
    
    final users = <UserProfile>[];
    for (var doc in snapshot.docs) {
      try {
        final statsDoc = await _firestore.collection('userStats').doc(doc.id).get();
        final userData = doc.data();
        final statsData = statsDoc.exists ? statsDoc.data()! : <String, dynamic>{};
        
        final mergedData = {
          ...userData,
          ...statsData,
        };
        
        users.add(UserProfile.fromJson(mergedData, doc.id));
      } catch (e) {
        print('[FirestoreService] Error loading user ${doc.id}: $e');
      }
    }
    
    return users;
  }

  /// Get ALL userStats from the collection
  Future<List<Map<String, dynamic>>> getAllUserStats() async {
    print('[FirestoreService] Fetching ALL userStats');
    final snapshot = await _firestore
        .collection('userStats')
        .get();

    print('[FirestoreService] Found ${snapshot.docs.length} userStats');
    return snapshot.docs.map((doc) => {
      'id': doc.id,
      ...doc.data(),
    }).toList();
  }
}
