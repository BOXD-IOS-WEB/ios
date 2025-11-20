import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:boxboxd/core/models/race_list.dart';
import 'package:boxboxd/core/services/auth_service.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ListService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final AuthService _authService;

  ListService(this._authService);

  Future<String> createList(RaceList list) async {
    final user = _authService.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[ListService] Creating list in "lists" collection');
    final docRef = await _firestore.collection('lists').add(list.toJson());
    
    // Update user stats
    await _firestore.collection('userStats').doc(user.uid).update({
      'listsCount': FieldValue.increment(1),
    });

    print('[ListService] List created with ID: ${docRef.id}');
    return docRef.id;
  }

  Future<List<RaceList>> getUserLists(String userId) async {
    print('[ListService] Fetching lists for user: $userId');
    final snapshot = await _firestore
        .collection('lists')
        .where('userId', isEqualTo: userId)
        .orderBy('updatedAt', descending: true)
        .get();

    print('[ListService] Found ${snapshot.docs.length} lists');
    return snapshot.docs.map((doc) => RaceList.fromJson(doc.data(), doc.id)).toList();
  }

  Future<List<RaceList>> getPublicLists({int? limit}) async {
    print('[ListService] Fetching ALL public lists');
    var query = _firestore
        .collection('lists')
        .where('isPublic', isEqualTo: true)
        .orderBy('updatedAt', descending: true);
    
    // Only apply limit if specified
    if (limit != null) {
      query = query.limit(limit);
    }
    
    final snapshot = await query.get();

    print('[ListService] Found ${snapshot.docs.length} public lists');
    return snapshot.docs.map((doc) => RaceList.fromJson(doc.data(), doc.id)).toList();
  }

  Future<RaceList?> getListById(String listId) async {
    print('[ListService] Fetching list by ID: $listId');
    final doc = await _firestore.collection('lists').doc(listId).get();
    if (!doc.exists) {
      print('[ListService] List not found');
      return null;
    }
    return RaceList.fromJson(doc.data()!, doc.id);
  }

  Future<void> updateList(String listId, Map<String, dynamic> updates) async {
    print('[ListService] Updating list: $listId');
    await _firestore.collection('lists').doc(listId).update({
      ...updates,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> deleteList(String listId) async {
    final user = _authService.currentUser;
    if (user == null) throw Exception('User not authenticated');

    print('[ListService] Deleting list: $listId');
    await _firestore.collection('lists').doc(listId).delete();

    // Update user stats
    await _firestore.collection('userStats').doc(user.uid).update({
      'listsCount': FieldValue.increment(-1),
    });
  }

  /// Get ALL lists from the collection
  Future<List<RaceList>> getAllLists() async {
    print('[ListService] Fetching ALL lists');
    final snapshot = await _firestore
        .collection('lists')
        .orderBy('updatedAt', descending: true)
        .get();

    print('[ListService] Found ${snapshot.docs.length} lists');
    return snapshot.docs.map((doc) => RaceList.fromJson(doc.data(), doc.id)).toList();
  }
}

final listServiceProvider = Provider<ListService>((ref) {
  final authService = ref.watch(authServiceProvider);
  return ListService(authService);
});
