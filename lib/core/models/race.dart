class Race {
  final int season;
  final int round;
  final String gpName;
  final String circuit;
  final DateTime date;
  final String? country;
  final String? posterUrl;
  final String? winner;
  final double? rating;
  final bool watched;

  Race({
    required this.season,
    required this.round,
    required this.gpName,
    required this.circuit,
    required this.date,
    this.country,
    this.posterUrl,
    this.winner,
    this.rating,
    this.watched = false,
  });
}
