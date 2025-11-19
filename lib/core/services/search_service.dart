import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/services/f1_api_service.dart';
import 'package:boxboxd/core/models/user_profile.dart';

class SearchResult {
  final String id;
  final String type; // 'race', 'user', 'list'
  final String title;
  final String? subtitle;
  final dynamic metadata;

  SearchResult({
    required this.id,
    required this.type,
    required this.title,
    this.subtitle,
    this.metadata,
  });
}

class SearchService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final F1ApiService _f1ApiService;

  SearchService(this._f1ApiService);

  Future<List<SearchResult>> searchRaces(String query) async {
    final term = query.toLowerCase();
    // In a real app with Algolia/Meilisearch, this would be better.
    // Here we'll fetch current season and maybe previous ones if cached/available,
    // but for efficiency we might just search the current season or rely on a known list.
    // The legacy app fetched ALL races from 2020-2025. That's heavy.
    // Let's limit to 2024-2025 for now to be lighter.
    
    List<Race> allRaces = [];
    try {
      final races2025 = await _f1ApiService.getRacesBySeason(2025);
      final races2024 = await _f1ApiService.getRacesBySeason(2024);
      allRaces = [...races2025, ...races2024];
    } catch (e) {
      print('Error searching races: $e');
    }

    final filtered = allRaces.where((race) => 
      race.gpName.toLowerCase().contains(term) || 
      race.circuit.toLowerCase().contains(term) ||
      (race.country?.toLowerCase() ?? '').contains(term)
    ).take(10).toList();

    return filtered.map((race) => SearchResult(
      id: '${race.season}-${race.round}',
      type: 'race',
      title: race.gpName,
      subtitle: '${race.season} • ${race.circuit}',
      metadata: race,
    )).toList();
  }

  Future<List<SearchResult>> searchUsers(String query) async {
    final term = query.toLowerCase();
    // Firestore doesn't support native full-text search.
    // We'll do a simple prefix search on 'name' if possible, or fetch recent users.
    // For this demo, we'll fetch a batch of users and filter client side (not scalable but works for MVP).
    
    try {
      final snapshot = await _firestore.collection('users').limit(50).get();
      final users = snapshot.docs.map((doc) => UserProfile.fromJson(doc.data(), doc.id)).toList();
      
      final filtered = users.where((user) => 
        user.name.toLowerCase().contains(term) || 
        user.email.toLowerCase().contains(term)
      ).take(10).toList();

      return filtered.map((user) => SearchResult(
        id: user.id,
        type: 'user',
        title: user.name,
        subtitle: '@${user.email.split('@')[0]}',
        metadata: user,
      )).toList();
    } catch (e) {
      print('Error searching users: $e');
      return [];
    }
  }

  Future<List<SearchResult>> searchAll(String query) async {
    if (query.length < 2) return [];

    final results = await Future.wait([
      searchRaces(query),
      searchUsers(query),
    ]);

    return [...results[0], ...results[1]];
  }
}
