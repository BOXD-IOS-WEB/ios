import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AppNotification {
  final String? id;
  final String userId;
  final String actorId;
  final String actorName;
  final String type; // 'like', 'comment', 'follow'
  final String content;
  final String linkTo;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    this.id,
    required this.userId,
    required this.actorId,
    required this.actorName,
    required this.type,
    required this.content,
    required this.linkTo,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json, String id) {
    DateTime createdAt;
    if (json['createdAt'] is Timestamp) {
      createdAt = (json['createdAt'] as Timestamp).toDate();
    } else if (json['createdAt'] is String) {
      createdAt = DateTime.parse(json['createdAt']);
    } else {
      createdAt = DateTime.now();
    }

    return AppNotification(
      id: id,
      userId: json['userId'] ?? '',
      actorId: json['actorId'] ?? '',
      actorName: json['actorName'] ?? '',
      type: json['type'] ?? '',
      content: json['content'] ?? '',
      linkTo: json['linkTo'] ?? '',
      isRead: json['isRead'] ?? false,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'actorId': actorId,
      'actorName': actorName,
      'type': type,
      'content': content,
      'linkTo': linkTo,
      'isRead': isRead,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

class NotificationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Create a notification
  Future<void> createNotification({
    required String userId,
    required String actorId,
    required String actorName,
    required String type,
    required String content,
    required String linkTo,
  }) async {
    print('[NotificationService] Creating notification for user: $userId');

    final notification = AppNotification(
      userId: userId,
      actorId: actorId,
      actorName: actorName,
      type: type,
      content: content,
      linkTo: linkTo,
      createdAt: DateTime.now(),
    );

    await _firestore.collection('notifications').add(notification.toJson());
    print('[NotificationService] Notification created');
  }

  /// Get user's notifications
  Future<List<AppNotification>> getUserNotifications({int? limit}) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[NotificationService] Fetching ALL notifications for user: ${user.uid}');

    var query = _firestore
        .collection('notifications')
        .where('userId', isEqualTo: user.uid)
        .orderBy('createdAt', descending: true);
    
    // Only apply limit if specified
    if (limit != null) {
      query = query.limit(limit);
    }
    
    final snapshot = await query.get();

    print('[NotificationService] Found ${snapshot.docs.length} notifications');
    return snapshot.docs
        .map((doc) => AppNotification.fromJson(doc.data(), doc.id))
        .toList();
  }

  /// Get unread notifications count
  Future<int> getUnreadCount() async {
    final user = _auth.currentUser;
    if (user == null) return 0;

    final snapshot = await _firestore
        .collection('notifications')
        .where('userId', isEqualTo: user.uid)
        .where('isRead', isEqualTo: false)
        .get();

    return snapshot.docs.length;
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    print('[NotificationService] Marking notification as read: $notificationId');
    await _firestore.collection('notifications').doc(notificationId).update({
      'isRead': true,
    });
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[NotificationService] Marking all notifications as read');

    final snapshot = await _firestore
        .collection('notifications')
        .where('userId', isEqualTo: user.uid)
        .where('isRead', isEqualTo: false)
        .get();

    final batch = _firestore.batch();
    for (var doc in snapshot.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();

    print('[NotificationService] Marked ${snapshot.docs.length} notifications as read');
  }

  /// Delete a notification
  Future<void> deleteNotification(String notificationId) async {
    print('[NotificationService] Deleting notification: $notificationId');
    await _firestore.collection('notifications').doc(notificationId).delete();
  }

  /// Delete all notifications
  Future<void> deleteAllNotifications() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[NotificationService] Deleting all notifications');

    final snapshot = await _firestore
        .collection('notifications')
        .where('userId', isEqualTo: user.uid)
        .get();

    final batch = _firestore.batch();
    for (var doc in snapshot.docs) {
      batch.delete(doc.reference);
    }
    await batch.commit();

    print('[NotificationService] Deleted ${snapshot.docs.length} notifications');
  }

  /// Get ALL notifications from the collection (admin/debug use)
  Future<List<AppNotification>> getAllNotifications() async {
    print('[NotificationService] Fetching ALL notifications');
    final snapshot = await _firestore
        .collection('notifications')
        .orderBy('createdAt', descending: true)
        .get();

    print('[NotificationService] Found ${snapshot.docs.length} notifications');
    return snapshot.docs
        .map((doc) => AppNotification.fromJson(doc.data(), doc.id))
        .toList();
  }
}
