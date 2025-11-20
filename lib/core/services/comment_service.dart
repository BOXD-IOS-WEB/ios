import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class Comment {
  final String? id;
  final String userId;
  final String username;
  final String userAvatar;
  final String raceLogId;
  final String content;
  final DateTime createdAt;
  final int likesCount;
  final List<String> likedBy;

  Comment({
    this.id,
    required this.userId,
    required this.username,
    required this.userAvatar,
    required this.raceLogId,
    required this.content,
    required this.createdAt,
    this.likesCount = 0,
    this.likedBy = const [],
  });

  factory Comment.fromJson(Map<String, dynamic> json, String id) {
    return Comment(
      id: id,
      userId: json['userId'] ?? '',
      username: json['username'] ?? '',
      userAvatar: json['userAvatar'] ?? '',
      raceLogId: json['raceLogId'] ?? '',
      content: json['content'] ?? '',
      createdAt: (json['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      likesCount: json['likesCount'] ?? 0,
      likedBy: List<String>.from(json['likedBy'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'userAvatar': userAvatar,
      'raceLogId': raceLogId,
      'content': content,
      'createdAt': Timestamp.fromDate(createdAt),
      'likesCount': likesCount,
      'likedBy': likedBy,
    };
  }
}

class CommentService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Add a comment to a race log
  Future<String> addComment(String raceLogId, String content) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[CommentService] Adding comment to race log: $raceLogId');

    // Get user profile for username and avatar
    String username = user.displayName ?? 'User';
    String userAvatar = user.photoURL ?? '';

    try {
      final userDoc = await _firestore.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        final data = userDoc.data()!;
        username = data['name'] ?? username;
        userAvatar = data['photoURL'] ?? userAvatar;
      }
    } catch (e) {
      print('[CommentService] Error fetching user profile: $e');
    }

    final comment = Comment(
      userId: user.uid,
      username: username,
      userAvatar: userAvatar,
      raceLogId: raceLogId,
      content: content,
      createdAt: DateTime.now(),
    );

    final docRef = await _firestore.collection('comments').add(comment.toJson());

    // Try to update race log comments count (may not exist for race comments)
    try {
      await _firestore.collection('raceLogs').doc(raceLogId).update({
        'commentsCount': FieldValue.increment(1),
      });
    } catch (e) {
      print('[CommentService] Note: Could not update race log count (may be a race comment): $e');
      // This is OK - the comment was still created successfully
    }

    print('[CommentService] Comment added with ID: ${docRef.id}');
    return docRef.id;
  }

  /// Get comments for a race log
  Future<List<Comment>> getComments(String raceLogId) async {
    print('[CommentService] Fetching comments for race log: $raceLogId');

    final snapshot = await _firestore
        .collection('comments')
        .where('raceLogId', isEqualTo: raceLogId)
        .orderBy('createdAt', descending: false)
        .get();

    print('[CommentService] Found ${snapshot.docs.length} comments');
    return snapshot.docs.map((doc) => Comment.fromJson(doc.data(), doc.id)).toList();
  }

  /// Delete a comment
  Future<void> deleteComment(String commentId, String raceLogId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[CommentService] Deleting comment: $commentId');

    await _firestore.collection('comments').doc(commentId).delete();

    // Update race log comments count
    await _firestore.collection('raceLogs').doc(raceLogId).update({
      'commentsCount': FieldValue.increment(-1),
    });

    print('[CommentService] Comment deleted');
  }

  /// Like a comment
  Future<void> likeComment(String commentId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    await _firestore.collection('comments').doc(commentId).update({
      'likesCount': FieldValue.increment(1),
      'likedBy': FieldValue.arrayUnion([user.uid]),
    });
  }

  /// Unlike a comment
  Future<void> unlikeComment(String commentId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    await _firestore.collection('comments').doc(commentId).update({
      'likesCount': FieldValue.increment(-1),
      'likedBy': FieldValue.arrayRemove([user.uid]),
    });
  }

  /// Get ALL comments from the collection
  Future<List<Comment>> getAllComments() async {
    print('[CommentService] Fetching ALL comments');
    final snapshot = await _firestore
        .collection('comments')
        .orderBy('createdAt', descending: true)
        .get();

    print('[CommentService] Found ${snapshot.docs.length} comments');
    return snapshot.docs.map((doc) => Comment.fromJson(doc.data(), doc.id)).toList();
  }
}
