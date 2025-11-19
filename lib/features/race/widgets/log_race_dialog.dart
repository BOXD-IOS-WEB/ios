import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/services/race_log_service.dart';

final raceLogServiceProvider = Provider<RaceLogService>((ref) => RaceLogService());

class LogRaceDialog extends ConsumerStatefulWidget {
  final Race race;

  const LogRaceDialog({super.key, required this.race});

  @override
  ConsumerState<LogRaceDialog> createState() => _LogRaceDialogState();
}

class _LogRaceDialogState extends ConsumerState<LogRaceDialog> {
  final _formKey = GlobalKey<FormState>();
  final _reviewController = TextEditingController();
  double _rating = 0;
  String _sessionType = 'race';
  String _watchMode = 'live';
  bool _spoilerWarning = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please rate the race')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final log = RaceLog(
        userId: '', // Set by service
        username: '', // Set by service
        raceYear: widget.race.season,
        raceName: widget.race.gpName,
        raceLocation: widget.race.circuit,
        round: widget.race.round,
        countryCode: widget.race.country,
        dateWatched: DateTime.now(),
        sessionType: _sessionType,
        watchMode: _watchMode,
        rating: _rating,
        review: _reviewController.text.trim(),
        tags: [],
        companions: [],
        mediaUrls: [],
        spoilerWarning: _spoilerWarning,
        visibility: 'public',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        likesCount: 0,
        commentsCount: 0,
        likedBy: [],
      );

      await ref.read(raceLogServiceProvider).createRaceLog(log);
      
      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.black.withValues(alpha: 0.9),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppTheme.racingRed.withValues(alpha: 0.5)),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'LOG RACE',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppTheme.racingRed,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.race.gpName.toUpperCase(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 24),

              // Rating
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (index) {
                    return IconButton(
                      onPressed: () {
                        setState(() {
                          _rating = index + 1.0;
                        });
                      },
                      icon: Icon(
                        index < _rating ? LucideIcons.star : LucideIcons.star,
                        color: index < _rating ? Colors.amber : Colors.grey,
                        fill: index < _rating ? 1.0 : 0.0, // Lucide icons don't support fill property directly like this usually, but assuming standard Icon usage
                      ),
                      // Using standard Icons for star to ensure fill works if Lucide doesn't support it easily
                      // Actually let's stick to standard Icons for filled star
                      // icon: Icon(
                      //   Icons.star,
                      //   color: index < _rating ? Colors.amber : Colors.white24,
                      // ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 24),

              // Review
              TextFormField(
                controller: _reviewController,
                style: const TextStyle(color: Colors.white),
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Write your review...',
                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Toggles
              Row(
                children: [
                  Checkbox(
                    value: _spoilerWarning,
                    onChanged: (val) => setState(() => _spoilerWarning = val!),
                    fillColor: WidgetStateProperty.resolveWith((states) => 
                      states.contains(WidgetState.selected) ? AppTheme.racingRed : Colors.white24
                    ),
                  ),
                  const Text('Contains Spoilers', style: TextStyle(color: Colors.white)),
                ],
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.racingRed,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text(
                        'LOG RACE',
                        style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
