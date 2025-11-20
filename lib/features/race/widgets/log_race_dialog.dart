import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/services/race_log_service.dart';
import 'package:boxboxd/core/services/f1_data_service.dart';
import 'package:boxboxd/core/constants/f1_data.dart';
import 'package:boxboxd/core/widgets/star_rating.dart';

final raceLogServiceProvider = Provider<RaceLogService>((ref) => RaceLogService());
final f1DataServiceProvider = Provider<F1DataService>((ref) => F1DataService());

class LogRaceDialog extends ConsumerStatefulWidget {
  final Race? race;
  final RaceLog? existingLog;

  const LogRaceDialog({
    super.key,
    this.race,
    this.existingLog,
  });

  @override
  ConsumerState<LogRaceDialog> createState() => _LogRaceDialogState();
}

class _LogRaceDialogState extends ConsumerState<LogRaceDialog> {
  final _formKey = GlobalKey<FormState>();
  final _reviewController = TextEditingController();
  final _companionsController = TextEditingController();
  
  // Form state
  Circuit? _selectedCircuit;
  int _selectedYear = DateTime.now().year;
  String _sessionType = 'race';
  String _watchMode = 'live';
  double _rating = 0;
  Driver? _selectedDriverOfTheDay;
  String? _raceWinner;
  List<String> _companions = [];
  DateTime _dateWatched = DateTime.now();
  String _visibility = 'public';
  bool _spoilerWarning = false;
  bool _isSubmitting = false;
  
  // Available years (last 10 years)
  late List<int> _availableYears;
  
  // Session types
  final List<String> _sessionTypes = [
    'race',
    'sprint',
    'qualifying',
    'sprint qualifying',
  ];
  
  // Watch modes
  final List<String> _watchModes = [
    'live',
    'replay',
    'TV broadcast',
    'highlights',
    'attended in person',
  ];
  
  // Visibility options
  final List<String> _visibilityOptions = [
    'public',
    'private',
    'friends',
  ];

  @override
  void initState() {
    super.initState();
    
    // Generate last 10 years
    final currentYear = DateTime.now().year;
    _availableYears = List.generate(10, (index) => currentYear - index);
    
    // Initialize from existing log or race, or start fresh
    if (widget.existingLog != null) {
      _initializeFromExistingLog();
    } else if (widget.race != null) {
      _initializeFromRace();
    }
    // If neither is provided, user will select circuit and other details manually
  }
  
  void _initializeFromExistingLog() {
    final log = widget.existingLog!;
    final f1DataService = ref.read(f1DataServiceProvider);
    
    // Find circuit by location name
    final circuits = f1DataService.getCircuits();
    _selectedCircuit = circuits.firstWhere(
      (c) => c.location == log.raceLocation || c.name == log.raceLocation,
      orElse: () => circuits.first,
    );
    
    _selectedYear = log.raceYear;
    _sessionType = log.sessionType;
    _watchMode = log.watchMode;
    _rating = log.rating;
    _reviewController.text = log.review;
    
    // Find driver by name
    if (log.driverOfTheDay != null) {
      final drivers = f1DataService.getDrivers();
      _selectedDriverOfTheDay = drivers.firstWhere(
        (d) => d.name == log.driverOfTheDay,
        orElse: () => drivers.first,
      );
    }
    
    _raceWinner = log.raceWinner;
    _companions = List.from(log.companions);
    _companionsController.text = _companions.join(', ');
    _dateWatched = log.dateWatched;
    _visibility = log.visibility;
    _spoilerWarning = log.spoilerWarning;
  }
  
  void _initializeFromRace() {
    final race = widget.race!;
    final f1DataService = ref.read(f1DataServiceProvider);
    
    // Find circuit by name
    final circuits = f1DataService.getCircuits();
    _selectedCircuit = circuits.firstWhere(
      (c) => c.name == race.circuit || c.location == race.circuit,
      orElse: () => circuits.first,
    );
    
    _selectedYear = race.season;
  }

  @override
  void dispose() {
    _reviewController.dispose();
    _companionsController.dispose();
    super.dispose();
  }

  void _parseCompanions() {
    final text = _companionsController.text.trim();
    if (text.isEmpty) {
      _companions = [];
    } else {
      _companions = text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .take(2) // Max 2 companions
          .toList();
    }
  }
  
  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateWatched,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: ColorScheme.dark(
              primary: AppTheme.racingRed,
              onPrimary: Colors.white,
              surface: Colors.grey[900]!,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null) {
      setState(() {
        _dateWatched = picked;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Validate required fields
    if (_selectedCircuit == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a circuit')),
      );
      return;
    }
    
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please rate the race')),
      );
      return;
    }
    
    if (_selectedDriverOfTheDay == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select driver of the day')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      _parseCompanions();
      
      final log = RaceLog(
        id: widget.existingLog?.id,
        userId: widget.existingLog?.userId ?? '', // Set by service
        username: widget.existingLog?.username ?? '', // Set by service
        userAvatar: widget.existingLog?.userAvatar,
        raceYear: _selectedYear,
        raceName: _selectedCircuit!.name,
        raceLocation: _selectedCircuit!.location,
        round: widget.race?.round ?? widget.existingLog?.round,
        countryCode: _selectedCircuit!.countryCode,
        dateWatched: _dateWatched,
        sessionType: _sessionType,
        watchMode: _watchMode,
        rating: _rating,
        review: _reviewController.text.trim(),
        tags: widget.existingLog?.tags ?? [],
        companions: _companions,
        driverOfTheDay: _selectedDriverOfTheDay!.name,
        raceWinner: _raceWinner,
        mediaUrls: widget.existingLog?.mediaUrls ?? [],
        spoilerWarning: _spoilerWarning,
        visibility: _visibility,
        createdAt: widget.existingLog?.createdAt ?? DateTime.now(),
        updatedAt: DateTime.now(),
        likesCount: widget.existingLog?.likesCount ?? 0,
        commentsCount: widget.existingLog?.commentsCount ?? 0,
        likedBy: widget.existingLog?.likedBy ?? [],
      );

      if (widget.existingLog != null) {
        // Update existing log
        await ref.read(raceLogServiceProvider).updateRaceLog(widget.existingLog!.id!, log);
      } else {
        // Create new log
        await ref.read(raceLogServiceProvider).createRaceLog(log);
      }
      
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
    final f1DataService = ref.read(f1DataServiceProvider);
    final circuits = f1DataService.getCircuits();
    final drivers = f1DataService.getDrivers();
    
    return Dialog(
      backgroundColor: Colors.black.withValues(alpha: 0.95),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppTheme.racingRed.withValues(alpha: 0.5)),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppTheme.racingRed.withValues(alpha: 0.3),
                  ),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    widget.existingLog != null ? 'EDIT RACE LOG' : 'LOG RACE',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.racingRed,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                  if (_selectedCircuit != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _selectedCircuit!.name.toUpperCase(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            
            // Scrollable form
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Circuit Selector
                      _buildLabel('Circuit *'),
                      DropdownButtonFormField<Circuit>(
                        initialValue: _selectedCircuit,
                        dropdownColor: Colors.grey[900],
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(),
                        items: circuits.map((circuit) {
                          return DropdownMenuItem(
                            value: circuit,
                            child: Text(
                              '${circuit.name} (${circuit.location})',
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (circuit) {
                          setState(() {
                            _selectedCircuit = circuit;
                          });
                        },
                        validator: (value) => value == null ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),
                      
                      // Year and Session Type Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Year *'),
                                DropdownButtonFormField<int>(
                                  initialValue: _selectedYear,
                                  dropdownColor: Colors.grey[900],
                                  style: const TextStyle(color: Colors.white),
                                  decoration: _inputDecoration(),
                                  items: _availableYears.map((year) {
                                    return DropdownMenuItem(
                                      value: year,
                                      child: Text(year.toString()),
                                    );
                                  }).toList(),
                                  onChanged: (year) {
                                    setState(() {
                                      _selectedYear = year!;
                                    });
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Session Type *'),
                                DropdownButtonFormField<String>(
                                  initialValue: _sessionType,
                                  dropdownColor: Colors.grey[900],
                                  style: const TextStyle(color: Colors.white),
                                  decoration: _inputDecoration(),
                                  items: _sessionTypes.map((type) {
                                    return DropdownMenuItem(
                                      value: type,
                                      child: Text(_capitalize(type)),
                                    );
                                  }).toList(),
                                  onChanged: (type) {
                                    setState(() {
                                      _sessionType = type!;
                                    });
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Watch Mode
                      _buildLabel('Watch Mode *'),
                      DropdownButtonFormField<String>(
                        initialValue: _watchMode,
                        dropdownColor: Colors.grey[900],
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(),
                        items: _watchModes.map((mode) {
                          return DropdownMenuItem(
                            value: mode,
                            child: Text(_capitalize(mode)),
                          );
                        }).toList(),
                        onChanged: (mode) {
                          setState(() {
                            _watchMode = mode!;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      
                      // Date Watched
                      _buildLabel('Date Watched *'),
                      InkWell(
                        onTap: _selectDate,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Icon(LucideIcons.calendar, color: Colors.white.withValues(alpha: 0.5), size: 20),
                              const SizedBox(width: 12),
                              Text(
                                '${_dateWatched.day}/${_dateWatched.month}/${_dateWatched.year}',
                                style: const TextStyle(color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Rating
                      _buildLabel('Rating *'),
                      Center(
                        child: StarRating(
                          rating: _rating,
                          size: 40,
                          activeColor: Colors.amber,
                          inactiveColor: Colors.white24,
                          onRatingChanged: (rating) {
                            setState(() {
                              _rating = rating;
                            });
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Driver of the Day
                      _buildLabel('Driver of the Day *'),
                      DropdownButtonFormField<Driver>(
                        initialValue: _selectedDriverOfTheDay,
                        dropdownColor: Colors.grey[900],
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(),
                        items: drivers.map((driver) {
                          return DropdownMenuItem(
                            value: driver,
                            child: Text('${driver.name} (${driver.team})'),
                          );
                        }).toList(),
                        onChanged: (driver) {
                          setState(() {
                            _selectedDriverOfTheDay = driver;
                          });
                        },
                        validator: (value) => value == null ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),
                      
                      // Companions
                      _buildLabel('Companions (max 2, comma-separated)'),
                      TextFormField(
                        controller: _companionsController,
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(hint: 'username1, username2'),
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            final companions = value.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
                            if (companions.length > 2) {
                              return 'Maximum 2 companions allowed';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      
                      // Review
                      _buildLabel('Review'),
                      TextFormField(
                        controller: _reviewController,
                        style: const TextStyle(color: Colors.white),
                        maxLines: 4,
                        decoration: _inputDecoration(hint: 'Write your review...'),
                      ),
                      const SizedBox(height: 16),
                      
                      // Visibility
                      _buildLabel('Visibility *'),
                      DropdownButtonFormField<String>(
                        initialValue: _visibility,
                        dropdownColor: Colors.grey[900],
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(),
                        items: _visibilityOptions.map((option) {
                          return DropdownMenuItem(
                            value: option,
                            child: Text(_capitalize(option)),
                          );
                        }).toList(),
                        onChanged: (option) {
                          setState(() {
                            _visibility = option!;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      
                      // Spoiler Warning
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
                    ],
                  ),
                ),
              ),
            ),
            
            // Footer with buttons
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: AppTheme.racingRed.withValues(alpha: 0.3),
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('CANCEL'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
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
                          : Text(
                              widget.existingLog != null ? 'UPDATE LOG' : 'LOG RACE',
                              style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.7),
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
  
  InputDecoration _inputDecoration({String? hint}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.05),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
    );
  }
  
  String _capitalize(String text) {
    if (text.isEmpty) return text;
    return text.split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }
}
