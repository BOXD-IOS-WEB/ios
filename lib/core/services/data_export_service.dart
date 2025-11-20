import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class DataExportService {
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  DataExportService({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  /// Export all user data as JSON
  Future<Map<String, dynamic>> exportUserData() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[DataExportService] Starting data export for user: ${user.uid}');

    final exportData = <String, dynamic>{
      'exportDate': DateTime.now().toIso8601String(),
      'userId': user.uid,
      'email': user.email,
    };

    // Export user profile
    try {
      final userDoc = await _firestore.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        exportData['profile'] = sanitizeData(userDoc.data()!);
      }
    } catch (e) {
      print('[DataExportService] Error exporting profile: $e');
      exportData['profile'] = {'error': e.toString()};
    }

    // Export user stats
    try {
      final statsDoc = await _firestore.collection('userStats').doc(user.uid).get();
      if (statsDoc.exists) {
        exportData['stats'] = sanitizeData(statsDoc.data()!);
      }
    } catch (e) {
      print('[DataExportService] Error exporting stats: $e');
      exportData['stats'] = {'error': e.toString()};
    }

    // Export race logs
    try {
      final logsSnapshot = await _firestore
          .collection('raceLogs')
          .where('userId', isEqualTo: user.uid)
          .get();
      
      exportData['raceLogs'] = logsSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${logsSnapshot.docs.length} race logs');
    } catch (e) {
      print('[DataExportService] Error exporting race logs: $e');
      exportData['raceLogs'] = [];
    }

    // Export lists
    try {
      final listsSnapshot = await _firestore
          .collection('lists')
          .where('userId', isEqualTo: user.uid)
          .get();
      
      exportData['lists'] = listsSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${listsSnapshot.docs.length} lists');
    } catch (e) {
      print('[DataExportService] Error exporting lists: $e');
      exportData['lists'] = [];
    }

    // Export comments
    try {
      final commentsSnapshot = await _firestore
          .collection('comments')
          .where('userId', isEqualTo: user.uid)
          .get();
      
      exportData['comments'] = commentsSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${commentsSnapshot.docs.length} comments');
    } catch (e) {
      print('[DataExportService] Error exporting comments: $e');
      exportData['comments'] = [];
    }

    // Export notifications
    try {
      final notificationsSnapshot = await _firestore
          .collection('notifications')
          .where('userId', isEqualTo: user.uid)
          .get();
      
      exportData['notifications'] = notificationsSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${notificationsSnapshot.docs.length} notifications');
    } catch (e) {
      print('[DataExportService] Error exporting notifications: $e');
      exportData['notifications'] = [];
    }

    // Export watchlist
    try {
      final watchlistSnapshot = await _firestore
          .collection('watchlist')
          .where('userId', isEqualTo: user.uid)
          .get();
      
      exportData['watchlist'] = watchlistSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${watchlistSnapshot.docs.length} watchlist items');
    } catch (e) {
      print('[DataExportService] Error exporting watchlist: $e');
      exportData['watchlist'] = [];
    }

    // Export activities
    try {
      final activitiesSnapshot = await _firestore
          .collection('activities')
          .where('userId', isEqualTo: user.uid)
          .get();
      
      exportData['activities'] = activitiesSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${activitiesSnapshot.docs.length} activities');
    } catch (e) {
      print('[DataExportService] Error exporting activities: $e');
      exportData['activities'] = [];
    }

    // Export follows (following)
    try {
      final followingSnapshot = await _firestore
          .collection('follows')
          .where('followerId', isEqualTo: user.uid)
          .get();
      
      exportData['following'] = followingSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${followingSnapshot.docs.length} following');
    } catch (e) {
      print('[DataExportService] Error exporting following: $e');
      exportData['following'] = [];
    }

    // Export followers
    try {
      final followersSnapshot = await _firestore
          .collection('follows')
          .where('followingId', isEqualTo: user.uid)
          .get();
      
      exportData['followers'] = followersSnapshot.docs
          .map((doc) => {
                'id': doc.id,
                ...sanitizeData(doc.data()),
              })
          .toList();
      
      print('[DataExportService] Exported ${followersSnapshot.docs.length} followers');
    } catch (e) {
      print('[DataExportService] Error exporting followers: $e');
      exportData['followers'] = [];
    }

    print('[DataExportService] Data export complete');
    return exportData;
  }

  /// Convert data to JSON string with pretty formatting
  String exportToJsonString(Map<String, dynamic> data) {
    const encoder = JsonEncoder.withIndent('  ');
    return encoder.convert(data);
  }

  /// Sanitize Firestore data by converting Timestamps to ISO strings
  @visibleForTesting
  Map<String, dynamic> sanitizeData(Map<String, dynamic> data) {
    final sanitized = <String, dynamic>{};
    
    data.forEach((key, value) {
      if (value is Timestamp) {
        sanitized[key] = value.toDate().toIso8601String();
      } else if (value is Map) {
        sanitized[key] = sanitizeData(Map<String, dynamic>.from(value));
      } else if (value is List) {
        sanitized[key] = value.map((item) {
          if (item is Map) {
            return sanitizeData(Map<String, dynamic>.from(item));
          } else if (item is Timestamp) {
            return item.toDate().toIso8601String();
          }
          return item;
        }).toList();
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }
}
