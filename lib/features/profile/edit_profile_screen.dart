import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/services/auth_service.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _photoUrlController = TextEditingController();
  final _favoriteDriverController = TextEditingController();
  final _favoriteCircuitController = TextEditingController();
  final _favoriteTeamController = TextEditingController();
  
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final authService = ref.read(authServiceProvider);
      final userId = authService.currentUser?.uid;
      
      if (userId != null) {
        final profile = await authService.getUserProfile(userId);
        final stats = await authService.getUserStats(userId);
        
        if (profile != null) {
          _nameController.text = profile['name'] ?? '';
          _descriptionController.text = profile['description'] ?? '';
          _photoUrlController.text = profile['photoURL'] ?? '';
        }
        
        if (stats != null) {
          _favoriteDriverController.text = stats['favoriteDriver'] ?? '';
          _favoriteCircuitController.text = stats['favoriteCircuit'] ?? '';
          _favoriteTeamController.text = stats['favoriteTeam'] ?? '';
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading profile: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final authService = ref.read(authServiceProvider);
      final userId = authService.currentUser?.uid;
      
      if (userId != null) {
        // Update user profile
        await authService.updateUserProfile(userId, {
          'name': _nameController.text.trim(),
          'description': _descriptionController.text.trim(),
          'photoURL': _photoUrlController.text.trim(),
        });
        
        // Update user stats (favorites)
        await authService.updateUserProfile(userId, {
          'favoriteDriver': _favoriteDriverController.text.trim(),
          'favoriteCircuit': _favoriteCircuitController.text.trim(),
          'favoriteTeam': _favoriteTeamController.text.trim(),
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile updated successfully')),
          );
          context.pop();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving profile: $e')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _photoUrlController.dispose();
    _favoriteDriverController.dispose();
    _favoriteCircuitController.dispose();
    _favoriteTeamController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'EDIT PROFILE',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
        backgroundColor: Colors.black,
        actions: [
          if (!_isLoading)
            TextButton(
              onPressed: _isSaving ? null : _saveProfile,
              child: _isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppTheme.racingRed,
                      ),
                    )
                  : const Text(
                      'SAVE',
                      style: TextStyle(
                        color: AppTheme.racingRed,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
                      ),
                    ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.racingRed),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Profile Picture Preview
                    Center(
                      child: Stack(
                        children: [
                          CircleAvatar(
                            radius: 60,
                            backgroundImage: _photoUrlController.text.isNotEmpty
                                ? NetworkImage(_photoUrlController.text)
                                : null,
                            backgroundColor: AppTheme.racingRed,
                            child: _photoUrlController.text.isEmpty
                                ? Text(
                                    _nameController.text.isNotEmpty
                                        ? _nameController.text[0].toUpperCase()
                                        : '?',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 40,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  )
                                : null,
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: AppTheme.racingRed,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                LucideIcons.camera,
                                size: 20,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Basic Info Section
                    _buildSectionTitle('BASIC INFO'),
                    const SizedBox(height: 16),
                    
                    _buildTextField(
                      controller: _nameController,
                      label: 'Name',
                      icon: LucideIcons.user,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Name is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    _buildTextField(
                      controller: _descriptionController,
                      label: 'Bio',
                      icon: LucideIcons.fileText,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    
                    _buildTextField(
                      controller: _photoUrlController,
                      label: 'Photo URL',
                      icon: LucideIcons.image,
                      hint: 'https://example.com/photo.jpg',
                    ),
                    
                    const SizedBox(height: 32),

                    // Favorites Section
                    _buildSectionTitle('FAVORITES'),
                    const SizedBox(height: 16),
                    
                    _buildTextField(
                      controller: _favoriteDriverController,
                      label: 'Favorite Driver',
                      icon: LucideIcons.user,
                      hint: 'e.g., Max Verstappen',
                    ),
                    const SizedBox(height: 16),
                    
                    _buildTextField(
                      controller: _favoriteCircuitController,
                      label: 'Favorite Circuit',
                      icon: LucideIcons.mapPin,
                      hint: 'e.g., Spa-Francorchamps',
                    ),
                    const SizedBox(height: 16),
                    
                    _buildTextField(
                      controller: _favoriteTeamController,
                      label: 'Favorite Team',
                      icon: LucideIcons.users,
                      hint: 'e.g., Ferrari',
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.w900,
        letterSpacing: 1,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        labelStyle: const TextStyle(color: Colors.white54),
        hintStyle: const TextStyle(color: Colors.white24),
        prefixIcon: Icon(icon, color: Colors.white54, size: 20),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.racingRed),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.racingRed),
        ),
      ),
    );
  }
}
