import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/services/auth_service.dart';
import 'package:boxboxd/core/services/user_stats_service.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';

/// State for the onboarding flow
class OnboardingState {
  final int currentStep;
  final String? selectedDriverId;
  final String? selectedDriverName;
  final String? selectedTeamId;
  final String? selectedTeamName;
  final String? selectedCircuitId;
  final String? selectedCircuitName;
  final bool isSubmitting;
  final String? error;

  const OnboardingState({
    this.currentStep = 1,
    this.selectedDriverId,
    this.selectedDriverName,
    this.selectedTeamId,
    this.selectedTeamName,
    this.selectedCircuitId,
    this.selectedCircuitName,
    this.isSubmitting = false,
    this.error,
  });

  OnboardingState copyWith({
    int? currentStep,
    String? selectedDriverId,
    String? selectedDriverName,
    String? selectedTeamId,
    String? selectedTeamName,
    String? selectedCircuitId,
    String? selectedCircuitName,
    bool? isSubmitting,
    String? error,
  }) {
    return OnboardingState(
      currentStep: currentStep ?? this.currentStep,
      selectedDriverId: selectedDriverId ?? this.selectedDriverId,
      selectedDriverName: selectedDriverName ?? this.selectedDriverName,
      selectedTeamId: selectedTeamId ?? this.selectedTeamId,
      selectedTeamName: selectedTeamName ?? this.selectedTeamName,
      selectedCircuitId: selectedCircuitId ?? this.selectedCircuitId,
      selectedCircuitName: selectedCircuitName ?? this.selectedCircuitName,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error ?? this.error,
    );
  }

  bool get canProceed {
    switch (currentStep) {
      case 1:
        return selectedDriverId != null;
      case 2:
        return selectedTeamId != null;
      case 3:
        return selectedCircuitId != null;
      default:
        return false;
    }
  }
}

/// Provider for onboarding state management
class OnboardingNotifier extends Notifier<OnboardingState> {
  late final AuthService _authService;
  late final UserStatsService _userStatsService;

  @override
  OnboardingState build() {
    _authService = ref.read(authServiceProvider);
    _userStatsService = UserStatsService();
    return const OnboardingState();
  }

  /// Select a driver
  void selectDriver(String driverId, String driverName) {
    state = state.copyWith(
      selectedDriverId: driverId,
      selectedDriverName: driverName,
    );
  }

  /// Select a team
  void selectTeam(String teamId, String teamName) {
    state = state.copyWith(
      selectedTeamId: teamId,
      selectedTeamName: teamName,
    );
  }

  /// Select a circuit
  void selectCircuit(String circuitId, String circuitName) {
    state = state.copyWith(
      selectedCircuitId: circuitId,
      selectedCircuitName: circuitName,
    );
  }

  /// Move to the next step
  void nextStep() {
    if (state.currentStep < 3 && state.canProceed) {
      state = state.copyWith(currentStep: state.currentStep + 1);
    }
  }

  /// Move to the previous step
  void previousStep() {
    if (state.currentStep > 1) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  /// Complete onboarding and save preferences
  Future<bool> completeOnboarding() async {
    if (!state.canProceed) {
      return false;
    }

    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final userId = _authService.currentUser?.uid;
      if (userId == null) {
        throw Exception('No user is currently signed in.');
      }

      // Save favorite driver ID to users collection
      // Save favorite team ID to users collection
      // Save favorite circuit ID to users collection
      // Set onboardingCompleted flag to true
      await _authService.updateUserProfile(userId, {
        'favoriteDriver': state.selectedDriverId,
        'favoriteTeam': state.selectedTeamId,
        'favoriteCircuit': state.selectedCircuitId,
        'onboardingCompleted': true,
      });

      // Save favorite driver name to userStats collection
      // Save favorite team name to userStats collection
      // Save favorite circuit name to userStats collection
      await _userStatsService.updateUserStats(userId, {
        'favoriteDriver': state.selectedDriverName,
        'favoriteTeam': state.selectedTeamName,
        'favoriteCircuit': state.selectedCircuitName,
      });

      // Invalidate the user profile provider to force a refresh
      ref.invalidate(currentUserProfileProvider);

      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to save preferences: $e',
      );
      return false;
    }
  }

  /// Skip onboarding without saving preferences
  Future<bool> skipOnboarding() async {
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final userId = _authService.currentUser?.uid;
      if (userId == null) {
        throw Exception('No user is currently signed in.');
      }

      // Just mark onboarding as completed without saving preferences
      await _authService.updateUserProfile(userId, {
        'onboardingCompleted': true,
      });

      // Invalidate the user profile provider to force a refresh
      ref.invalidate(currentUserProfileProvider);

      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to skip onboarding: $e',
      );
      return false;
    }
  }

  /// Reset the onboarding state
  void reset() {
    state = const OnboardingState();
  }
}

/// Provider instance
final onboardingProvider = NotifierProvider<OnboardingNotifier, OnboardingState>(
  OnboardingNotifier.new,
);
