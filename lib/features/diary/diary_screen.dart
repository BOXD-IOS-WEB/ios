import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/features/diary/providers/diary_provider.dart';
import 'package:boxboxd/features/race/widgets/log_race_dialog.dart';
import 'package:boxboxd/features/diary/widgets/race_log_card.dart';
import 'package:boxboxd/features/diary/widgets/diary_stats_header.dart';
import 'package:boxboxd/features/diary/widgets/diary_empty_state.dart';

class DiaryScreen extends ConsumerWidget {
  const DiaryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserAsync = ref.watch(currentUserProvider);

    return currentUserAsync.when(
      data: (user) {
        if (user == null) {
          return const Scaffold(
            body: Center(
              child: Text('Please log in to view your diary'),
            ),
          );
        }

        final diaryStateAsync = ref.watch(diaryProvider(user.uid));

        return Scaffold(
          appBar: AppBar(
            backgroundColor: Colors.black,
            title: const Text(
              'MY DIARY',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 24,
                letterSpacing: 1,
                color: Colors.white,
              ),
            ),
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              DiaryOperations.refresh(ref, user.uid);
            },
            color: AppTheme.racingRed,
            child: diaryStateAsync.when(
              data: (diaryState) {
                if (diaryState.error != null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          LucideIcons.alertCircle,
                          size: 64,
                          color: Colors.white24,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Error loading diary',
                          style: TextStyle(
                            color: Colors.white54,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          diaryState.error!,
                          style: const TextStyle(
                            color: Colors.white38,
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                }
                
                if (diaryState.logs.isEmpty) {
                  return _buildEmptyState(context);
                }
                
                return _buildDiaryContent(context, ref, user.uid, diaryState);
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppTheme.racingRed),
              ),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      LucideIcons.alertCircle,
                      size: 64,
                      color: Colors.white24,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Error loading diary',
                      style: TextStyle(
                        color: Colors.white54,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
      loading: () => const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.racingRed),
        ),
      ),
      error: (error, stack) => Scaffold(
        body: Center(
          child: Text(
            'Error: $error',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return DiaryEmptyState(
      onLogFirstRace: () {
        showDialog(
          context: context,
          builder: (context) => LogRaceDialog(),
        );
      },
    );
  }

  Widget _buildDiaryContent(
    BuildContext context,
    WidgetRef ref,
    String userId,
    DiaryState diaryState,
  ) {
    final stats = diaryState.stats;
    final racesWatched = stats?.racesWatched ?? diaryState.logs.length;
    final totalHours = stats?.totalHoursWatched ?? 0.0;

    return CustomScrollView(
      slivers: [
        // Stats header
        SliverToBoxAdapter(
          child: DiaryStatsHeader(
            racesWatched: racesWatched,
            totalHours: totalHours,
          ),
        ),
        // Race logs list
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final log = diaryState.logs[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: RaceLogCard(
                    log: log,
                    onTap: () {
                      if (log.round != null) {
                        context.push('/race/${log.raceYear}/${log.round}');
                      }
                    },
                    onEdit: () {
                      showDialog(
                        context: context,
                        builder: (context) => LogRaceDialog(existingLog: log),
                      );
                    },
                    onDelete: () async {
                      final confirmed = await _showDeleteConfirmation(context);
                      if (confirmed == true) {
                        try {
                          await DiaryOperations.deleteLog(ref, userId, log.id!);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Race log deleted'),
                                backgroundColor: AppTheme.racingRed,
                              ),
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Error deleting log: $e'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        }
                      }
                    },
                  ),
                );
              },
              childCount: diaryState.logs.length,
            ),
          ),
        ),
        // Bottom padding
        const SliverToBoxAdapter(
          child: SizedBox(height: 80),
        ),
      ],
    );
  }

  Future<bool?> _showDeleteConfirmation(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.card,
        title: const Text(
          'Delete Race Log?',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'This action cannot be undone. Your review and rating will be permanently deleted.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(
              'Cancel',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.racingRed,
            ),
            child: const Text(
              'Delete',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
