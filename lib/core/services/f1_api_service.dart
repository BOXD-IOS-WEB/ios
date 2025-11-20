import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/race.dart';

class F1ApiService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Fetch ALL races from Firebase f1_races collection
  Future<List<Race>> getAllRaces() async {
    try {
      print('[F1ApiService] Fetching ALL races from Firebase');
      
      // Query ALL races from f1_races collection (no orderBy to avoid index requirement)
      final snapshot = await _firestore
          .collection('f1_races')
          .get();

      print('[F1ApiService] Found ${snapshot.docs.length} total races');

      if (snapshot.docs.isEmpty) {
        print('[F1ApiService] No races found in Firebase');
        return [];
      }

      // Convert Firestore documents to Race objects
      final races = snapshot.docs.map((doc) {
        final data = doc.data();
        
        // Parse the dateStart timestamp
        DateTime raceDate;
        if (data['dateStart'] is Timestamp) {
          raceDate = (data['dateStart'] as Timestamp).toDate();
        } else if (data['dateStart'] is String) {
          raceDate = DateTime.parse(data['dateStart']);
        } else {
          raceDate = DateTime.now();
        }

        return Race(
          season: data['year'] ?? 0,
          round: data['round'] ?? 0,
          gpName: data['raceName'] ?? 'Unknown Grand Prix',
          circuit: data['circuitName'] ?? 'Unknown Circuit',
          date: raceDate,
          country: data['countryCode'] ?? 'XX',
        );
      }).toList();

      // Sort in memory: by year (descending) then by round (ascending)
      races.sort((a, b) {
        final yearCompare = b.season.compareTo(a.season); // Descending year
        if (yearCompare != 0) return yearCompare;
        return a.round.compareTo(b.round); // Ascending round
      });

      print('[F1ApiService] Successfully converted and sorted ${races.length} races');
      return races;
    } catch (e) {
      print('[F1ApiService] Error fetching all races from Firebase: $e');
      return [];
    }
  }

  /// Fetch current season races from Firebase f1_races collection
  Future<List<Race>> getCurrentSeasonRaces() async {
    final year = DateTime.now().year;
    return getRacesBySeason(year);
  }

  /// Fetch races by season from Firebase f1_races collection
  Future<List<Race>> getRacesBySeason(int year) async {
    try {
      print('[F1ApiService] Fetching races for year $year from Firebase');
      
      // Query f1_races collection for the specified year
      final snapshot = await _firestore
          .collection('f1_races')
          .where('year', isEqualTo: year)
          .orderBy('round')
          .get();

      print('[F1ApiService] Found ${snapshot.docs.length} races for year $year');

      if (snapshot.docs.isEmpty) {
        print('[F1ApiService] No races found in Firebase for year $year');
        return [];
      }

      // Convert Firestore documents to Race objects
      final races = snapshot.docs.map((doc) {
        final data = doc.data();
        
        // Parse the dateStart timestamp
        DateTime raceDate;
        if (data['dateStart'] is Timestamp) {
          raceDate = (data['dateStart'] as Timestamp).toDate();
        } else if (data['dateStart'] is String) {
          raceDate = DateTime.parse(data['dateStart']);
        } else {
          raceDate = DateTime.now();
        }

        return Race(
          season: data['year'] ?? year,
          round: data['round'] ?? 0,
          gpName: data['raceName'] ?? 'Unknown Grand Prix',
          circuit: data['circuitName'] ?? 'Unknown Circuit',
          date: raceDate,
          country: data['countryCode'] ?? 'XX',
        );
      }).toList();

      print('[F1ApiService] Successfully converted ${races.length} races');
      return races;
    } catch (e) {
      print('[F1ApiService] Error fetching races from Firebase: $e');
      return [];
    }
  }

  /// Get a specific race by year and round
  Future<Race?> getRaceByYearAndRound(int year, int round) async {
    try {
      print('[F1ApiService] Fetching race: year=$year, round=$round');
      
      final snapshot = await _firestore
          .collection('f1_races')
          .where('year', isEqualTo: year)
          .where('round', isEqualTo: round)
          .limit(1)
          .get();

      if (snapshot.docs.isEmpty) {
        print('[F1ApiService] Race not found: year=$year, round=$round');
        return null;
      }

      final data = snapshot.docs.first.data();
      
      DateTime raceDate;
      if (data['dateStart'] is Timestamp) {
        raceDate = (data['dateStart'] as Timestamp).toDate();
      } else if (data['dateStart'] is String) {
        raceDate = DateTime.parse(data['dateStart']);
      } else {
        raceDate = DateTime.now();
      }

      return Race(
        season: data['year'] ?? year,
        round: data['round'] ?? round,
        gpName: data['raceName'] ?? 'Unknown Grand Prix',
        circuit: data['circuitName'] ?? 'Unknown Circuit',
        date: raceDate,
        country: data['countryCode'] ?? 'XX',
      );
    } catch (e) {
      print('[F1ApiService] Error fetching race by year and round: $e');
      return null;
    }
  }

  /// Get all available seasons from Firebase
  Future<List<int>> getAvailableSeasons() async {
    try {
      print('[F1ApiService] Fetching available seasons');
      
      final snapshot = await _firestore
          .collection('f1_races')
          .get(); // Get ALL races

      // Extract unique years
      final years = snapshot.docs
          .map((doc) => doc.data()['year'] as int?)
          .where((year) => year != null)
          .cast<int>()
          .toSet()
          .toList();

      years.sort((a, b) => b.compareTo(a)); // Sort descending
      
      print('[F1ApiService] Found ${years.length} seasons: $years');
      return years;
    } catch (e) {
      print('[F1ApiService] Error fetching available seasons: $e');
      return [];
    }
  }

  String getCountryCodeFromName(String country) {
    const countryMap = {
      'Australia': 'AU',
      'Austria': 'AT',
      'Azerbaijan': 'AZ',
      'Bahrain': 'BH',
      'Belgium': 'BE',
      'Brazil': 'BR',
      'Canada': 'CA',
      'China': 'CN',
      'France': 'FR',
      'Germany': 'DE',
      'Hungary': 'HU',
      'Italy': 'IT',
      'Japan': 'JP',
      'Mexico': 'MX',
      'Monaco': 'MC',
      'Netherlands': 'NL',
      'Portugal': 'PT',
      'Qatar': 'QA',
      'Russia': 'RU',
      'Saudi Arabia': 'SA',
      'Singapore': 'SG',
      'Spain': 'ES',
      'Turkey': 'TR',
      'UAE': 'AE',
      'United Arab Emirates': 'AE',
      'UK': 'GB',
      'United Kingdom': 'GB',
      'USA': 'US',
      'United States': 'US',
    };
    return countryMap[country] ?? 'XX';
  }
}
