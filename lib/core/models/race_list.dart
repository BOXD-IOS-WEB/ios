import 'package:cloud_firestore/cloud_firestore.dart';

class RaceListItem {
  final int raceYear;
  final String raceName;
  final String raceLocation;
  final String? countryCode;
  final int order;
  final String? note;
  final int? round;
  final DateTime? date;

  RaceListItem({
    required this.raceYear,
    required this.raceName,
    required this.raceLocation,
    this.countryCode,
    required this.order,
    this.note,
    this.round,
    this.date,
  });

  factory RaceListItem.fromJson(Map<String, dynamic> json) {
    return RaceListItem(
      raceYear: json['raceYear'] as int,
      raceName: json['raceName'] as String,
      raceLocation: json['raceLocation'] as String,
      countryCode: json['countryCode'] as String?,
      order: json['order'] as int,
      note: json['note'] as String?,
      round: json['round'] as int?,
      date: json['date'] != null ? (json['date'] is Timestamp ? (json['date'] as Timestamp).toDate() : DateTime.tryParse(json['date'].toString())) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'raceYear': raceYear,
      'raceName': raceName,
      'raceLocation': raceLocation,
      'countryCode': countryCode,
      'order': order,
      'note': note,
      'round': round,
      'date': date?.toIso8601String(),
    };
  }
}

class RaceList {
  final String id;
  final String userId;
  final String username;
  final String? userProfileImageUrl;
  final String title;
  final String description;
  final List<RaceListItem> races;
  final bool isPublic;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int likesCount;
  final int commentsCount;

  RaceList({
    required this.id,
    required this.userId,
    required this.username,
    this.userProfileImageUrl,
    required this.title,
    required this.description,
    required this.races,
    required this.isPublic,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    this.likesCount = 0,
    this.commentsCount = 0,
  });

  factory RaceList.fromJson(Map<String, dynamic> json, String id) {
    return RaceList(
      id: id,
      userId: json['userId'] as String,
      username: json['username'] as String,
      userProfileImageUrl: json['userProfileImageUrl'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      races: (json['races'] as List<dynamic>?)
              ?.map((e) => RaceListItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      isPublic: json['isPublic'] as bool,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      createdAt: (json['createdAt'] as Timestamp).toDate(),
      updatedAt: (json['updatedAt'] as Timestamp).toDate(),
      likesCount: json['likesCount'] as int? ?? 0,
      commentsCount: json['commentsCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'userProfileImageUrl': userProfileImageUrl,
      'title': title,
      'description': description,
      'races': races.map((e) => e.toJson()).toList(),
      'isPublic': isPublic,
      'tags': tags,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'likesCount': likesCount,
      'commentsCount': commentsCount,
    };
  }
  
  RaceList copyWith({
    String? title,
    String? description,
    List<RaceListItem>? races,
    bool? isPublic,
    List<String>? tags,
    DateTime? updatedAt,
  }) {
    return RaceList(
      id: id,
      userId: userId,
      username: username,
      userProfileImageUrl: userProfileImageUrl,
      title: title ?? this.title,
      description: description ?? this.description,
      races: races ?? this.races,
      isPublic: isPublic ?? this.isPublic,
      tags: tags ?? this.tags,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      likesCount: likesCount,
      commentsCount: commentsCount,
    );
  }
}
