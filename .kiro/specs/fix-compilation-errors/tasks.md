# Implementation Plan

- [x] 1. Add missing dependencies and update service layer
  - Add timeago package to pubspec.yaml with version ^3.6.1
  - Run flutter pub get to install dependencies
  - Add updateUserStats method to FirestoreService that updates the userStats collection with provided data and timestamp
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_

- [x] 2. Fix UserProfile stats access pattern in profile screen
  - Update profile_screen.dart to replace all `currentUser.stats.racesWatched` with `currentUser.racesWatched`
  - Replace `currentUser.stats.followingCount` with `currentUser.following`
  - Replace `currentUser.stats.followersCount` with `currentUser.followers`
  - Handle reviewsCount by using a placeholder value or calculating from logs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Fix UserProfile stats access pattern in settings screen
  - Update settings_screen.dart _loadFavorites method to replace `user.stats.favoriteDriver` with `user.favoriteDriver`
  - Replace `user.stats.favoriteTeam` with `user.favoriteTeam`
  - Replace `user.stats.favoriteCircuit` with `user.favoriteCircuit`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4. Fix null safety issues in search service
  - Update search_service.dart searchRaces method to use null-safe operator for country field: `race.country?.toLowerCase() ?? ''`
  - Ensure the filter condition handles null country values gracefully
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Fix activity screen compilation errors
  - Fix color variable initialization in _getIconForType method by adding default value `Color color = Colors.white;`
  - Fix color assignment syntax from `color:` (label) to `color =` (assignment) in all switch cases
  - Add null check for activity.createdAt when calling timeago.format: `activity.createdAt != null ? timeago.format(activity.createdAt!) : 'Recently'`
  - _Requirements: 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Fix race detail screen widget implementation
  - Change RaceDetailScreen from StatelessWidget to ConsumerWidget
  - Add WidgetRef ref parameter to build method signature
  - Add null check for race.rating when calling toStringAsFixed: `race.rating?.toStringAsFixed(1) ?? 'N/A'`
  - Remove const keywords from widgets containing non-const list literals
  - _Requirements: 3.1, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Fix remaining null safety and constructor issues
  - Fix explore_screen.dart to provide default value for null country: `race.country ?? 'Unknown'`
  - Fix list_detail_screen.dart Race constructor to use proper named parameters
  - _Requirements: 3.1, 3.3, 3.5, 5.5_

- [x] 8. Verify compilation and run diagnostics
  - Run flutter analyze to check for remaining static analysis errors
  - Run flutter build to verify successful compilation
  - Use getDiagnostics tool to check all modified files for errors
  - Fix any remaining issues identified by diagnostics
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
