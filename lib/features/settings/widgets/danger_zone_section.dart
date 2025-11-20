import 'package:flutter/material.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// Danger Zone section widget for settings screen
/// Contains destructive actions like sign out and delete account
class DangerZoneSection extends StatelessWidget {
  final VoidCallback onSignOut;
  final VoidCallback onDeleteAccount;

  const DangerZoneSection({
    super.key,
    required this.onSignOut,
    required this.onDeleteAccount,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('DANGER ZONE', color: Colors.red),
        _buildCard(
          borderColor: Colors.red.withValues(alpha: 0.5),
          children: [
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onSignOut,
                icon: const Icon(LucideIcons.logOut),
                label: const Text('SIGN OUT'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white54),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onDeleteAccount,
                icon: const Icon(LucideIcons.trash2),
                label: const Text('DELETE ACCOUNT'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Warning: Deleting your account will permanently remove all your data including race logs, lists, comments, and followers. This action cannot be undone.',
              style: TextStyle(
                color: Colors.red,
                fontSize: 12,
              ),
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
}
