import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/features/home/providers/f1_provider.dart';
import 'package:boxboxd/features/race/race_detail_screen.dart';
import 'package:go_router/go_router.dart';

import 'package:boxboxd/core/services/race_log_service.dart';
import 'package:boxboxd/core/models/race_log.dart';

// Providers
class SelectedSeasonNotifier extends Notifier<int> {
  @override
  int build() => DateTime.now().year;
  
  void setSeason(int year) {
    state = year;
  }
}

final selectedSeasonProvider = NotifierProvider<SelectedSeasonNotifier, int>(
  () => SelectedSeasonNotifier(),
);
final seasonRacesProvider = FutureProvider.family<List<Race>, int>((ref, season) async {
  final api = ref.read(f1ApiServiceProvider);
  return api.getRacesBySeason(season);
});

final raceLogServiceProvider = Provider<RaceLogService>((ref) => RaceLogService());

final publicLogsProvider = FutureProvider<List<RaceLog>>((ref) async {
  final service = ref.read(raceLogServiceProvider);
  return service.getPublicRaceLogs();
});

final highRatedLogsProvider = FutureProvider<List<RaceLog>>((ref) async {
  final service = ref.read(raceLogServiceProvider);
  return service.getHighRatedLogs();
});

class ExploreScreen extends ConsumerWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.black,
          title: const Text(
            'EXPLORE',
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 24,
              letterSpacing: 1,
              color: Colors.white,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(LucideIcons.search, color: Colors.white),
              onPressed: () => context.push('/search'),
            ),
          ],
          bottom: TabBar(
            indicatorColor: AppTheme.racingRed,
            labelColor: AppTheme.racingRed,
            unselectedLabelColor: Colors.white54,
            labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
            tabs: const [
              Tab(text: 'SEASONS'),
              Tab(text: 'TRENDING'),
              Tab(text: 'REVIEWS'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _SeasonsTab(),
            _TrendingTab(),
            _ReviewsTab(),
          ],
        ),
      ),
    );
  }
}

class _SeasonsTab extends ConsumerWidget {
  const _SeasonsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedSeason = ref.watch(selectedSeasonProvider);
    final racesAsync = ref.watch(seasonRacesProvider(selectedSeason));

    return Column(
      children: [
        // Season Selector
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [2025, 2024, 2023, 2022, 2021, 2020].map((year) {
              final isSelected = year == selectedSeason;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(year.toString()),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      ref.read(selectedSeasonProvider.notifier).setSeason(year);
                    }
                  },
                  selectedColor: AppTheme.racingRed,
                  backgroundColor: Colors.white.withValues(alpha: 0.1),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: FontWeight.bold,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? AppTheme.racingRed : Colors.transparent,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),

        // Races Grid
        Expanded(
          child: racesAsync.when(
            data: (races) {
              if (races.isEmpty) {
                return const Center(child: Text('No races found', style: TextStyle(color: Colors.white54)));
              }
              return GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.8,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: races.length,
                itemBuilder: (context, index) {
                  final race = races[index];
                  return GestureDetector(
                    onTap: () => context.push('/race/${race.season}/${race.round}'),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                image: race.posterUrl != null ? DecorationImage(
                                  image: NetworkImage(race.posterUrl!),
                                  fit: BoxFit.cover,
                                ) : null,
                              ),
                              child: race.posterUrl == null ? Center(
                                child: Text(
                                  race.country ?? 'Unknown',
                                  style: const TextStyle(
                                    fontSize: 40,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white10,
                                  ),
                                ),
                              ) : null,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ROUND ${race.round}',
                                  style: const TextStyle(
                                    color: AppTheme.racingRed,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  race.gpName,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  race.circuit,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.5),
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
            error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
          ),
        ),
      ],
    );
  }
}

class _TrendingTab extends ConsumerWidget {
  const _TrendingTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trendingAsync = ref.watch(highRatedLogsProvider);

    return trendingAsync.when(
      data: (logs) {
        if (logs.isEmpty) {
          return const Center(child: Text('No trending races yet', style: TextStyle(color: Colors.white54)));
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: logs.length,
          separatorBuilder: (context, index) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final log = logs[index];
            return _ReviewCard(log: log);
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
      error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
    );
  }
}

class _ReviewsTab extends ConsumerWidget {
  const _ReviewsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(publicLogsProvider);

    return reviewsAsync.when(
      data: (logs) {
        if (logs.isEmpty) {
          return const Center(child: Text('No reviews yet', style: TextStyle(color: Colors.white54)));
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: logs.length,
          separatorBuilder: (context, index) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final log = logs[index];
            return _ReviewCard(log: log);
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
      error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final dynamic log; // Using dynamic to avoid import cycle if possible, but better to import RaceLog
  
  const _ReviewCard({required this.log});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundImage: log.userAvatar.isNotEmpty ? NetworkImage(log.userAvatar) : null,
                backgroundColor: AppTheme.racingRed,
                child: log.userAvatar.isEmpty ? Text(log.username[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 12)) : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      log.username,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Text(
                      'watched ${log.raceName} ${log.raceYear}',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12),
                    ),
                  ],
                ),
              ),
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    index < log.rating ? LucideIcons.star : LucideIcons.star,
                    size: 14,
                    color: index < log.rating ? AppTheme.racingRed : Colors.white24,
                  );
                }),
              ),
            ],
          ),
          if (log.review.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              log.review,
              style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(LucideIcons.heart, size: 14, color: Colors.white54),
              const SizedBox(width: 4),
              Text(log.likesCount.toString(), style: const TextStyle(color: Colors.white54, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}
