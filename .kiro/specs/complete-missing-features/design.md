# Design Document: Complete Missing Features from Legacy App

## Overview

This design document outlines the architecture and implementation approach for porting all missing high and medium priority features from the legacy Ionic app to the Flutter app. The implementation focuses on the Diary feature, enhanced race logging, onboarding flow, and settings enhancements.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Diary   │  │Enhanced  │  │Onboarding│  │ Settings │   │
│  │  Screen  │  │Log Dialog│  │  Screen  │  │ Enhanced │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      State Management Layer                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Diary   │  │ Race Log │  │Onboarding│  │ Settings │   │
│  │ Provider │  │ Provider │  │ Provider │  │ Provider │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                        Service Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Race Log │  │   Auth   │  │User Stats│  │   F1     │   │
│  │ Service  │  │ Service  │  │ Service  │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                         Data Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Firebase │  │ Firebase │  │   F1     │                  │
│  │Firestore │  │   Auth   │  │   API    │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DiaryScreen
├── AppBar (with stats)
├── ListView/GridView Toggle
└── RaceLogList
    ├── RaceLogCard (multiple)
    │   ├── CountryFlag
    │   ├── RaceInfo
    │   ├── Rating Display
    │   ├── DriverOfTheDay
    │   └── ActionButtons (Edit/Delete)
    └── EmptyState (if no logs)

EnhancedLogRaceDialog
├── CircuitSelector
├── YearSelector
├── SessionTypeSelector
├── WatchModeSelector
├── StarRating
├── ReviewTextField
├── DriverOfTheDaySelector
├── CompanionsInput
├── DatePicker
├── VisibilitySelector
└── ActionButtons (Save/Cancel)

OnboardingScreen
├── ProgressIndicator
├── StepContent (conditional)
│   ├── DriverSelection (Step 1)
│   ├── TeamSelection (Step 2)
│   └── CircuitSelection (Step 3)
└── NavigationButtons (Back/Next/Complete/Skip)

EnhancedSettingsScreen
├── AccountSection
│   ├── EmailDisplay
│   ├── ChangePasswordForm
│   └── DeleteAccountButton
├── F1FavoritesSection
│   ├── FavoriteDriverInput
│   ├── FavoriteCircuitInput
│   └── FavoriteTeamInput
├── PrivacySection
│   ├── PrivateAccountToggle
│   └── ActivityStatusToggle
├── NotificationsSection
│   ├── EmailNotificationsToggle
│   ├── PushNotificationsToggle
│   ├── LikesCommentsToggle
│   └── FollowersToggle
└── DangerZoneSection
    └── DeleteAccountButton
```

## Components and Interfaces

### 1. Diary Screen

**File**: `lib/features/diary/diary_screen.dart`

**State Management**:
```dart
class DiaryState {
  final List<RaceLog> logs;
  final bool isLoading;
  final String? error;
  final DiaryViewMode viewMode; // list or grid
  final UserStats? stats;
}

enum DiaryViewMode { list, grid }
```

**Key Methods**:
- `loadUserLogs()`: Fetch all user's race logs
- `calculateStats()`: Calculate total races and hours
- `deleteLog(String logId)`: Delete a race log with confirmation
- `navigateToRaceDetail(RaceLog log)`: Navigate to race detail
- `toggleViewMode()`: Switch between list and grid view

### 2. Enhanced Log Race Dialog

**File**: `lib/features/race/widgets/enhanced_log_race_dialog.dart`

**State**:
```dart
class LogRaceFormState {
  String? selectedCircuit;
  int selectedYear;
  String sessionType;
  String watchMode;
  double rating;
  String review;
  String? driverOfTheDay;
  String? raceWinner;
  List<String> companions;
  DateTime dateWatched;
  String visibility;
  bool spoilerWarning;
}
```

**Data Sources**:
```dart
class F1Data {
  static const List<Circuit> circuits = [...]; // 24 circuits
  static const List<Driver> drivers2025 = [...]; // 20 drivers
  static const List<Team> teams = [...]; // 10 teams
}

class Circuit {
  final String name;
  final String location;
  final String country;
  final String countryCode;
}

class Driver {
  final String id;
  final String name;
  final String team;
}
```

### 3. Onboarding Screen

**File**: `lib/features/onboarding/onboarding_screen.dart`

**State**:
```dart
class OnboardingState {
  final int currentStep; // 1, 2, or 3
  final String? selectedDriver;
  final String? selectedTeam;
  final String? selectedCircuit;
  final bool isSubmitting;
}
```

**Key Methods**:
- `selectDriver(String driverId)`: Set selected driver
- `selectTeam(String teamId)`: Set selected team
- `selectCircuit(String circuitId)`: Set selected circuit
- `nextStep()`: Move to next step
- `previousStep()`: Move to previous step
- `completeOnboarding()`: Save preferences and navigate to home
- `skip()`: Skip onboarding and navigate to home

### 4. Enhanced Settings Screen

**File**: `lib/features/settings/enhanced_settings_screen.dart`

**Additional State**:
```dart
class SettingsFormState {
  String currentPassword;
  String newPassword;
  String confirmPassword;
  String favoriteDriver;
  String favoriteCircuit;
  String favoriteTeam;
  bool privateAccount;
  bool showActivityStatus;
  bool emailNotifications;
  bool pushNotifications;
  bool likesCommentsNotifications;
  bool followersNotifications;
}
```

### 5. Star Rating Component

**File**: `lib/core/widgets/star_rating.dart`

**Interface**:
```dart
class StarRating extends StatelessWidget {
  final double rating;
  final ValueChanged<double>? onRatingChanged;
  final double size;
  final Color activeColor;
  final Color inactiveColor;
  final bool readOnly;
}
```

## Data Models

### Enhanced RaceLog Model

The existing `RaceLog` model already has all required fields. No changes needed.

### UserStats Model Enhancement

**File**: `lib/core/models/user_stats.dart`

```dart
class UserStats {
  final String userId;
  final int racesWatched;
  final int reviewsCount;
  final int listsCount;
  final int followersCount;
  final int followingCount;
  final double totalHoursWatched;
  final String? favoriteDriver;      // NEW
  final String? favoriteCircuit;     // NEW
  final String? favoriteTeam;        // NEW
  final DateTime updatedAt;
}
```

### User Model Enhancement

**File**: `lib/core/models/user.dart`

```dart
class User {
  // ... existing fields
  final bool onboardingCompleted;    // NEW
  final String? favoriteDriver;      // NEW (ID)
  final String? favoriteTeam;        // NEW (ID)
  final String? favoriteCircuit;     // NEW (ID)
}
```

## Service Layer

### 1. RaceLogService Enhancements

**File**: `lib/core/services/race_log_service.dart`

**New Methods**:
```dart
// Update an existing race log
Future<void> updateRaceLog(String logId, RaceLog updates);

// Delete a race log
Future<void> deleteRaceLog(String logId);

// Get race logs by year
Future<List<RaceLog>> getRaceLogsByYear(String userId, int year);

// Get race logs by tag
Future<List<RaceLog>> getRaceLogsByTag(String userId, String tag);
```

### 2. AuthService Enhancements

**File**: `lib/core/services/auth_service.dart`

**New Methods**:
```dart
// Change user password
Future<void> changePassword(String currentPassword, String newPassword);

// Re-authenticate user
Future<void> reauthenticate(String password);

// Delete user account and all data
Future<void> deleteAccount(String password);

// Resend email verification
Future<void> resendVerificationEmail();
```

### 3. UserStatsService

**File**: `lib/core/services/user_stats_service.dart`

**New Service**:
```dart
class UserStatsService {
  // Get user stats
  Future<UserStats> getUserStats(String userId);
  
  // Update user stats
  Future<void> updateUserStats(String userId, Map<String, dynamic> updates);
  
  // Calculate total hours from logs
  double calculateTotalHours(List<RaceLog> logs);
  
  // Update stats after log creation/deletion
  Future<void> recalculateStats(String userId);
}
```

### 4. F1DataService

**File**: `lib/core/services/f1_data_service.dart`

**New Service**:
```dart
class F1DataService {
  // Get all circuits
  List<Circuit> getCircuits();
  
  // Get all drivers for a year
  List<Driver> getDrivers(int year);
  
  // Get all teams for a year
  List<Team> getTeams(int year);
  
  // Get country code from country name
  String? getCountryCode(String countryName);
  
  // Get race winner
  Future<String?> getRaceWinner(int year, int round);
}
```

## Error Handling

### Error Types

```dart
enum DiaryError {
  loadFailed,
  deleteFailed,
  updateFailed,
  networkError,
  permissionDenied,
}

enum OnboardingError {
  saveFailed,
  networkError,
}

enum SettingsError {
  passwordChangeFailed,
  invalidPassword,
  deleteAccountFailed,
  updateFailed,
}
```

### Error Handling Strategy

1. **Network Errors**: Show retry option with error message
2. **Validation Errors**: Show inline validation messages
3. **Permission Errors**: Show appropriate message and redirect if needed
4. **Unknown Errors**: Log to console and show generic error message

## Testing Strategy

### Unit Tests

1. **RaceLogService Tests**:
   - Test CRUD operations
   - Test stats calculation
   - Test filtering by year/tag

2. **AuthService Tests**:
   - Test password change
   - Test account deletion
   - Test re-authentication

3. **UserStatsService Tests**:
   - Test stats calculation
   - Test stats updates

4. **F1DataService Tests**:
   - Test data retrieval
   - Test country code mapping

### Widget Tests

1. **DiaryScreen Tests**:
   - Test empty state
   - Test list rendering
   - Test view mode toggle
   - Test delete confirmation

2. **EnhancedLogRaceDialog Tests**:
   - Test form validation
   - Test field interactions
   - Test save/cancel actions

3. **OnboardingScreen Tests**:
   - Test step navigation
   - Test selection interactions
   - Test skip functionality

4. **StarRating Tests**:
   - Test rating selection
   - Test read-only mode
   - Test visual states

### Integration Tests

1. **Diary Flow**:
   - Create log → View in diary → Edit log → Delete log

2. **Onboarding Flow**:
   - Complete all steps → Verify data saved → Navigate to home

3. **Settings Flow**:
   - Change password → Verify authentication
   - Update favorites → Verify saved
   - Delete account → Verify all data removed

## Performance Considerations

### Optimization Strategies

1. **Pagination**: Load race logs in batches of 20
2. **Caching**: Cache user stats and F1 data locally
3. **Lazy Loading**: Load images and flags on demand
4. **Debouncing**: Debounce search and filter inputs
5. **Memoization**: Cache computed values like total hours

### Memory Management

1. Dispose controllers in `dispose()` methods
2. Cancel stream subscriptions
3. Clear cached data when user logs out
4. Use `const` constructors where possible

## Security Considerations

1. **Password Changes**: Require re-authentication before changing password
2. **Account Deletion**: Require password confirmation before deletion
3. **Data Privacy**: Respect visibility settings (public/private/friends)
4. **Input Validation**: Sanitize all user inputs
5. **Rate Limiting**: Implement rate limiting for API calls

## Accessibility

1. **Semantic Labels**: Add semantic labels to all interactive elements
2. **Screen Reader Support**: Ensure all content is readable by screen readers
3. **Keyboard Navigation**: Support keyboard navigation where applicable
4. **Color Contrast**: Ensure sufficient color contrast (WCAG AA)
5. **Touch Targets**: Minimum 44x44 logical pixels for touch targets

## Internationalization

1. **Text Extraction**: Extract all user-facing strings to localization files
2. **Date Formatting**: Use locale-aware date formatting
3. **Number Formatting**: Use locale-aware number formatting
4. **RTL Support**: Ensure layout works with RTL languages

## Migration Strategy

### Phase 1: Core Diary Feature
1. Implement RaceLogService enhancements
2. Create DiaryScreen
3. Enhance LogRaceDialog
4. Add navigation integration
5. Test end-to-end flow

### Phase 2: Settings & Auth
1. Implement AuthService enhancements
2. Enhance SettingsScreen
3. Add F1 favorites section
4. Add privacy and notification toggles
5. Test security flows

### Phase 3: Onboarding
1. Create OnboardingScreen
2. Integrate with auth flow
3. Add skip functionality
4. Test first-time user experience

### Phase 4: Polish & Support
1. Create support pages
2. Add legal pages
3. Improve visual design
4. Add animations and transitions
5. Final testing and bug fixes

## Deployment Considerations

1. **Feature Flags**: Use feature flags for gradual rollout
2. **Analytics**: Track usage of new features
3. **Error Monitoring**: Monitor errors in production
4. **Performance Monitoring**: Track performance metrics
5. **User Feedback**: Collect user feedback on new features

## Future Enhancements

1. **Export Data**: Implement data export functionality
2. **Advanced Filtering**: Add more filter options in diary
3. **Stats Visualizations**: Add charts and graphs for stats
4. **Social Sharing**: Share race logs to social media
5. **Offline Support**: Cache data for offline viewing
