# Requirements Document

## Introduction

This specification addresses the compilation errors blocking the Ionic to Flutter migration completion. The Flutter application is 85% complete but cannot compile due to model mismatches, missing dependencies, null safety issues, and widget implementation problems. This spec will systematically resolve each blocker to achieve a fully functional Flutter application.

## Glossary

- **Flutter_App**: The Flutter-based mobile application being migrated to
- **UserProfile_Model**: The data model representing user profile information
- **FirestoreService**: The service layer handling Firestore database operations
- **Compilation_Error**: A build-time error preventing the application from compiling
- **Null_Safety**: Dart's type system feature requiring explicit handling of nullable values
- **Riverpod**: The state management library used in the Flutter application

## Requirements

### Requirement 1: Fix UserProfile Model Access Pattern

**User Story:** As a developer, I want the UserProfile model to provide consistent access to user statistics, so that all screens can display user data without compilation errors.

#### Acceptance Criteria

1. WHEN the ProfileScreen accesses user statistics, THE Flutter_App SHALL provide direct property access without a stats getter
2. WHEN the SettingsScreen accesses user statistics, THE Flutter_App SHALL provide direct property access without a stats getter
3. THE Flutter_App SHALL update all references from `currentUser.stats.racesWatched` to `currentUser.racesWatched`
4. THE Flutter_App SHALL update all references from `currentUser.stats.reviewsCount` to access the appropriate property
5. THE Flutter_App SHALL update all references from `currentUser.stats.followingCount` to `currentUser.following`
6. THE Flutter_App SHALL update all references from `currentUser.stats.followersCount` to `currentUser.followers`

### Requirement 2: Add Missing Service Methods

**User Story:** As a developer, I want FirestoreService to provide all necessary CRUD operations, so that screens can update user data without errors.

#### Acceptance Criteria

1. WHEN the SettingsScreen calls updateUserStats, THE FirestoreService SHALL provide an updateUserStats method
2. THE FirestoreService SHALL accept a userId parameter and a Map of stat updates
3. THE FirestoreService SHALL update the userStats collection document with the provided data
4. THE FirestoreService SHALL include a timestamp for the update operation
5. IF the update operation fails, THEN THE FirestoreService SHALL throw an appropriate exception

### Requirement 3: Resolve Null Safety Issues

**User Story:** As a developer, I want all nullable values to be handled safely, so that the application compiles without null safety errors.

#### Acceptance Criteria

1. WHEN RaceDetailScreen displays race rating, THE Flutter_App SHALL check for null before calling toStringAsFixed
2. WHEN SearchService filters by country, THE Flutter_App SHALL use null-safe operators for toLowerCase
3. WHEN ExploreScreen displays race country, THE Flutter_App SHALL provide a default value for null countries
4. WHEN ActivityScreen displays timestamps, THE Flutter_App SHALL handle null dates appropriately
5. THE Flutter_App SHALL initialize all non-nullable variables before use

### Requirement 4: Add Missing Dependencies

**User Story:** As a developer, I want all required packages to be declared in pubspec.yaml, so that the application can import and use necessary functionality.

#### Acceptance Criteria

1. THE Flutter_App SHALL include the timeago package in pubspec.yaml dependencies
2. WHEN ActivityScreen imports timeago, THE Flutter_App SHALL resolve the import successfully
3. THE Flutter_App SHALL specify a compatible version constraint for timeago
4. AFTER adding dependencies, THE Flutter_App SHALL run flutter pub get successfully

### Requirement 5: Fix Widget Implementation Issues

**User Story:** As a developer, I want all widgets to be properly implemented with correct Riverpod integration, so that the application compiles and runs without widget errors.

#### Acceptance Criteria

1. WHEN RaceDetailScreen uses Riverpod, THE Flutter_App SHALL extend ConsumerWidget or ConsumerStatefulWidget
2. THE Flutter_App SHALL provide the ref parameter to all widgets requiring Riverpod access
3. WHEN widgets use const constructors, THE Flutter_App SHALL ensure all child elements are const-compatible
4. THE Flutter_App SHALL remove const keywords from lists containing non-const elements
5. WHEN Race model is instantiated, THE Flutter_App SHALL use correct constructor syntax with named parameters

### Requirement 6: Fix Activity Screen Implementation

**User Story:** As a developer, I want the ActivityScreen to display activity timestamps and styled content correctly, so that users can view their activity feed without errors.

#### Acceptance Criteria

1. WHEN ActivityScreen formats timestamps, THE Flutter_App SHALL import and use the timeago package
2. THE Flutter_App SHALL initialize the color variable before use in conditional logic
3. WHEN activity type determines color, THE Flutter_App SHALL assign a default color value
4. THE Flutter_App SHALL handle null activity dates with fallback text
5. THE Flutter_App SHALL compile without "variable used before assignment" errors

### Requirement 7: Verify Application Compilation

**User Story:** As a developer, I want the Flutter application to compile successfully, so that I can run and test the migrated application.

#### Acceptance Criteria

1. AFTER all fixes are applied, THE Flutter_App SHALL compile without errors using flutter build
2. THE Flutter_App SHALL pass all static analysis checks using flutter analyze
3. THE Flutter_App SHALL resolve all diagnostic errors reported by the IDE
4. THE Flutter_App SHALL successfully run on at least one target platform
5. THE Flutter_App SHALL display the home screen without runtime errors
