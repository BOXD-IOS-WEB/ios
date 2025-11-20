import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/services/f1_api_service.dart';
import 'package:dio/dio.dart';

final f1ApiServiceProvider = Provider<F1ApiService>((ref) => F1ApiService());

// Fetch ALL races from all years
final allRacesProvider = FutureProvider<List<Race>>((ref) async {
  final f1Service = ref.watch(f1ApiServiceProvider);
  return f1Service.getAllRaces();
});

// Keep this for backward compatibility - now fetches current season from all races
final currentSeasonRacesProvider = FutureProvider<List<Race>>((ref) async {
  final allRaces = await ref.watch(allRacesProvider.future);
  final currentYear = DateTime.now().year;
  return allRaces.where((race) => race.season == currentYear).toList();
});

final nextRaceProvider = Provider<AsyncValue<Race?>>((ref) {
  final racesAsync = ref.watch(allRacesProvider);
  
  return racesAsync.whenData((races) {
    final now = DateTime.now();
    // Find the first race that hasn't happened yet
    try {
      return races.firstWhere((race) => race.date.isAfter(now));
    } catch (e) {
      return null; // Season over or no future races found
    }
  });
});
