import 'package:flutter/material.dart';
import 'package:boxboxd/core/theme.dart';

/// Notifications section widget for settings screen
/// Allows users to control notification preferences
class NotificationsSection extends StatefulWidget {
  final bool initialEmailNotifications;
  final bool initialPushNotifications;
  final bool initialLikesCommentsNotifications;
  final bool initialFollowersNotifications;
  final Future<void> Function({
    required bool emailNotifications,
    required bool pushNotifications,
    required bool likesCommentsNotifications,
    required bool followersNotifications,
  }) onSave;

  const NotificationsSection({
    super.key,
    required this.initialEmailNotifications,
    required this.initialPushNotifications,
    required this.initialLikesCommentsNotifications,
    required this.initialFollowersNotifications,
    required this.onSave,
  });

  @override
  State<NotificationsSection> createState() => _NotificationsSectionState();
}

class _NotificationsSectionState extends State<NotificationsSection> {
  late bool _emailNotifications;
  late bool _pushNotifications;
  late bool _likesCommentsNotifications;
  late bool _followersNotifications;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _emailNotifications = widget.initialEmailNotifications;
    _pushNotifications = widget.initialPushNotifications;
    _likesCommentsNotifications = widget.initialLikesCommentsNotifications;
    _followersNotifications = widget.initialFollowersNotifications;
  }

  Future<void> _handleToggle() async {
    setState(() => _isLoading = true);
    try {
      await widget.onSave(
        emailNotifications: _emailNotifications,
        pushNotifications: _pushNotifications,
        likesCommentsNotifications: _likesCommentsNotifications,
        followersNotifications: _followersNotifications,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notification preferences saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving notification preferences: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('NOTIFICATIONS'),
        _buildCard(
          children: [
            _buildToggleRow(
              'Email Notifications',
              'Receive notifications via email',
              _emailNotifications,
              (value) {
                setState(() => _emailNotifications = value);
                _handleToggle();
              },
            ),
            const Divider(color: Colors.white24, height: 32),
            _buildToggleRow(
              'Push Notifications',
              'Receive push notifications on your device',
              _pushNotifications,
              (value) {
                setState(() => _pushNotifications = value);
                _handleToggle();
              },
            ),
            const Divider(color: Colors.white24, height: 32),
            _buildToggleRow(
              'Likes & Comments',
              'Get notified when someone likes or comments on your content',
              _likesCommentsNotifications,
              (value) {
                setState(() => _likesCommentsNotifications = value);
                _handleToggle();
              },
            ),
            const Divider(color: Colors.white24, height: 32),
            _buildToggleRow(
              'New Followers',
              'Get notified when someone follows you',
              _followersNotifications,
              (value) {
                setState(() => _followersNotifications = value);
                _handleToggle();
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title, {Color color = Colors.white}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title,
        style: TextStyle(
          color: color,
          fontSize: 14,
          fontWeight: FontWeight.w900,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildCard({required List<Widget> children, Color? borderColor}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor ?? AppTheme.muted),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildToggleRow(
    String title,
    String description,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        Switch(
          value: value,
          onChanged: _isLoading ? null : onChanged,
          activeColor: AppTheme.racingRed,
        ),
      ],
    );
  }
}
