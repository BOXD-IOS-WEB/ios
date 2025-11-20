class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? photoUrl;
  final String? description;
  final int racesWatched;
  final int followers;
  final int following;
  final double hoursWatched;
  final String? favoriteDriver;
  final String? favoriteTeam;
  final String? favoriteCircuit;
  final bool onboardingCompleted;
  final bool privateAccount;
  final bool showActivityStatus;
  final bool emailNotifications;
  final bool pushNotifications;
  final bool likesCommentsNotifications;
  final bool followersNotifications;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.photoUrl,
    this.description,
    this.racesWatched = 0,
    this.followers = 0,
    this.following = 0,
    this.hoursWatched = 0,
    this.favoriteDriver,
    this.favoriteTeam,
    this.favoriteCircuit,
    this.onboardingCompleted = false,
    this.privateAccount = false,
    this.showActivityStatus = true,
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.likesCommentsNotifications = true,
    this.followersNotifications = true,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json, String id) {
    return UserProfile(
      id: id,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      photoUrl: json['photoURL'] ?? json['profile_image_url'],
      description: json['description'],
      racesWatched: json['racesWatched'] ?? 0,
      followers: json['followersCount'] ?? 0,
      following: json['followingCount'] ?? 0,
      hoursWatched: (json['totalHoursWatched'] ?? 0).toDouble(),
      favoriteDriver: json['favoriteDriver'],
      favoriteTeam: json['favoriteTeam'],
      favoriteCircuit: json['favoriteCircuit'],
      onboardingCompleted: json['onboardingCompleted'] ?? false,
      privateAccount: json['privateAccount'] ?? false,
      showActivityStatus: json['showActivityStatus'] ?? true,
      emailNotifications: json['emailNotifications'] ?? true,
      pushNotifications: json['pushNotifications'] ?? true,
      likesCommentsNotifications: json['likesCommentsNotifications'] ?? true,
      followersNotifications: json['followersNotifications'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'photoURL': photoUrl,
      'description': description,
      'favoriteDriver': favoriteDriver,
      'favoriteTeam': favoriteTeam,
      'favoriteCircuit': favoriteCircuit,
      'onboardingCompleted': onboardingCompleted,
      'privateAccount': privateAccount,
      'showActivityStatus': showActivityStatus,
      'emailNotifications': emailNotifications,
      'pushNotifications': pushNotifications,
      'likesCommentsNotifications': likesCommentsNotifications,
      'followersNotifications': followersNotifications,
    };
  }
  
  UserProfile copyWith({
    String? name,
    String? email,
    String? photoUrl,
    String? description,
    int? racesWatched,
    int? followers,
    int? following,
    double? hoursWatched,
    String? favoriteDriver,
    String? favoriteTeam,
    String? favoriteCircuit,
    bool? onboardingCompleted,
    bool? privateAccount,
    bool? showActivityStatus,
    bool? emailNotifications,
    bool? pushNotifications,
    bool? likesCommentsNotifications,
    bool? followersNotifications,
  }) {
    return UserProfile(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      photoUrl: photoUrl ?? this.photoUrl,
      description: description ?? this.description,
      racesWatched: racesWatched ?? this.racesWatched,
      followers: followers ?? this.followers,
      following: following ?? this.following,
      hoursWatched: hoursWatched ?? this.hoursWatched,
      favoriteDriver: favoriteDriver ?? this.favoriteDriver,
      favoriteTeam: favoriteTeam ?? this.favoriteTeam,
      favoriteCircuit: favoriteCircuit ?? this.favoriteCircuit,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      privateAccount: privateAccount ?? this.privateAccount,
      showActivityStatus: showActivityStatus ?? this.showActivityStatus,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      likesCommentsNotifications: likesCommentsNotifications ?? this.likesCommentsNotifications,
      followersNotifications: followersNotifications ?? this.followersNotifications,
    );
  }
}
