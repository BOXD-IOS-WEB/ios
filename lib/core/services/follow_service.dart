import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:boxboxd/core/services/activity_service.dart';

class FollowService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ActivityService _activityService = ActivityService();

  Future<void> followUser(String userIdToFollow) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');
    if (user.uid == userIdToFollow) throw Exception('Cannot follow yourself');

    final existingFollow = await _firestore
        .collection('follows')
        .where('followerId', isEqualTo: user.uid)
        .where('followingId', isEqualTo: userIdToFollow)
        .get();

    if (existingFollow.docs.isNotEmpty) {
      throw Exception('Already following this user');
    }

    // Create follow document
    await _firestore.collection('follows').add({
      'followerId': user.uid,
      'followingId': userIdToFollow,
      'createdAt': FieldValue.serverTimestamp(),
    });

    // Update stats
    final batch = _firestore.batch();
    
    final followerStatsRef = _firestore.collection('userStats').doc(user.uid);
    batch.set(followerStatsRef, {
      'followingCount': FieldValue.increment(1)
    }, SetOptions(merge: true));

    final followingStatsRef = _firestore.collection('userStats').doc(userIdToFollow);
    batch.set(followingStatsRef, {
      'followersCount': FieldValue.increment(1)
    }, SetOptions(merge: true));

    await batch.commit();

    // Create activity
    await _activityService.createActivity(
      type: 'follow',
      targetId: userIdToFollow,
      targetType: 'user',
    );
  }

  Future<void> unfollowUser(String userIdToUnfollow) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    final follows = await _firestore
        .collection('follows')
        .where('followerId', isEqualTo: user.uid)
        .where('followingId', isEqualTo: userIdToUnfollow)
        .get();

    if (follows.docs.isEmpty) {
      throw Exception('Not following this user');
    }

    // Delete follow document
    await _firestore.collection('follows').doc(follows.docs.first.id).delete();

    // Update stats
    final batch = _firestore.batch();
    
    final followerStatsRef = _firestore.collection('userStats').doc(user.uid);
    batch.set(followerStatsRef, {
      'followingCount': FieldValue.increment(-1)
    }, SetOptions(merge: true));

    final followingStatsRef = _firestore.collection('userStats').doc(userIdToUnfollow);
    batch.set(followingStatsRef, {
      'followersCount': FieldValue.increment(-1)
    }, SetOptions(merge: true));

    await batch.commit();
  }

  Future<bool> isFollowing(String userId) async {
    final user = _auth.currentUser;
    if (user == null) return false;

    final follows = await _firestore
        .collection('follows')
        .where('followerId', isEqualTo: user.uid)
        .where('followingId', isEqualTo: userId)
        .get();

    return follows.docs.isNotEmpty;
  }

  Future<List<String>> getFollowingIds(String userId) async {
    final follows = await _firestore
        .collection('follows')
        .where('followerId', isEqualTo: userId)
        .get();
    
    return follows.docs.map((doc) => doc['followingId'] as String).toList();
  }
}
