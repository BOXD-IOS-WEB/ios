import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/activity.dart';
import 'package:boxboxd/core/services/auth_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ActivityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<void> createActivity({
    required String type,
    required String targetId,
    required String targetType,
    String? content,
  }) async {
    final user = _auth.currentUser;
    if (user == null) return;

    // Fetch latest user profile data
    String username = user.displayName ?? 'User';
    String? userAvatar = user.photoURL;

    try {
      final userDoc = await _firestore.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        final data = userDoc.data()!;
        username = data['name'] ?? username;
        userAvatar = data['photoURL'] ?? userAvatar;
      }
    } catch (e) {
      print('Error fetching user profile for activity: $e');
    }

    final activity = Activity(
      userId: user.uid,
      username: username,
      userAvatar: userAvatar,
      type: type,
      targetId: targetId,
      targetType: targetType,
      content: content,
      createdAt: DateTime.now(),
    );

    await _firestore.collection('activities').add(activity.toJson());
  }

  Future<List<Activity>> getUserActivity(String userId, {int? limit}) async {
    print('[ActivityService] Fetching ALL activities for user: $userId');
    var query = _firestore
        .collection('activities')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true);
    
    // Only apply limit if specified
    if (limit != null) {
      query = query.limit(limit);
    }
    
    final snapshot = await query.get();
    print('[ActivityService] Found ${snapshot.docs.length} activities');

    return snapshot.docs
        .map((doc) => Activity.fromJson(doc.data(), doc.id))
        .toList();
  }

  Future<List<Activity>> getGlobalActivity({int? limit}) async {
    print('[ActivityService] Fetching ALL global activities');
    var query = _firestore
        .collection('activities')
        .orderBy('createdAt', descending: true);
    
    // Only apply limit if specified
    if (limit != null) {
      query = query.limit(limit);
    }
    
    final snapshot = await query.get();
    print('[ActivityService] Found ${snapshot.docs.length} activities');

    return snapshot.docs
        .map((doc) => Activity.fromJson(doc.data(), doc.id))
        .toList();
  }

  // Note: Firestore doesn't support "IN" queries with more than 10 items or across collections easily for feeds.
  // For a real scalable feed, we'd fan-out activities to user feeds or use a dedicated feed service.
  // For this migration, we'll implement a simple client-side merge or limit to global/user for now,
  // or implement the batching logic if we have the following list.
  // We'll start with Global Activity as the default feed for now as per many MVPs.

  /// Get ALL activities from the collection
  Future<List<Activity>> getAllActivities() async {
    print('[ActivityService] Fetching ALL activities');
    final snapshot = await _firestore
        .collection('activities')
        .orderBy('createdAt', descending: true)
        .get();

    print('[ActivityService] Found ${snapshot.docs.length} activities');
    return snapshot.docs
        .map((doc) => Activity.fromJson(doc.data(), doc.id))
        .toList();
  }
}
