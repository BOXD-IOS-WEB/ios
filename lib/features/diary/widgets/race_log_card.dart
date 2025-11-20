import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race_log.dart';

/// A card widget that displays a race log entry with F1-themed styling.
/// 
/// Features:
/// - Country flag display using flagcdn.com
/// - Race name, location, and year
/// - Star rating display
/// - Session type and watch mode badges
/// - Driver of the day with trophy icon
/// - Review excerpt (truncated to 150 characters)
/// - Date watched
/// - Long-press menu for edit/delete actions
/// - Racing stripe visual elements with Ferrari red accents
class RaceLogCard extends StatelessWidget {
  final RaceLog log;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const RaceLogCard({
    super.key,
    required this.log,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onLongPress: () {
        _showActionMenu(context);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with flag and location - Racing stripe design
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.racingRed.withValues(alpha: 0.15),
                    AppTheme.racingRed.withValues(alpha: 0.05),
                  ],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
                // Racing stripe accent on the left
                border: Border(
                  left: BorderSide(
                    color: AppTheme.racingRed,
                    width: 4,
                  ),
                ),
              ),
              child: Row(
                children: [
                  // Country flag
                  if (log.countryCode != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: Image.network(
                        'https://flagcdn.com/w40/${log.countryCode!.toLowerCase()}.png',
                        width: 32,
                        height: 24,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 32,
                            height: 24,
                            color: Colors.white.withValues(alpha: 0.1),
                            child: const Icon(
                              LucideIcons.flag,
                              size: 16,
                              color: Colors.white38,
                            ),
                          );
                        },
                      ),
                    ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          log.raceName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${log.raceLocation} • ${log.raceYear}',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.6),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Rating stars
                  _buildStarRating(log.rating),
                ],
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Session type and watch mode badges
                  Row(
                    children: [
                      _buildBadge(
                        _formatSessionType(log.sessionType),
                        AppTheme.racingRed,
                      ),
                      const SizedBox(width: 8),
                      _buildBadge(
                        _formatWatchMode(log.watchMode),
                        Colors.white.withValues(alpha: 0.2),
                      ),
                    ],
                  ),
                  if (log.driverOfTheDay != null) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(
                          LucideIcons.trophy,
                          size: 16,
                          color: Colors.amber,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Driver of the Day: ${log.driverOfTheDay}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (log.review.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      log.review.length > 150
                          ? '${log.review.substring(0, 150)}...'
                          : log.review,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  // Date watched
                  Row(
                    children: [
                      Icon(
                        LucideIcons.calendar,
                        size: 14,
                        color: Colors.white.withValues(alpha: 0.4),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _formatDate(log.dateWatched),
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.4),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStarRating(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final isFilled = index < rating;
        return Icon(
          LucideIcons.star,
          size: 16,
          color: isFilled
              ? Colors.amber
              : Colors.white.withValues(alpha: 0.2),
        );
      }),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  String _formatSessionType(String type) {
    switch (type.toLowerCase()) {
      case 'race':
        return 'RACE';
      case 'sprint':
        return 'SPRINT';
      case 'qualifying':
        return 'QUALIFYING';
      case 'sprint qualifying':
        return 'SPRINT QUALI';
      case 'highlights':
        return 'HIGHLIGHTS';
      default:
        return type.toUpperCase();
    }
  }

  String _formatWatchMode(String mode) {
    switch (mode.toLowerCase()) {
      case 'live':
        return 'LIVE';
      case 'replay':
        return 'REPLAY';
      case 'tv broadcast':
        return 'TV';
      case 'highlights':
        return 'HIGHLIGHTS';
      case 'attended in person':
        return 'IN PERSON';
      default:
        return mode.toUpperCase();
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  void _showActionMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(LucideIcons.edit, color: Colors.white),
              title: const Text(
                'Edit',
                style: TextStyle(color: Colors.white),
              ),
              onTap: () {
                Navigator.pop(context);
                onEdit();
              },
            ),
            ListTile(
              leading: const Icon(LucideIcons.trash2, color: AppTheme.racingRed),
              title: const Text(
                'Delete',
                style: TextStyle(color: AppTheme.racingRed),
              ),
              onTap: () {
                Navigator.pop(context);
                onDelete();
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
