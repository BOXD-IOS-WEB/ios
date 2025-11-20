# Implementation Plan: Complete Missing Features

## Phase 1: Core Diary Feature (HIGH PRIORITY)

- [x] 1. Enhance RaceLogService with update/delete operations
  - Add `updateRaceLog(String logId, RaceLog updates)` method
  - Add `deleteRaceLog(String logId)` method
  - Add `getRaceLogsByYear(String userId, int year)` method
  - Add `getRaceLogsByTag(String userId, String tag)` method
  - Update `_updateUserStats()` to recalculate on updates/deletes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Create F1 data constants and service
  - Create `lib/core/constants/f1_data.dart` with circuits, drivers, teams
  - Define 24 F1 circuits with names, locations, countries, country codes
  - Define 20 F1 drivers for 2025 season with teams
  - Define 10 F1 teams
  - Create `lib/core/services/f1_data_service.dart`
  - Implement `getCircuits()`, `getDrivers()`, `getTeams()` methods
  - Implement `getCountryCode(String countryName)` method
  - _Requirements: 2.2, 2.3, 2.6_

- [x] 3. Create Star Rating component
  - Create `lib/core/widgets/star_rating.dart`
  - Implement interactive star rating (1-5 stars)
  - Support read-only mode for displaying ratings
  - Add customizable size and colors
  - Handle tap events to set rating
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Enhance Log Race Dialog
  - Update `lib/features/race/widgets/log_race_dialog.dart`
  - Add circuit selector dropdown with 24 circuits
  - Add year selector dropdown (last 10 years)
  - Add session type selector (race, sprint, qualifying, sprint qualifying)
  - Add watch mode selector (live, replay, TV broadcast, highlights, attended in person)
  - Replace basic rating with StarRating component
  - Add driver of the day selector with 2025 lineup
  - Add companions input field (max 2 usernames)
  - Add date watched picker
  - Add visibility selector (public, private, friends)
  - Add auto-fetch race winner when circuit and year selected
  - Support edit mode with pre-filled data
  - Add form validation for required fields
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

- [x] 5. Create UserStatsService
  - Create `lib/core/services/user_stats_service.dart`
  - Implement `getUserStats(String userId)` method
  - Implement `updateUserStats(String userId, Map<String, dynamic> updates)` method
  - Implement `calculateTotalHours(List<RaceLog> logs)` method
  - Implement `recalculateStats(String userId)` method
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 6. Create Diary Screen
  - Create `lib/features/diary/diary_screen.dart`
  - Create `lib/features/diary/providers/diary_provider.dart`
  - Implement state management with Riverpod
  - Display list of user's race logs ordered by date
  - Show race name, location, year, rating, driver of the day, review excerpt
  - Display country flags using flagcdn.com
  - Show total races logged and total hours watched at top
  - Implement empty state with call-to-action
  - Add long-press menu for edit/delete options
  - Implement delete confirmation dialog
  - Add navigation to race detail on card tap
  - Calculate hours based on session type (race: 2h, sprint: 0.5h, qualifying: 1h, highlights: 0.25h)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 7. Create Diary widgets
  - Create `lib/features/diary/widgets/race_log_card.dart`
  - Create `lib/features/diary/widgets/diary_stats_header.dart`
  - Create `lib/features/diary/widgets/diary_empty_state.dart`
  - Implement F1-themed visual design with Ferrari red
  - Add racing stripe visual elements
  - Style cards with country flags and race info
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 8. Add Diary navigation
  - Update `lib/router.dart` to add `/diary` route
  - Update `lib/scaffold_with_navbar.dart` to add diary tab
  - Add diary icon to bottom navigation
  - Ensure proper navigation flow
  - _Requirements: 8.1, 8.2_

- [x] 9. Checkpoint - Test Diary feature end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Settings & Auth Enhancements (HIGH PRIORITY)

- [x] 10. Enhance AuthService
  - Update `lib/core/services/auth_service.dart`
  - Add `changePassword(String currentPassword, String newPassword)` method
  - Add `reauthenticate(String password)` method
  - Add `deleteAccount(String password)` method
  - Add `resendVerificationEmail()` method
  - Implement proper error handling for auth operations
  - _Requirements: 5.2, 5.3, 5.7, 5.8_

- [x] 11. Enhance User and UserStats models
  - Update `lib/core/models/user.dart` to add onboardingCompleted, favoriteDriver, favoriteTeam, favoriteCircuit
  - Update `lib/core/models/user_stats.dart` to add favoriteDriver, favoriteCircuit, favoriteTeam
  - Update fromJson and toJson methods
  - _Requirements: 4.5, 5.4, 9.7_

- [x] 12. Create Settings sections
  - Create `lib/features/settings/widgets/account_section.dart`
  - Create `lib/features/settings/widgets/f1_favorites_section.dart`
  - Create `lib/features/settings/widgets/privacy_section.dart`
  - Create `lib/features/settings/widgets/notifications_section.dart`
  - Create `lib/features/settings/widgets/danger_zone_section.dart`
  - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7_

- [x] 13. Implement Change Password functionality
  - Add change password form to account section
  - Add current password, new password, confirm password fields
  - Validate new password is at least 8 characters
  - Validate new password matches confirmation
  - Re-authenticate user before changing password
  - Show success/error messages
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 14. Implement F1 Favorites functionality
  - Add favorite driver input field
  - Add favorite circuit input field
  - Add favorite team input field
  - Save to userStats collection on submit
  - Show current favorites if set
  - _Requirements: 5.4, 9.7_

- [x] 15. Implement Privacy settings
  - Add private account toggle
  - Add show activity status toggle
  - Save preferences to user document
  - _Requirements: 5.5_

- [x] 16. Implement Notification preferences
  - Add email notifications toggle
  - Add push notifications toggle
  - Add likes/comments notifications toggle
  - Add followers notifications toggle
  - Save preferences to user document
  - _Requirements: 5.6_

- [x] 17. Implement Delete Account functionality
  - Add delete account button in danger zone
  - Show confirmation dialog with password input
  - List all data that will be deleted
  - Re-authenticate user before deletion
  - Delete user document from Firestore
  - Delete userStats document
  - Delete all user's race logs
  - Delete all user's lists
  - Delete Firebase Auth account
  - Navigate to login screen after deletion
  - _Requirements: 5.7, 5.8_

- [x] 18. Implement Export Data functionality
  - Add export data button
  - Collect all user data (profile, logs, lists, etc.)
  - Format as JSON
  - Trigger download
  - _Requirements: 5.9_

- [x] 19. Update Settings Screen
  - Update `lib/features/settings/settings_screen.dart`
  - Integrate all new sections
  - Add links to support, privacy policy, terms of service
  - Improve layout and styling
  - _Requirements: 8.3_

- [x] 20. Checkpoint - Test Settings enhancements
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Onboarding Flow (MEDIUM PRIORITY)

- [x] 21. Create Onboarding Screen
  - Create `lib/features/onboarding/onboarding_screen.dart`
  - Create `lib/features/onboarding/providers/onboarding_provider.dart`
  - Implement 3-step wizard UI
  - Add progress indicator showing current step
  - _Requirements: 4.1, 4.7_

- [x] 22. Implement Step 1: Driver Selection
  - Display 20 F1 drivers with team information
  - Allow single selection
  - Highlight selected driver
  - Show driver name and team
  - _Requirements: 4.2_

- [x] 23. Implement Step 2: Team Selection
  - Display 10 F1 teams
  - Allow single selection
  - Highlight selected team
  - _Requirements: 4.3_

- [x] 24. Implement Step 3: Circuit Selection
  - Display 24 F1 circuits with country flags
  - Allow single selection
  - Highlight selected circuit
  - Show circuit name and country flag
  - _Requirements: 4.4_

- [x] 25. Implement Onboarding navigation
  - Add Back button (disabled on step 1)
  - Add Next button (disabled if no selection)
  - Add Complete button on step 3
  - Add Skip button on all steps
  - Handle step transitions
  - _Requirements: 4.6_

- [x] 26. Implement Onboarding completion
  - Save favorite driver ID to users collection
  - Save favorite team ID to users collection
  - Save favorite circuit ID to users collection
  - Save favorite driver name to userStats collection
  - Save favorite team name to userStats collection
  - Save favorite circuit name to userStats collection
  - Set onboardingCompleted flag to true
  - Navigate to home screen
  - _Requirements: 4.5, 4.8_

- [x] 27. Integrate Onboarding with Auth flow
  - Update `lib/router.dart` to add `/onboarding` route
  - Check onboardingCompleted flag after login
  - Redirect to onboarding if not completed
  - Redirect to home if completed
  - _Requirements: 8.4_

- [x] 28. Checkpoint - Test Onboarding flow
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Support & Legal Pages (LOW PRIORITY)

- [x] 29. Create Support Screen
  - Create `lib/features/support/support_screen.dart`
  - Display contact methods (email, social media)
  - Add FAQ section with common questions
  - Add links to privacy policy and terms
  - Add version information
  - _Requirements: 7.1, 7.2_

- [x] 30. Create Privacy Policy Screen
  - Create `lib/features/legal/privacy_policy_screen.dart`
  - Display full privacy policy text
  - Format for readability
  - Add proper sections and headings
  - _Requirements: 7.3, 7.5_

- [x] 31. Create Terms of Service Screen
  - Create `lib/features/legal/terms_of_service_screen.dart`
  - Display full terms of service text
  - Format for readability
  - Add proper sections and headings
  - _Requirements: 7.4, 7.5_

- [x] 32. Add navigation to support and legal pages
  - Update router to add routes
  - Add links from settings screen
  - Ensure proper navigation flow
  - _Requirements: 8.3_

- [x] 33. Final Checkpoint - Complete testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each phase builds on the previous one
- Checkpoints ensure stability before moving forward
- Priority order: Diary → Settings → Onboarding → Support
- Total estimated time: 47-67 hours
- Can be implemented incrementally with feature flags
