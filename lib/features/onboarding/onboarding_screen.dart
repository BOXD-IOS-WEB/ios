import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:boxboxd/features/onboarding/providers/onboarding_provider.dart';
import 'package:boxboxd/core/constants/f1_data.dart';

// Color constant for Ferrari red with 10% opacity
const _selectedCardColor = Color(0x1ADC2626);

/// Onboarding screen with 3-step wizard for selecting F1 preferences
/// Step 1: Select favorite driver
/// Step 2: Select favorite team
/// Step 3: Select favorite circuit
class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Welcome to BoxBoxd'),
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: state.isSubmitting
                ? null
                : () async {
                    final success = await notifier.skipOnboarding();
                    if (success && context.mounted) {
                      context.go('/');
                    }
                  },
            child: const Text('Skip'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress indicator
          _ProgressIndicator(currentStep: state.currentStep),
          
          // Step content
          Expanded(
            child: _buildStepContent(context, state, notifier),
          ),
          
          // Navigation buttons
          _NavigationButtons(
            currentStep: state.currentStep,
            canProceed: state.canProceed,
            isSubmitting: state.isSubmitting,
            onBack: notifier.previousStep,
            onNext: notifier.nextStep,
            onComplete: () async {
              final success = await notifier.completeOnboarding();
              if (success && context.mounted) {
                context.go('/');
              } else if (state.error != null && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(state.error!)),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent(
    BuildContext context,
    OnboardingState state,
    OnboardingNotifier notifier,
  ) {
    switch (state.currentStep) {
      case 1:
        return _DriverSelectionStep(
          selectedDriver: state.selectedDriverId,
          onSelect: notifier.selectDriver,
        );
      case 2:
        return _TeamSelectionStep(
          selectedTeam: state.selectedTeamId,
          onSelect: notifier.selectTeam,
        );
      case 3:
        return _CircuitSelectionStep(
          selectedCircuit: state.selectedCircuitId,
          onSelect: notifier.selectCircuit,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

/// Progress indicator showing current step
class _ProgressIndicator extends StatelessWidget {
  final int currentStep;

  const _ProgressIndicator({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          _StepIndicator(
            stepNumber: 1,
            isActive: currentStep == 1,
            isCompleted: currentStep > 1,
            label: 'Driver',
          ),
          Expanded(
            child: Container(
              height: 2,
              color: currentStep > 1
                  ? const Color(0xFFDC2626)
                  : Colors.grey[300],
            ),
          ),
          _StepIndicator(
            stepNumber: 2,
            isActive: currentStep == 2,
            isCompleted: currentStep > 2,
            label: 'Team',
          ),
          Expanded(
            child: Container(
              height: 2,
              color: currentStep > 2
                  ? const Color(0xFFDC2626)
                  : Colors.grey[300],
            ),
          ),
          _StepIndicator(
            stepNumber: 3,
            isActive: currentStep == 3,
            isCompleted: false,
            label: 'Circuit',
          ),
        ],
      ),
    );
  }
}

/// Individual step indicator
class _StepIndicator extends StatelessWidget {
  final int stepNumber;
  final bool isActive;
  final bool isCompleted;
  final String label;

  const _StepIndicator({
    required this.stepNumber,
    required this.isActive,
    required this.isCompleted,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isCompleted || isActive
                ? const Color(0xFFDC2626)
                : Colors.grey[300],
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, color: Colors.white, size: 20)
                : Text(
                    '$stepNumber',
                    style: TextStyle(
                      color: isActive ? Colors.white : Colors.grey[600],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isActive || isCompleted ? Colors.black : Colors.grey[600],
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}

/// Step 1: Driver selection
class _DriverSelectionStep extends StatelessWidget {
  final String? selectedDriver;
  final Function(String, String) onSelect;

  const _DriverSelectionStep({
    required this.selectedDriver,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Text(
                'Who\'s your favorite driver?',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Select your favorite driver from the 2025 F1 lineup',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: F1Data.drivers.length,
            itemBuilder: (context, index) {
              final driver = F1Data.drivers[index];
              final isSelected = selectedDriver == driver.id;

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                elevation: isSelected ? 4 : 1,
                color: isSelected ? _selectedCardColor : null,
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isSelected
                        ? const Color(0xFFDC2626)
                        : Colors.grey[300],
                    child: Text(
                      '${driver.number}',
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(
                    driver.name,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  subtitle: Text(driver.team),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle, color: Color(0xFFDC2626))
                      : null,
                  onTap: () => onSelect(driver.id, driver.name),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Step 2: Team selection
class _TeamSelectionStep extends StatelessWidget {
  final String? selectedTeam;
  final Function(String, String) onSelect;

  const _TeamSelectionStep({
    required this.selectedTeam,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Text(
                'Which team do you support?',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Select your favorite F1 team',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.5,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: F1Data.teams.length,
            itemBuilder: (context, index) {
              final team = F1Data.teams[index];
              final isSelected = selectedTeam == team.id;

              return Card(
                elevation: isSelected ? 4 : 1,
                color: isSelected ? _selectedCardColor : null,
                child: InkWell(
                  onTap: () => onSelect(team.id, team.name),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: _parseColor(team.color),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          team.name,
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (isSelected)
                          const Icon(
                            Icons.check_circle,
                            color: Color(0xFFDC2626),
                            size: 20,
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Color _parseColor(String hexColor) {
    try {
      return Color(int.parse(hexColor.replaceFirst('#', '0xFF')));
    } catch (e) {
      return Colors.grey;
    }
  }
}

/// Step 3: Circuit selection
class _CircuitSelectionStep extends StatelessWidget {
  final String? selectedCircuit;
  final Function(String, String) onSelect;

  const _CircuitSelectionStep({
    required this.selectedCircuit,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Text(
                'What\'s your favorite circuit?',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Select your favorite F1 circuit from the 2025 calendar',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: F1Data.circuits.length,
            itemBuilder: (context, index) {
              final circuit = F1Data.circuits[index];
              final isSelected = selectedCircuit == circuit.id;

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                elevation: isSelected ? 4 : 1,
                color: isSelected ? _selectedCardColor : null,
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.transparent,
                    child: Image.network(
                      'https://flagcdn.com/w40/${circuit.countryCode}.png',
                      width: 32,
                      height: 32,
                      errorBuilder: (context, error, stackTrace) {
                        return const Icon(Icons.flag);
                      },
                    ),
                  ),
                  title: Text(
                    circuit.name,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  subtitle: Text('${circuit.location}, ${circuit.country}'),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle, color: Color(0xFFDC2626))
                      : null,
                  onTap: () => onSelect(circuit.id, circuit.name),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Navigation buttons at the bottom
class _NavigationButtons extends StatelessWidget {
  final int currentStep;
  final bool canProceed;
  final bool isSubmitting;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final VoidCallback onComplete;

  const _NavigationButtons({
    required this.currentStep,
    required this.canProceed,
    required this.isSubmitting,
    required this.onBack,
    required this.onNext,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Back button
          if (currentStep > 1)
            Expanded(
              child: OutlinedButton(
                onPressed: isSubmitting ? null : onBack,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Back'),
              ),
            ),
          if (currentStep > 1) const SizedBox(width: 12),
          
          // Next/Complete button
          Expanded(
            flex: currentStep == 1 ? 1 : 1,
            child: ElevatedButton(
              onPressed: (canProceed && !isSubmitting)
                  ? (currentStep == 3 ? onComplete : onNext)
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFDC2626),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text(currentStep == 3 ? 'Complete' : 'Next'),
            ),
          ),
        ],
      ),
    );
  }
}
