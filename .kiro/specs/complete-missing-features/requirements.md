# Requirements Document: Complete Missing Features from Legacy App

## Introduction

This specification covers the implementation of all missing features from the legacy Ionic app that need to be ported to the Flutter app. The focus is on high and medium priority features that are essential for feature parity and user experience.

## Glossary

- **Diary**: A personal screen where users view all their logged race viewing experiences
- **Race Log**: A record of a user watching an F1 race, including rating, review, and metadata
- **Session Type**: The type of F1 session (race, sprint, qualifying, sprint qualifying)
- **Watch Mode**: How the user watched the race (live, replay, TV broadcast, highlights, attended in person)
- **Driver of the Day**: User's choice for best performing driver in a race
- **Companions**: Other users tagged as having watched the race together (max 2)
- **Onboarding**: First-time user setup flow to personalize their experience
- **F1 Favorites**: User's favorite driver, team, and circuit
- **User Stats**: Aggregate statistics about a user's activity (races watched, hours, etc.)
- **System**: The BoxBoxd Flutter application

## Requirements

### Requirement 1: Diary Screen

**User Story:** As a user, I want to view all my logged races in a dedicated diary screen, so that I can review my F1 viewing history and statistics.

#### Acceptance Criteria

1. WHEN a user navigates to the diary screen THEN the System SHALL display all race logs for that user ordered by date watched descending
2. WHEN displaying race logs THEN the System SHALL show race name, location, year, rating, driver of the day, review excerpt, and date watched for each log
3. WHEN a user has logged races THEN the System SHALL display total races logged and total hours watched at the top of the screen
4. WHEN a user clicks on a race log card THEN the System SHALL navigate to the race detail screen for that race
5. WHEN a user has no logged races THEN the System SHALL display an empty state with a call-to-action to log their first race
6. WHEN a user long-presses a race log card THEN the System SHALL show options to edit or delete the log
7. WHEN displaying the diary THEN the System SHALL show country flags for each race location
8. WHEN calculating total hours THEN the System SHALL use 2 hours for race, 0.5 hours for sprint, 1 hour for qualifying, 0.25 hours for highlights

### Requirement 2: Enhanced Race Log Dialog

**User Story:** As a user, I want to log comprehensive details about races I watch, so that I can track my viewing experience with rich metadata.

#### Acceptance Criteria

1. WHEN logging a race THEN the System SHALL require circuit selection, year, session type, rating, and driver of the day
2. WHEN a user selects a circuit THEN the System SHALL display 24 predefined F1 circuits with location names
3. WHEN a user selects a year THEN the System SHALL offer the last 10 years as options
4. WHEN a user selects a session type THEN the System SHALL offer race, sprint, qualifying, and sprint qualifying options
5. WHEN a user selects a watch mode THEN the System SHALL offer live, replay, TV broadcast, highlights, and attended in person options
6. WHEN a user selects driver of the day THEN the System SHALL display the 2025 F1 driver lineup with team information
7. WHEN a user adds companions THEN the System SHALL allow tagging up to 2 usernames
8. WHEN a user sets a date watched THEN the System SHALL provide a calendar date picker
9. WHEN a user sets visibility THEN the System SHALL offer public, private, and friends options
10. WHEN a user selects a circuit and year THEN the System SHALL attempt to fetch the race winner from the API
11. WHEN editing an existing log THEN the System SHALL pre-fill all fields with current values
12. WHEN a user saves a log THEN the System SHALL validate required fields before submission

### Requirement 3: Race Log Management

**User Story:** As a user, I want to edit and delete my race logs, so that I can correct mistakes or remove entries.

#### Acceptance Criteria

1. WHEN a user edits a race log THEN the System SHALL open the log dialog in edit mode with pre-filled data
2. WHEN a user saves an edited log THEN the System SHALL update the existing log document in Firestore
3. WHEN a user deletes a race log THEN the System SHALL show a confirmation dialog before deletion
4. WHEN a user confirms deletion THEN the System SHALL remove the log from Firestore and update user stats
5. WHEN updating or deleting a log THEN the System SHALL recalculate and update the user's statistics

### Requirement 4: Onboarding Flow

**User Story:** As a new user, I want to set up my F1 preferences during onboarding, so that my experience is personalized from the start.

#### Acceptance Criteria

1. WHEN a new user completes signup THEN the System SHALL redirect to the onboarding screen
2. WHEN on step 1 THEN the System SHALL display 20 F1 drivers with team information for selection
3. WHEN on step 2 THEN the System SHALL display 10 F1 teams for selection
4. WHEN on step 3 THEN the System SHALL display 24 F1 circuits with country flags for selection
5. WHEN a user completes all steps THEN the System SHALL save favorite driver, team, and circuit to both users and userStats collections
6. WHEN a user clicks skip THEN the System SHALL navigate to home without saving preferences
7. WHEN displaying onboarding THEN the System SHALL show a progress indicator for the 3 steps
8. WHEN a user completes onboarding THEN the System SHALL set onboardingCompleted flag to true in the users collection

### Requirement 5: Settings Enhancements

**User Story:** As a user, I want to manage my account security and preferences in settings, so that I have control over my account.

#### Acceptance Criteria

1. WHEN a user wants to change password THEN the System SHALL require current password, new password, and confirmation
2. WHEN changing password THEN the System SHALL validate that new password is at least 8 characters
3. WHEN changing password THEN the System SHALL re-authenticate the user with current password before updating
4. WHEN a user sets F1 favorites THEN the System SHALL save favorite driver, circuit, and team to userStats
5. WHEN a user toggles privacy settings THEN the System SHALL save private account and activity status preferences
6. WHEN a user toggles notification preferences THEN the System SHALL save email, push, likes/comments, and followers notification settings
7. WHEN a user requests to delete account THEN the System SHALL require password confirmation
8. WHEN deleting account THEN the System SHALL remove user document, userStats, all race logs, all lists, and Firebase Auth account
9. WHEN a user requests data export THEN the System SHALL prepare a downloadable file with all user data

### Requirement 6: Star Rating Component

**User Story:** As a user, I want to rate races with a visual star system, so that I can quickly express my opinion.

#### Acceptance Criteria

1. WHEN displaying the rating input THEN the System SHALL show 5 star icons
2. WHEN a user taps a star THEN the System SHALL set the rating to that star's value (1-5)
3. WHEN a rating is set THEN the System SHALL fill stars up to the rating value with color
4. WHEN displaying a saved rating THEN the System SHALL show filled stars for the rating value
5. WHEN a rating is required THEN the System SHALL prevent submission if rating is 0

### Requirement 7: Support and Legal Pages

**User Story:** As a user, I want to access help and legal information, so that I can get support and understand policies.

#### Acceptance Criteria

1. WHEN a user navigates to support THEN the System SHALL display contact methods and FAQ
2. WHEN a user clicks email support THEN the System SHALL open the default email client with support address
3. WHEN a user navigates to privacy policy THEN the System SHALL display the full privacy policy text
4. WHEN a user navigates to terms of service THEN the System SHALL display the full terms of service text
5. WHEN displaying legal pages THEN the System SHALL format text for readability with proper sections

### Requirement 8: Navigation Integration

**User Story:** As a user, I want to access all features through intuitive navigation, so that I can easily find what I need.

#### Acceptance Criteria

1. WHEN the app loads THEN the System SHALL add a diary tab to the bottom navigation
2. WHEN a user taps the diary tab THEN the System SHALL navigate to the diary screen
3. WHEN in settings THEN the System SHALL provide links to support, privacy policy, and terms of service
4. WHEN a user completes signup THEN the System SHALL check onboardingCompleted flag and redirect accordingly
5. WHEN a user is logged out THEN the System SHALL show the login screen (landing page optional)

### Requirement 9: User Statistics

**User Story:** As a user, I want to see my viewing statistics, so that I can track my F1 engagement.

#### Acceptance Criteria

1. WHEN displaying user stats THEN the System SHALL show races watched count
2. WHEN displaying user stats THEN the System SHALL show total hours watched
3. WHEN displaying user stats THEN the System SHALL show reviews written count
4. WHEN a race log is created THEN the System SHALL increment races watched and recalculate hours
5. WHEN a race log is deleted THEN the System SHALL decrement races watched and recalculate hours
6. WHEN a race log with review is created THEN the System SHALL increment reviews count
7. WHEN displaying stats THEN the System SHALL show favorite driver, circuit, and team if set

### Requirement 10: Visual Design Consistency

**User Story:** As a user, I want the app to have consistent F1-themed visual design, so that the experience feels cohesive.

#### Acceptance Criteria

1. WHEN displaying the diary screen THEN the System SHALL use Ferrari red (#DC2626) as the primary accent color
2. WHEN displaying race log cards THEN the System SHALL show country flags using the flagcdn.com service
3. WHEN displaying the diary THEN the System SHALL use F1-themed visual elements like racing stripes
4. WHEN displaying empty states THEN the System SHALL use encouraging messaging with F1 terminology
5. WHEN displaying loading states THEN the System SHALL use themed loading indicators
