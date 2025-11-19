import 'package:cloud_firestore/cloud_firestore.dart';

class Activity {
  final String? id;
  final String userId;
  final String username;
  final String? userAvatar;
  final String type; // 'log', 'review', 'like', 'list', 'follow'
  final String targetId;
  final String targetType; // 'raceLog', 'list', 'user'
  final String? content;
  final DateTime createdAt;

  Activity({
    this.id,
    required this.userId,
    required this.username,
    this.userAvatar,
    required this.type,
    required this.targetId,
    required this.targetType,
    this.content,
    required this.createdAt,
  });

  factory Activity.fromJson(Map<String, dynamic> json, String id) {
    return Activity(
      id: id,
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'User',
      userAvatar: json['userAvatar'],
      type: json['type'] ?? 'log',
      targetId: json['targetId'] ?? '',
      targetType: json['targetType'] ?? 'raceLog',
      content: json['content'],
      createdAt: (json['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'userAvatar': userAvatar,
      'type': type,
      'targetId': targetId,
      'targetType': targetType,
      'content': content,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
