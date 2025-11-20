import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';

/// A header widget that displays user statistics for the diary screen.
/// 
/// Features:
/// - Ferrari red gradient background with racing stripe design
/// - Races logged count with flag icon
/// - Total hours watched with clock icon
/// - Visual separator between stats
/// - F1-themed styling with bold typography
class DiaryStatsHeader extends StatelessWidget {
  final int racesWatched;
  final double totalHours;

  const DiaryStatsHeader({
    super.key,
    required this.racesWatched,
    required this.totalHours,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.racingRed.withValues(alpha: 0.2),
            AppTheme.racingRed.withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.racingRed.withValues(alpha: 0.3),
          width: 2,
        ),
        // Racing stripe accent
        boxShadow: [
          BoxShadow(
            color: AppTheme.racingRed.withValues(alpha: 0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            icon: LucideIcons.flag,
            label: 'Races Logged',
            value: racesWatched.toString(),
          ),
          Container(
            width: 2,
            height: 40,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.white.withValues(alpha: 0.0),
                  Colors.white.withValues(alpha: 0.2),
                  Colors.white.withValues(alpha: 0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          _buildStatItem(
            icon: LucideIcons.clock,
            label: 'Hours Watched',
            value: totalHours.toStringAsFixed(1),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.racingRed, size: 28),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.6),
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }
}
