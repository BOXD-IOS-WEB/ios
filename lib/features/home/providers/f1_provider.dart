import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/services/f1_api_service.dart';
import 'package:dio/dio.dart';

final f1ApiServiceProvider = Provider<F1ApiService>((ref) => F1ApiService(dio: Dio()));

final currentSeasonRacesProvider = FutureProvider<List<Race>>((ref) async {
  final f1Service = ref.watch(f1ApiServiceProvider);
  return f1Service.getCurrentSeasonRaces();
});

final nextRaceProvider = Provider<AsyncValue<Race?>>((ref) {
  final racesAsync = ref.watch(currentSeasonRacesProvider);
  
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
