import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/widgets/responsive_flex.dart';
import 'package:boxboxd/features/home/providers/f1_provider.dart';
import 'package:boxboxd/features/race/widgets/log_race_dialog.dart';
import 'package:boxboxd/core/services/race_log_service.dart';

final raceLogServiceProvider = Provider<RaceLogService>((ref) => RaceLogService());

class RaceDetailScreen extends ConsumerWidget {
  final int season;
  final int round;

  const RaceDetailScreen({
    super.key,
    required this.season,
    required this.round,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final racesAsync = ref.watch(currentSeasonRacesProvider);

    return Scaffold(
      body: racesAsync.when(
        data: (races) {
          final race = races.firstWhere(
            (r) => r.season == season && r.round == round,
            orElse: () => throw Exception('Race not found'),
          );
          return _buildContent(context, ref, race);
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, Race race) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 300,
          pinned: true,
          backgroundColor: Colors.black,
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/ferrari-f1.jpg', // Placeholder, ideally use race.posterUrl
                  fit: BoxFit.cover,
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.8),
                        Colors.black,
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  left: 20,
                  right: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.racingRed,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'ROUND ${race.round}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        race.gpName.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          height: 1,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        race.circuit.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          letterSpacing: 1,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Action Buttons
                ResponsiveFlex(
                  breakpoint: 400,
                  spacing: 12,
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final result = await showDialog(
                            context: context,
                            builder: (context) => LogRaceDialog(race: race),
                          );
                          if (result == true) {
                            // TODO: Refresh reviews
                          }
                        },
                        icon: const Icon(LucideIcons.plus, size: 18),
                        label: const Text('LOG RACE'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.racingRed,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          textStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                        ),
                      ),
                    ),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {}, // TODO: Add to watchlist
                        icon: const Icon(LucideIcons.eye, size: 18),
                        label: const Text('WATCHLIST'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white24),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          textStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Race Info Grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 2.5,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  children: [
                    _buildInfoCard('DATE', _formatDate(race.date)),
                    _buildInfoCard('COUNTRY', race.country ?? 'Unknown'),
                    if (race.winner != null) _buildInfoCard('WINNER', race.winner!),
                    _buildInfoCard('RATING', race.rating != null && race.rating! > 0 ? race.rating!.toStringAsFixed(1) : 'N/A'),
                  ],
                ),
                const SizedBox(height: 32),

                // Community Reviews Section
                const Text(
                  'COMMUNITY THOUGHTS',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 16),
                _buildReviewsList(ref, race),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewsList(WidgetRef ref, Race race) {
    // We need a provider for reviews. For now, let's use a FutureBuilder with the service directly
    // In a real app, we'd want a StreamProvider or similar
    return FutureBuilder(
      future: ref.read(raceLogServiceProvider).getPublicRaceLogs(), // TODO: Filter by race
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.racingRed));
        }
        
        if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.white));
        }

        final logs = snapshot.data ?? [];
        // Filter logs for this race (since our service currently gets all public logs)
        // Ideally the service should support filtering
        final raceLogs = logs.where((log) => 
          log.raceYear == race.season && 
          (log.raceName == race.gpName || log.round == race.round)
        ).toList();

        if (raceLogs.isEmpty) {
          return Center(
            child: Column(
              children: [
                Icon(LucideIcons.messageSquare, size: 48, color: Colors.white.withValues(alpha: 0.2)),
                const SizedBox(height: 16),
                Text(
                  'No reviews yet',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontWeight: FontWeight.bold),
                ),
              ],
            ),
          );
        }

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: raceLogs.length,
          separatorBuilder: (context, index) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final log = raceLogs[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundImage: log.userAvatar != null && log.userAvatar!.isNotEmpty
                            ? NetworkImage(log.userAvatar!)
                            : null,
                        backgroundColor: AppTheme.racingRed,
                        child: log.userAvatar == null || log.userAvatar!.isEmpty
                            ? Text(log.username[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        log.username,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          const Icon(LucideIcons.star, size: 14, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text(
                            log.rating.toString(),
                            style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (log.review.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      log.review,
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
