import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class WatchlistItem {
  final String? id;
  final String userId;
  final String raceName;
  final String raceLocation;
  final int raceYear;
  final String? countryCode;
  final DateTime raceDate;
  final String notes;
  final bool reminderEnabled;
  final DateTime createdAt;

  WatchlistItem({
    this.id,
    required this.userId,
    required this.raceName,
    required this.raceLocation,
    required this.raceYear,
    this.countryCode,
    required this.raceDate,
    this.notes = '',
    this.reminderEnabled = false,
    required this.createdAt,
  });

  factory WatchlistItem.fromJson(Map<String, dynamic> json, String id) {
    return WatchlistItem(
      id: id,
      userId: json['userId'] ?? '',
      raceName: json['raceName'] ?? '',
      raceLocation: json['raceLocation'] ?? '',
      raceYear: json['raceYear'] ?? 0,
      countryCode: json['countryCode'],
      raceDate: (json['raceDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      notes: json['notes'] ?? '',
      reminderEnabled: json['reminderEnabled'] ?? false,
      createdAt: (json['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'raceName': raceName,
      'raceLocation': raceLocation,
      'raceYear': raceYear,
      'countryCode': countryCode,
      'raceDate': Timestamp.fromDate(raceDate),
      'notes': notes,
      'reminderEnabled': reminderEnabled,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

class WatchlistService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Add a race to watchlist
  Future<String> addToWatchlist({
    required String raceName,
    required String raceLocation,
    required int raceYear,
    required DateTime raceDate,
    String? countryCode,
    String notes = '',
    bool reminderEnabled = false,
  }) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[WatchlistService] Adding race to watchlist: $raceName');

    // Check if already in watchlist
    final existing = await _firestore
        .collection('watchlist')
        .where('userId', isEqualTo: user.uid)
        .where('raceName', isEqualTo: raceName)
        .where('raceYear', isEqualTo: raceYear)
        .get();

    if (existing.docs.isNotEmpty) {
      print('[WatchlistService] Race already in watchlist');
      return existing.docs.first.id;
    }

    final item = WatchlistItem(
      userId: user.uid,
      raceName: raceName,
      raceLocation: raceLocation,
      raceYear: raceYear,
      countryCode: countryCode,
      raceDate: raceDate,
      notes: notes,
      reminderEnabled: reminderEnabled,
      createdAt: DateTime.now(),
    );

    final docRef = await _firestore.collection('watchlist').add(item.toJson());
    print('[WatchlistService] Added to watchlist with ID: ${docRef.id}');
    return docRef.id;
  }

  /// Get user's watchlist
  Future<List<WatchlistItem>> getUserWatchlist() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[WatchlistService] Fetching watchlist for user: ${user.uid}');

    final snapshot = await _firestore
        .collection('watchlist')
        .where('userId', isEqualTo: user.uid)
        .orderBy('raceDate', descending: false)
        .get();

    print('[WatchlistService] Found ${snapshot.docs.length} items');
    return snapshot.docs.map((doc) => WatchlistItem.fromJson(doc.data(), doc.id)).toList();
  }

  /// Remove from watchlist
  Future<void> removeFromWatchlist(String itemId) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[WatchlistService] Removing from watchlist: $itemId');
    await _firestore.collection('watchlist').doc(itemId).delete();
  }

  /// Check if race is in watchlist
  Future<bool> isInWatchlist(String raceName, int raceYear) async {
    final user = _auth.currentUser;
    if (user == null) return false;

    final snapshot = await _firestore
        .collection('watchlist')
        .where('userId', isEqualTo: user.uid)
        .where('raceName', isEqualTo: raceName)
        .where('raceYear', isEqualTo: raceYear)
        .get();

    return snapshot.docs.isNotEmpty;
  }

  /// Update watchlist item
  Future<void> updateWatchlistItem(String itemId, {
    String? notes,
    bool? reminderEnabled,
  }) async {
    print('[WatchlistService] Updating watchlist item: $itemId');

    final updates = <String, dynamic>{};
    if (notes != null) updates['notes'] = notes;
    if (reminderEnabled != null) updates['reminderEnabled'] = reminderEnabled;

    if (updates.isNotEmpty) {
      await _firestore.collection('watchlist').doc(itemId).update(updates);
    }
  }

  /// Get ALL watchlist items from the collection
  Future<List<WatchlistItem>> getAllWatchlistItems() async {
    print('[WatchlistService] Fetching ALL watchlist items');
    final snapshot = await _firestore
        .collection('watchlist')
        .orderBy('createdAt', descending: true)
        .get();

    print('[WatchlistService] Found ${snapshot.docs.length} watchlist items');
    return snapshot.docs.map((doc) => WatchlistItem.fromJson(doc.data(), doc.id)).toList();
  }
}
