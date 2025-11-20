import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';

/// An empty state widget for the diary screen when no race logs exist.
/// 
/// Features:
/// - F1-themed flag icon with Ferrari red accent
/// - Encouraging messaging with racing terminology
/// - Call-to-action button to log first race
/// - Circular gradient background for icon
/// - Bold typography consistent with F1 branding
class DiaryEmptyState extends StatelessWidget {
  final VoidCallback onLogFirstRace;

  const DiaryEmptyState({
    super.key,
    required this.onLogFirstRace,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon with racing-themed circular background
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  colors: [
                    AppTheme.racingRed.withValues(alpha: 0.2),
                    AppTheme.racingRed.withValues(alpha: 0.05),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.5, 1.0],
                ),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppTheme.racingRed.withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
              child: const Icon(
                LucideIcons.flag,
                size: 64,
                color: AppTheme.racingRed,
              ),
            ),
            const SizedBox(height: 24),
            // Title with F1-style typography
            const Text(
              'Start Your Racing Diary',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            // Subtitle with encouraging message
            Text(
              'Log your first race to track your F1 viewing journey',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.6),
                fontSize: 16,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            // Call-to-action button with Ferrari red
            ElevatedButton.icon(
              onPressed: onLogFirstRace,
              icon: const Icon(LucideIcons.plus, size: 20),
              label: const Text('Log Your First Race'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.racingRed,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 16,
                ),
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
                shadowColor: AppTheme.racingRed.withValues(alpha: 0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
