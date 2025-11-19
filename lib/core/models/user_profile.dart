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
    );
  }
}
