/// Model representing user statistics stored in the userStats collection
/// This is separate from UserProfile and contains aggregate data
class UserStats {
  final String userId;
  final int racesWatched;
  final int reviewsCount;
  final int listsCount;
  final int followersCount;
  final int followingCount;
  final double totalHoursWatched;
  final String? favoriteDriver;
  final String? favoriteCircuit;
  final String? favoriteTeam;
  final DateTime updatedAt;

  UserStats({
    required this.userId,
    this.racesWatched = 0,
    this.reviewsCount = 0,
    this.listsCount = 0,
    this.followersCount = 0,
    this.followingCount = 0,
    this.totalHoursWatched = 0.0,
    this.favoriteDriver,
    this.favoriteCircuit,
    this.favoriteTeam,
    DateTime? updatedAt,
  }) : updatedAt = updatedAt ?? DateTime.now();

  factory UserStats.fromJson(Map<String, dynamic> json, String userId) {
    return UserStats(
      userId: userId,
      racesWatched: json['racesWatched'] ?? 0,
      reviewsCount: json['reviewsCount'] ?? 0,
      listsCount: json['listsCount'] ?? 0,
      followersCount: json['followersCount'] ?? 0,
      followingCount: json['followingCount'] ?? 0,
      totalHoursWatched: (json['totalHoursWatched'] ?? 0).toDouble(),
      favoriteDriver: json['favoriteDriver'],
      favoriteCircuit: json['favoriteCircuit'],
      favoriteTeam: json['favoriteTeam'],
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'racesWatched': racesWatched,
      'reviewsCount': reviewsCount,
      'listsCount': listsCount,
      'followersCount': followersCount,
      'followingCount': followingCount,
      'totalHoursWatched': totalHoursWatched,
      'favoriteDriver': favoriteDriver,
      'favoriteCircuit': favoriteCircuit,
      'favoriteTeam': favoriteTeam,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  UserStats copyWith({
    int? racesWatched,
    int? reviewsCount,
    int? listsCount,
    int? followersCount,
    int? followingCount,
    double? totalHoursWatched,
    String? favoriteDriver,
    String? favoriteCircuit,
    String? favoriteTeam,
    DateTime? updatedAt,
  }) {
    return UserStats(
      userId: userId,
      racesWatched: racesWatched ?? this.racesWatched,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      listsCount: listsCount ?? this.listsCount,
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount ?? this.followingCount,
      totalHoursWatched: totalHoursWatched ?? this.totalHoursWatched,
      favoriteDriver: favoriteDriver ?? this.favoriteDriver,
      favoriteCircuit: favoriteCircuit ?? this.favoriteCircuit,
      favoriteTeam: favoriteTeam ?? this.favoriteTeam,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
