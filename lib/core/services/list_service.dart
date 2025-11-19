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

    final docRef = await _firestore.collection('lists').add(list.toJson());
    
    // Update user stats
    await _firestore.collection('userStats').doc(user.uid).update({
      'listsCount': FieldValue.increment(1),
    });

    return docRef.id;
  }

  Future<List<RaceList>> getUserLists(String userId) async {
    final snapshot = await _firestore
        .collection('lists')
        .where('userId', isEqualTo: userId)
        .orderBy('updatedAt', descending: true)
        .get();

    return snapshot.docs.map((doc) => RaceList.fromJson(doc.data(), doc.id)).toList();
  }

  Future<List<RaceList>> getPublicLists() async {
    final snapshot = await _firestore
        .collection('lists')
        .where('isPublic', isEqualTo: true)
        .orderBy('updatedAt', descending: true)
        .limit(20)
        .get();

    return snapshot.docs.map((doc) => RaceList.fromJson(doc.data(), doc.id)).toList();
  }

  Future<RaceList?> getListById(String listId) async {
    final doc = await _firestore.collection('lists').doc(listId).get();
    if (!doc.exists) return null;
    return RaceList.fromJson(doc.data()!, doc.id);
  }

  Future<void> updateList(String listId, Map<String, dynamic> updates) async {
    await _firestore.collection('lists').doc(listId).update({
      ...updates,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> deleteList(String listId) async {
    final user = _authService.currentUser;
    if (user == null) throw Exception('User not authenticated');

    await _firestore.collection('lists').doc(listId).delete();

    // Update user stats
    await _firestore.collection('userStats').doc(user.uid).update({
      'listsCount': FieldValue.increment(-1),
    });
  }
}

final listServiceProvider = Provider<ListService>((ref) {
  final authService = ref.watch(authServiceProvider);
  return ListService(authService);
});
