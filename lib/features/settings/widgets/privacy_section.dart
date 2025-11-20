import 'package:flutter/material.dart';
import 'package:boxboxd/core/theme.dart';

/// Privacy section widget for settings screen
/// Allows users to control privacy settings like private account and activity status
class PrivacySection extends StatefulWidget {
  final bool initialPrivateAccount;
  final bool initialShowActivityStatus;
  final Future<void> Function(bool privateAccount, bool showActivityStatus) onSave;

  const PrivacySection({
    super.key,
    required this.initialPrivateAccount,
    required this.initialShowActivityStatus,
    required this.onSave,
  });

  @override
  State<PrivacySection> createState() => _PrivacySectionState();
}

class _PrivacySectionState extends State<PrivacySection> {
  late bool _privateAccount;
  late bool _showActivityStatus;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _privateAccount = widget.initialPrivateAccount;
    _showActivityStatus = widget.initialShowActivityStatus;
  }

  Future<void> _handleToggle() async {
    setState(() => _isLoading = true);
    try {
      await widget.onSave(_privateAccount, _showActivityStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Privacy settings saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving privacy settings: $e')),
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
        _buildSectionHeader('PRIVACY'),
        _buildCard(
          children: [
            _buildToggleRow(
              'Private Account',
              'When enabled, only approved followers can see your activity',
              _privateAccount,
              (value) {
                setState(() => _privateAccount = value);
                _handleToggle();
              },
            ),
            const Divider(color: Colors.white24, height: 32),
            _buildToggleRow(
              'Show Activity Status',
              'Let others see when you\'re active',
              _showActivityStatus,
              (value) {
                setState(() => _showActivityStatus = value);
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
