import 'package:flutter/material.dart';
import 'package:boxboxd/core/theme.dart';

/// F1 Favorites section widget for settings screen
/// Allows users to set their favorite driver, team, and circuit
class F1FavoritesSection extends StatefulWidget {
  final String? initialDriver;
  final String? initialTeam;
  final String? initialCircuit;
  final Future<void> Function(String driver, String team, String circuit) onSave;

  const F1FavoritesSection({
    super.key,
    this.initialDriver,
    this.initialTeam,
    this.initialCircuit,
    required this.onSave,
  });

  @override
  State<F1FavoritesSection> createState() => _F1FavoritesSectionState();
}

class _F1FavoritesSectionState extends State<F1FavoritesSection> {
  late final TextEditingController _driverController;
  late final TextEditingController _teamController;
  late final TextEditingController _circuitController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _driverController = TextEditingController(text: widget.initialDriver ?? '');
    _teamController = TextEditingController(text: widget.initialTeam ?? '');
    _circuitController = TextEditingController(text: widget.initialCircuit ?? '');
  }

  @override
  void dispose() {
    _driverController.dispose();
    _teamController.dispose();
    _circuitController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    setState(() => _isLoading = true);
    try {
      await widget.onSave(
        _driverController.text,
        _teamController.text,
        _circuitController.text,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Favorites saved successfully')),
        );
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

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
                onPressed: _isLoading ? null : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.racingRed,
                  foregroundColor: Colors.white,
                ),
                child: Text(_isLoading ? 'SAVING...' : 'SAVE FAVORITES'),
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

  Widget _buildTextField(String label, TextEditingController controller) {
    return TextField(
      controller: controller,
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
