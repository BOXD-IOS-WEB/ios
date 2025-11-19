import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';
import 'package:lucide_icons/lucide_icons.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  final _driverController = TextEditingController();
  final _teamController = TextEditingController();
  final _circuitController = TextEditingController();

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final user = ref.read(currentUserProfileProvider).value;
    if (user != null) {
      setState(() {
        _driverController.text = user.favoriteDriver ?? '';
        _teamController.text = user.favoriteTeam ?? '';
        _circuitController.text = user.favoriteCircuit ?? '';
      });
    }
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _driverController.dispose();
    _teamController.dispose();
    _circuitController.dispose();
    super.dispose();
  }

  Future<void> _saveFavorites() async {
    setState(() => _isLoading = true);
    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      final user = ref.read(currentUserProfileProvider).value;
      
      if (user != null) {
        await firestoreService.updateUserStats(user.id, {
          'favoriteDriver': _driverController.text,
          'favoriteTeam': _teamController.text,
          'favoriteCircuit': _circuitController.text,
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Favorites saved successfully')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving favorites: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
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
            _buildSectionHeader('ACCOUNT'),
            _buildCard(
              children: [
                _buildInfoRow('Email', user?.email ?? 'Loading...'),
                const SizedBox(height: 16),
                const Text('Change Password', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _buildTextField('Current Password', _currentPasswordController, obscureText: true),
                const SizedBox(height: 8),
                _buildTextField('New Password', _newPasswordController, obscureText: true),
                const SizedBox(height: 8),
                _buildTextField('Confirm Password', _confirmPasswordController, obscureText: true),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {}, // TODO: Implement change password
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.racingRed,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('UPDATE PASSWORD'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Favorites Section
            _buildSectionHeader('F1 FAVORITES'),
            _buildCard(
              children: [
                _buildTextField('Favorite Driver', _driverController),
                const SizedBox(height: 12),
                _buildTextField('Favorite Team', _teamController),
                const SizedBox(height: 12),
                _buildTextField('Favorite Circuit', _circuitController),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveFavorites,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.racingRed,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(_isLoading ? 'SAVING...' : 'SAVE FAVORITES'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Danger Zone
            _buildSectionHeader('DANGER ZONE', color: Colors.red),
            _buildCard(
              borderColor: Colors.red.withValues(alpha: 0.5),
              children: [
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _signOut,
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
                    onPressed: () {}, // TODO: Implement delete account
                    icon: const Icon(LucideIcons.trash2),
                    label: const Text('DELETE ACCOUNT'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
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

  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16)),
      ],
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, {bool obscureText = false}) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
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
    );
  }
}
