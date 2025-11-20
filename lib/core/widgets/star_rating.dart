import 'package:flutter/material.dart';

/// A customizable star rating widget that supports both interactive and read-only modes.
///
/// This widget displays 5 stars that can be used to show or set a rating value.
/// In interactive mode, users can tap on stars to set a rating from 1-5.
/// In read-only mode, it displays the current rating without allowing changes.
///
/// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
class StarRating extends StatelessWidget {
  /// The current rating value (0-5)
  final double rating;

  /// Callback when rating changes (null for read-only mode)
  final ValueChanged<double>? onRatingChanged;

  /// Size of each star icon
  final double size;

  /// Color for filled/active stars
  final Color activeColor;

  /// Color for empty/inactive stars
  final Color inactiveColor;

  /// Whether the rating is read-only (no interaction)
  final bool readOnly;

  const StarRating({
    super.key,
    required this.rating,
    this.onRatingChanged,
    this.size = 24.0,
    this.activeColor = const Color(0xFFFFB800), // Gold color
    this.inactiveColor = const Color(0xFFE0E0E0), // Light gray
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        return GestureDetector(
          onTap: readOnly || onRatingChanged == null
              ? null
              : () => onRatingChanged!(starValue.toDouble()),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: size * 0.05),
            child: Icon(
              _getStarIcon(starValue),
              size: size,
              color: _getStarColor(starValue),
            ),
          ),
        );
      }),
    );
  }

  /// Determines which icon to use for a star based on the rating
  IconData _getStarIcon(int starValue) {
    if (rating >= starValue) {
      return Icons.star;
    } else if (rating >= starValue - 0.5) {
      return Icons.star_half;
    } else {
      return Icons.star_border;
    }
  }

  /// Determines the color for a star based on the rating
  Color _getStarColor(int starValue) {
    if (rating >= starValue - 0.5) {
      return activeColor;
    } else {
      return inactiveColor;
    }
  }
}
