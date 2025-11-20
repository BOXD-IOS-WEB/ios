import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';
import 'package:boxboxd/features/settings/widgets/account_section.dart';
import 'package:boxboxd/features/settings/widgets/f1_favorites_section.dart';
import 'package:boxboxd/features/settings/widgets/privacy_section.dart';
import 'package:boxboxd/features/settings/widgets/notifications_section.dart';
import 'package:boxboxd/features/settings/widgets/danger_zone_section.dart';
import 'package:boxboxd/features/settings/widgets/delete_account_dialog.dart';
import 'package:boxboxd/core/services/data_export_service.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _isLoading = false;

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _saveFavorites(String driver, String team, String circuit) async {
    final firestoreService = ref.read(firestoreServiceProvider);
    final user = ref.read(currentUserProfileProvider).value;
    
    if (user != null) {
      // Convert empty strings to null
      final driverValue = driver.trim().isEmpty ? null : driver.trim();
      final teamValue = team.trim().isEmpty ? null : team.trim();
      final circuitValue = circuit.trim().isEmpty ? null : circuit.trim();
      
      await firestoreService.updateUserStats(user.id, {
        'favoriteDriver': driverValue,
        'favoriteTeam': teamValue,
        'favoriteCircuit': circuitValue,
      });
      
      // Invalidate the user profile provider to refresh the data
      ref.invalidate(currentUserProfileProvider);
    }
  }

  Future<void> _savePrivacySettings(bool privateAccount, bool showActivityStatus) async {
    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      final user = ref.read(currentUserProfileProvider).value;
      
      if (user != null) {
        await firestoreService.updateUserProfile(user.id, {
          'privateAccount': privateAccount,
          'showActivityStatus': showActivityStatus,
        });
        
        // Invalidate the user profile provider to refresh the data
        ref.invalidate(currentUserProfileProvider);
      }
    } catch (e) {
      rethrow; // Let the PrivacySection handle the error display
    }
  }

  Future<void> _saveNotificationSettings({
    required bool emailNotifications,
    required bool pushNotifications,
    required bool likesCommentsNotifications,
    required bool followersNotifications,
  }) async {
    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      final user = ref.read(currentUserProfileProvider).value;
      
      if (user != null) {
        await firestoreService.updateUserProfile(user.id, {
          'emailNotifications': emailNotifications,
          'pushNotifications': pushNotifications,
          'likesCommentsNotifications': likesCommentsNotifications,
          'followersNotifications': followersNotifications,
        });
        
        // Invalidate the user profile provider to refresh the data
        ref.invalidate(currentUserProfileProvider);
      }
    } catch (e) {
      rethrow; // Let the NotificationsSection handle the error display
    }
  }

  Future<void> _showChangePasswordDialog() async {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.card,
        title: const Text(
          'Change Password',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentPasswordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Current Password',
                labelStyle: const TextStyle(color: Colors.grey),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: AppTheme.racingRed),
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.black26,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: newPasswordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'New Password',
                labelStyle: const TextStyle(color: Colors.grey),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: AppTheme.racingRed),
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.black26,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: confirmPasswordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Confirm Password',
                labelStyle: const TextStyle(color: Colors.grey),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: AppTheme.racingRed),
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.black26,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('CANCEL', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              final currentPassword = currentPasswordController.text.trim();
              final newPassword = newPasswordController.text.trim();
              final confirmPassword = confirmPasswordController.text.trim();

              if (currentPassword.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('All password fields are required')),
                );
                return;
              }

              if (newPassword.length < 8) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('New password must be at least 8 characters')),
                );
                return;
              }

              if (newPassword != confirmPassword) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('New password and confirmation do not match')),
                );
                return;
              }

              try {
                final authService = ref.read(authServiceProvider);
                await authService.changePassword(currentPassword, newPassword);
                
                if (context.mounted) {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Password changed successfully'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error: ${e.toString().replaceAll('Exception: ', '')}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.racingRed,
              foregroundColor: Colors.white,
            ),
            child: const Text('CHANGE PASSWORD'),
          ),
        ],
      ),
    );

    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
  }

  Future<void> _signOut() async {
    try {
      await ref.read(authServiceProvider).signOut();
      // Router will handle redirection
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error signing out: $e')),
        );
      }
    }
  }

  Future<void> _exportData() async {
    setState(() => _isLoading = true);
    
    try {
      final exportService = DataExportService();
      
      // Show progress dialog
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            backgroundColor: AppTheme.card,
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: AppTheme.racingRed),
                SizedBox(height: 16),
                Text(
                  'Collecting your data...',
                  style: TextStyle(color: Colors.white),
                ),
              ],
            ),
          ),
        );
      }
      
      // Export data
      final data = await exportService.exportUserData();
      final jsonString = exportService.exportToJsonString(data);
      
      // Close progress dialog
      if (mounted) {
        Navigator.of(context).pop();
      }
      
      // Save and share the file
      final directory = await getApplicationDocumentsDirectory();
      final timestamp = DateTime.now().toIso8601String().replaceAll(':', '-');
      final file = File('${directory.path}/boxboxd_data_export_$timestamp.json');
      await file.writeAsString(jsonString);
      
      // Share the file
      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'BoxBoxd Data Export',
        text: 'Your BoxBoxd data export from ${DateTime.now().toLocal()}',
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Data exported successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // Close progress dialog if still open
      if (mounted && Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error exporting data: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteAccount() async {
    // Show confirmation dialog
    final password = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (context) => const DeleteAccountDialog(),
    );

    // User cancelled
    if (password == null) return;

    // Show loading indicator
    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    try {
      final authService = ref.read(authServiceProvider);
      await authService.deleteAccount(password);
      
      // Close loading dialog
      if (mounted) {
        Navigator.of(context).pop();
        
        // Navigate to login screen
        context.go('/login');
        
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) {
        Navigator.of(context).pop();
        
        // Show error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting account: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'SETTINGS',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: 1,
            color: Colors.white,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Account Section
            AccountSection(
              email: user?.email ?? 'Loading...',
              onChangePassword: _showChangePasswordDialog,
            ),

            const SizedBox(height: 24),

            // F1 Favorites Section
            F1FavoritesSection(
              initialDriver: user?.favoriteDriver,
              initialTeam: user?.favoriteTeam,
              initialCircuit: user?.favoriteCircuit,
              onSave: _saveFavorites,
            ),

            const SizedBox(height: 24),

            // Privacy Section
            PrivacySection(
              initialPrivateAccount: user?.privateAccount ?? false,
              initialShowActivityStatus: user?.showActivityStatus ?? true,
              onSave: _savePrivacySettings,
            ),

            const SizedBox(height: 24),

            // Notifications Section
            NotificationsSection(
              initialEmailNotifications: user?.emailNotifications ?? true,
              initialPushNotifications: user?.pushNotifications ?? true,
              initialLikesCommentsNotifications: user?.likesCommentsNotifications ?? true,
              initialFollowersNotifications: user?.followersNotifications ?? true,
              onSave: _saveNotificationSettings,
            ),

            const SizedBox(height: 24),

            // Data Management Section
            _buildSectionHeader('DATA MANAGEMENT'),
            _buildCard(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _exportData,
                    icon: const Icon(LucideIcons.download),
                    label: Text(_isLoading ? 'EXPORTING...' : 'EXPORT MY DATA'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white54),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Download all your data including profile, race logs, lists, comments, and more in JSON format.',
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Support & Legal Section
            _buildSectionHeader('SUPPORT & LEGAL'),
            _buildCard(
              children: [
                _buildLinkButton(
                  icon: LucideIcons.helpCircle,
                  label: 'Support',
                  onTap: () => context.push('/support'),
                ),
                const SizedBox(height: 8),
                _buildLinkButton(
                  icon: LucideIcons.shield,
                  label: 'Privacy Policy',
                  onTap: () => context.push('/privacy-policy'),
                ),
                const SizedBox(height: 8),
                _buildLinkButton(
                  icon: LucideIcons.fileText,
                  label: 'Terms of Service',
                  onTap: () => context.push('/terms-of-service'),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Danger Zone
            DangerZoneSection(
              onSignOut: _signOut,
              onDeleteAccount: _deleteAccount,
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
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

  Widget _buildLinkButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        child: Row(
          children: [
            Icon(icon, color: Colors.white70, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
            ),
            const Icon(
              LucideIcons.chevronRight,
              color: Colors.white54,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
