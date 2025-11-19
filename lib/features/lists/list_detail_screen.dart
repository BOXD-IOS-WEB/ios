import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/race_list.dart';
import 'package:boxboxd/core/models/race.dart';
import 'package:boxboxd/core/services/list_service.dart';
import 'package:boxboxd/features/home/widgets/race_card.dart';
import 'package:lucide_icons/lucide_icons.dart';

final listDetailProvider = FutureProvider.family<RaceList?, String>((ref, listId) async {
  final service = ref.read(listServiceProvider);
  return service.getListById(listId);
});

class ListDetailScreen extends ConsumerWidget {
  final String listId;

  const ListDetailScreen({super.key, required this.listId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listAsync = ref.watch(listDetailProvider(listId));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'LIST DETAILS',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 20,
            letterSpacing: 1,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.share2, color: Colors.white),
            onPressed: () {}, // TODO: Share
          ),
        ],
      ),
      body: listAsync.when(
        data: (list) {
          if (list == null) return const Center(child: Text('List not found'));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  list.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: AppTheme.racingRed,
                      child: Text(list.username[0].toUpperCase(), style: const TextStyle(fontSize: 10, color: Colors.white)),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'by ${list.username}',
                      style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        list.isPublic ? 'PUBLIC' : 'PRIVATE',
                        style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  list.description,
                  style: const TextStyle(color: Colors.white70, fontSize: 16),
                ),
                
                const SizedBox(height: 24),
                
                // Stats
                Row(
                  children: [
                    _buildStat(LucideIcons.heart, list.likesCount.toString()),
                    const SizedBox(width: 24),
                    _buildStat(LucideIcons.messageSquare, list.commentsCount.toString()),
                    const SizedBox(width: 24),
                    _buildStat(LucideIcons.layers, '${list.races.length} races'),
                  ],
                ),

                const SizedBox(height: 32),
                const Divider(color: Colors.white24),
                const SizedBox(height: 16),

                // Races Grid
                if (list.races.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text('No races in this list yet.', style: TextStyle(color: Colors.white54)),
                    ),
                  )
                else
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      childAspectRatio: 0.7,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemCount: list.races.length,
                    itemBuilder: (context, index) {
                      final item = list.races[index];
                      // Map RaceListItem to Race for RaceCard
                      // Note: RaceCard expects a Race object, but RaceListItem has slightly different fields
                      // We might need to adjust RaceCard or map carefully.
                      // For now, creating a Race object from RaceListItem data
                      final race = Race(
                        season: item.raceYear,
                        round: item.round ?? 0,
                        gpName: item.raceName,
                        circuit: item.raceLocation,
                        date: item.date ?? DateTime.now(),
                        country: null,
                        rating: 0.0,
                        watched: false,
                      );
                      
                      return Stack(
                        children: [
                          RaceCard(race: race),
                          Positioned(
                            top: 4,
                            left: 4,
                            child: Container(
                              width: 20,
                              height: 20,
                              decoration: const BoxDecoration(
                                color: AppTheme.racingRed,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '${index + 1}',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
      ),
    );
  }

  Widget _buildStat(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.white54),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
