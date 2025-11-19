import 'package:cloud_firestore/cloud_firestore.dart';

class RaceLog {
  final String? id;
  final String userId;
  final String username;
  final String? userAvatar;
  final int raceYear;
  final String raceName;
  final String raceLocation;
  final int? round;
  final String? countryCode;
  final DateTime dateWatched;
  final String sessionType; // 'race', 'sprint', 'qualifying', etc.
  final String watchMode; // 'live', 'replay', etc.
  final double rating;
  final String review;
  final List<String> tags;
  final List<String> companions;
  final String? driverOfTheDay;
  final String? raceWinner;
  final List<String> mediaUrls;
  final bool spoilerWarning;
  final String visibility; // 'public', 'private', 'friends'
  final DateTime createdAt;
  final DateTime updatedAt;
  final int likesCount;
  final int commentsCount;
  final List<String> likedBy;

  RaceLog({
    this.id,
    required this.userId,
    required this.username,
    this.userAvatar,
    required this.raceYear,
    required this.raceName,
    required this.raceLocation,
    this.round,
    this.countryCode,
    required this.dateWatched,
    required this.sessionType,
    required this.watchMode,
    required this.rating,
    required this.review,
    required this.tags,
    required this.companions,
    this.driverOfTheDay,
    this.raceWinner,
    required this.mediaUrls,
    required this.spoilerWarning,
    required this.visibility,
    required this.createdAt,
    required this.updatedAt,
    required this.likesCount,
    required this.commentsCount,
    required this.likedBy,
  });

  factory RaceLog.fromJson(Map<String, dynamic> json, String id) {
    return RaceLog(
      id: id,
      userId: json['userId'] as String,
      username: json['username'] as String,
      userAvatar: json['userAvatar'] as String?,
      raceYear: json['raceYear'] as int,
      raceName: json['raceName'] as String,
      raceLocation: json['raceLocation'] as String,
      round: json['round'] as int?,
      countryCode: json['countryCode'] as String?,
      dateWatched: (json['dateWatched'] as Timestamp).toDate(),
      sessionType: json['sessionType'] as String,
      watchMode: json['watchMode'] as String,
      rating: (json['rating'] as num).toDouble(),
      review: json['review'] as String,
      tags: List<String>.from(json['tags'] ?? []),
      companions: List<String>.from(json['companions'] ?? []),
      driverOfTheDay: json['driverOfTheDay'] as String?,
      raceWinner: json['raceWinner'] as String?,
      mediaUrls: List<String>.from(json['mediaUrls'] ?? []),
      spoilerWarning: json['spoilerWarning'] as bool? ?? false,
      visibility: json['visibility'] as String? ?? 'public',
      createdAt: (json['createdAt'] as Timestamp).toDate(),
      updatedAt: (json['updatedAt'] as Timestamp).toDate(),
      likesCount: json['likesCount'] as int? ?? 0,
      commentsCount: json['commentsCount'] as int? ?? 0,
      likedBy: List<String>.from(json['likedBy'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'userAvatar': userAvatar,
      'raceYear': raceYear,
      'raceName': raceName,
      'raceLocation': raceLocation,
      'round': round,
      'countryCode': countryCode,
      'dateWatched': Timestamp.fromDate(dateWatched),
      'sessionType': sessionType,
      'watchMode': watchMode,
      'rating': rating,
      'review': review,
      'tags': tags,
      'companions': companions,
      'driverOfTheDay': driverOfTheDay,
      'raceWinner': raceWinner,
      'mediaUrls': mediaUrls,
      'spoilerWarning': spoilerWarning,
      'visibility': visibility,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'likesCount': likesCount,
      'commentsCount': commentsCount,
      'likedBy': likedBy,
    };
  }
}
