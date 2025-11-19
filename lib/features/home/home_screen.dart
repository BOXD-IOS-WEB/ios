import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/widgets/responsive_flex.dart';
import 'package:boxboxd/features/home/providers/f1_provider.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/features/race/widgets/log_race_dialog.dart';
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nextRaceAsync = ref.watch(nextRaceProvider);
    final allRacesAsync = ref.watch(currentSeasonRacesProvider);

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Section (Next Race)
            _buildHeroSection(context, nextRaceAsync),

            // Recent/Upcoming Races
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '2025 SEASON',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  allRacesAsync.when(
                    data: (races) => _buildRaceList(context, races),
                    loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
                    error: (err, stack) => Text('Error: $err', style: const TextStyle(color: AppTheme.racingRed)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context, AsyncValue<Race?> nextRaceAsync) {
    return Container(
      height: 500,
      width: double.infinity,
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/ferrari-f1.jpg'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(Colors.black45, BlendMode.darken),
        ),
      ),
      child: Container(
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
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            nextRaceAsync.when(
              data: (nextRace) {
                if (nextRace == null) {
                  return const Text(
                    'SEASON FINISHED',
                    style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                  );
                }
                return Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.racingRed,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'NEXT RACE',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      nextRace.gpName.toUpperCase(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        height: 1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      nextRace.circuit.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                        letterSpacing: 2,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 32),
                    ResponsiveFlex(
                      breakpoint: 400,
                      spacing: 12,
                      children: [
                        ElevatedButton.icon(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (context) => LogRaceDialog(race: nextRace),
                            );
                          },
                          icon: const Icon(LucideIcons.flag, size: 16),
                          label: const Text('LIGHTS OUT'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.racingRed,
                            foregroundColor: Colors.white,
                            textStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () => context.push('/explore'),
                          icon: const Icon(LucideIcons.compass, size: 16),
                          label: const Text('PIT STOP'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: AppTheme.racingRed),
                            textStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
              loading: () => const CircularProgressIndicator(color: AppTheme.racingRed),
              error: (err, stack) => const Text('Error loading next race', style: TextStyle(color: Colors.white70)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRaceList(BuildContext context, List<Race> races) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: races.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final race = races[index];
        final isPast = race.date.isBefore(DateTime.now());
        
        return Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: AppTheme.racingRed.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  race.round.toString(),
                  style: const TextStyle(
                    color: AppTheme.racingRed,
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                  ),
                ),
              ),
            ),
            title: Text(
              race.gpName,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  race.circuit,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatDate(race.date),
                  style: const TextStyle(color: AppTheme.racingRed, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            trailing: isPast
                ? const Icon(LucideIcons.checkCircle, color: Colors.green, size: 20)
                : const Icon(LucideIcons.calendar, color: Colors.white54, size: 20),
            onTap: () {
              context.push('/race/${race.season}/${race.round}');
            },
          ),
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
