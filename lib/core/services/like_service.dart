import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class LikeService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Like a race log
  Future<void> likeRaceLog(String raceLogId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[LikeService] Liking race log: $raceLogId');

    // Check if already liked
    final existingLike = await _firestore
        .collection('likes')
        .where('userId', isEqualTo: user.uid)
        .where('raceLogId', isEqualTo: raceLogId)
        .get();

    if (existingLike.docs.isNotEmpty) {
      print('[LikeService] Already liked');
      return;
    }

    // Create like document
    await _firestore.collection('likes').add({
      'userId': user.uid,
      'raceLogId': raceLogId,
      'createdAt': FieldValue.serverTimestamp(),
    });

    // Update race log likes count
    await _firestore.collection('raceLogs').doc(raceLogId).update({
      'likesCount': FieldValue.increment(1),
      'likedBy': FieldValue.arrayUnion([user.uid]),
    });

    print('[LikeService] Like added successfully');
  }

  /// Unlike a race log
  Future<void> unlikeRaceLog(String raceLogId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[LikeService] Unliking race log: $raceLogId');

    // Find and delete like document
    final likes = await _firestore
        .collection('likes')
        .where('userId', isEqualTo: user.uid)
        .where('raceLogId', isEqualTo: raceLogId)
        .get();

    if (likes.docs.isEmpty) {
      print('[LikeService] Like not found');
      return;
    }

    await _firestore.collection('likes').doc(likes.docs.first.id).delete();

    // Update race log likes count
    await _firestore.collection('raceLogs').doc(raceLogId).update({
      'likesCount': FieldValue.increment(-1),
      'likedBy': FieldValue.arrayRemove([user.uid]),
    });

    print('[LikeService] Like removed successfully');
  }

  /// Check if user has liked a race log
  Future<bool> hasLiked(String raceLogId) async {
    final user = _auth.currentUser;
    if (user == null) return false;

    final likes = await _firestore
        .collection('likes')
        .where('userId', isEqualTo: user.uid)
        .where('raceLogId', isEqualTo: raceLogId)
        .get();

    return likes.docs.isNotEmpty;
  }

  /// Get users who liked a race log
  Future<List<String>> getLikedByUsers(String raceLogId) async {
    final likes = await _firestore
        .collection('likes')
        .where('raceLogId', isEqualTo: raceLogId)
        .get();

    return likes.docs.map((doc) => doc['userId'] as String).toList();
  }

  /// Get ALL likes from the collection
  Future<List<Map<String, dynamic>>> getAllLikes() async {
    print('[LikeService] Fetching ALL likes');
    final snapshot = await _firestore
        .collection('likes')
        .orderBy('createdAt', descending: true)
        .get();

    print('[LikeService] Found ${snapshot.docs.length} likes');
    return snapshot.docs.map((doc) => {
      'id': doc.id,
      ...doc.data(),
    }).toList();
  }
}
