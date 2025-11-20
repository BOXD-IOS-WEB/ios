import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  Future<UserCredential> signIn(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      throw _handleAuthException(e);
    }
  }

  Future<UserCredential> signUp(String email, String password, String name) async {
    try {
      // 1. Create Firebase Auth account
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final userId = credential.user!.uid;

      // 2. Create document in 'users' collection
      await _firestore.collection('users').doc(userId).set({
        'name': name,
        'email': email,
        'photoURL': '',
        'description': '',
        'created_at': FieldValue.serverTimestamp(),
        'updated_at': FieldValue.serverTimestamp(),
      });

      // 3. Create document in 'userStats' collection
      await _firestore.collection('userStats').doc(userId).set({
        'racesWatched': 0,
        'reviewsCount': 0,
        'listsCount': 0,
        'followersCount': 0,
        'followingCount': 0,
        'totalHoursWatched': 0,
        'favoriteDriver': '',
        'favoriteCircuit': '',
        'favoriteTeam': '',
      });

      return credential;
    } catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Get user profile from Firestore
  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final doc = await _firestore.collection('users').doc(userId).get();
      return doc.data();
    } catch (e) {
      throw Exception('Failed to fetch user profile: $e');
    }
  }

  /// Get user stats from Firestore
  Future<Map<String, dynamic>?> getUserStats(String userId) async {
    try {
      final doc = await _firestore.collection('userStats').doc(userId).get();
      return doc.data();
    } catch (e) {
      throw Exception('Failed to fetch user stats: $e');
    }
  }

  /// Update user profile
  Future<void> updateUserProfile(String userId, Map<String, dynamic> data) async {
    try {
      await _firestore.collection('users').doc(userId).update({
        ...data,
        'updated_at': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      throw Exception('Failed to update user profile: $e');
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Re-authenticate user with their password
  /// Required before sensitive operations like password change or account deletion
  Future<void> reauthenticate(String password) async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in.');
      }

      final email = user.email;
      if (email == null) {
        throw Exception('User email not found.');
      }

      final credential = EmailAuthProvider.credential(
        email: email,
        password: password,
      );

      await user.reauthenticateWithCredential(credential);
    } catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Change user password
  /// Requires re-authentication before changing password
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in.');
      }

      // Validate new password
      if (newPassword.length < 8) {
        throw Exception('New password must be at least 8 characters long.');
      }

      // Re-authenticate user first
      await reauthenticate(currentPassword);

      // Change password
      await user.updatePassword(newPassword);
    } catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Delete user account and all associated data
  /// Requires password confirmation
  Future<void> deleteAccount(String password) async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in.');
      }

      final userId = user.uid;

      // Re-authenticate user first
      await reauthenticate(password);

      // Delete user data from Firestore
      // 1. Delete user document
      await _firestore.collection('users').doc(userId).delete();

      // 2. Delete userStats document
      await _firestore.collection('userStats').doc(userId).delete();

      // 3. Delete all race logs
      final raceLogsSnapshot = await _firestore
          .collection('raceLogs')
          .where('userId', isEqualTo: userId)
          .get();
      
      for (final doc in raceLogsSnapshot.docs) {
        await doc.reference.delete();
      }

      // 4. Delete all lists
      final listsSnapshot = await _firestore
          .collection('lists')
          .where('userId', isEqualTo: userId)
          .get();
      
      for (final doc in listsSnapshot.docs) {
        await doc.reference.delete();
      }

      // 5. Delete all comments
      final commentsSnapshot = await _firestore
          .collection('comments')
          .where('userId', isEqualTo: userId)
          .get();
      
      for (final doc in commentsSnapshot.docs) {
        await doc.reference.delete();
      }

      // 6. Delete all likes
      final likesSnapshot = await _firestore
          .collection('likes')
          .where('userId', isEqualTo: userId)
          .get();
      
      for (final doc in likesSnapshot.docs) {
        await doc.reference.delete();
      }

      // 7. Delete all follows (both following and followers)
      final followingSnapshot = await _firestore
          .collection('follows')
          .where('followerId', isEqualTo: userId)
          .get();
      
      for (final doc in followingSnapshot.docs) {
        await doc.reference.delete();
      }

      final followersSnapshot = await _firestore
          .collection('follows')
          .where('followingId', isEqualTo: userId)
          .get();
      
      for (final doc in followersSnapshot.docs) {
        await doc.reference.delete();
      }

      // 8. Delete all notifications
      final notificationsSnapshot = await _firestore
          .collection('notifications')
          .where('userId', isEqualTo: userId)
          .get();
      
      for (final doc in notificationsSnapshot.docs) {
        await doc.reference.delete();
      }

      // Finally, delete Firebase Auth account
      await user.delete();
    } catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Resend email verification to current user
  Future<void> resendVerificationEmail() async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in.');
      }

      if (user.emailVerified) {
        throw Exception('Email is already verified.');
      }

      await user.sendEmailVerification();
    } catch (e) {
      throw _handleAuthException(e);
    }
  }

  Exception _handleAuthException(dynamic e) {
    if (e is FirebaseAuthException) {
      switch (e.code) {
        case 'user-not-found':
          return Exception('No user found for that email.');
        case 'wrong-password':
          return Exception('Wrong password provided for that user.');
        case 'email-already-in-use':
          return Exception('The account already exists for that email.');
        case 'weak-password':
          return Exception('The password provided is too weak.');
        case 'requires-recent-login':
          return Exception('This operation requires recent authentication. Please sign in again.');
        case 'invalid-credential':
          return Exception('Invalid credentials provided.');
        case 'too-many-requests':
          return Exception('Too many requests. Please try again later.');
        default:
          return Exception(e.message ?? 'An unknown auth error occurred.');
      }
    }
    return Exception('An unknown error occurred: $e');
  }
}
