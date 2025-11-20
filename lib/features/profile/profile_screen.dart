import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';
import 'package:boxboxd/core/services/follow_service.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:boxboxd/core/services/race_log_service.dart';
import 'package:boxboxd/core/models/race_log.dart';
import 'package:boxboxd/core/services/list_service.dart';
import 'package:boxboxd/core/models/race_list.dart';
import 'package:go_router/go_router.dart';

final followServiceProvider = Provider<FollowService>((ref) => FollowService());
final raceLogServiceProvider = Provider<RaceLogService>((ref) => RaceLogService());

final userListsProvider = FutureProvider.family<List<RaceList>, String>((ref, userId) async {
  final service = ref.read(listServiceProvider);
  return service.getUserLists(userId);
});

final userLogsProvider = FutureProvider.family<List<RaceLog>, String>((ref, userId) async {
  final service = ref.read(raceLogServiceProvider);
  return service.getUserRaceLogs(userId);
});

class ProfileScreen extends ConsumerWidget {
  final String? userId; // If null, show current user

  const ProfileScreen({super.key, this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserAsync = ref.watch(currentUserProfileProvider);
    
    // In a real app, if userId is provided and different from current, we'd fetch that user's profile.
    // For this migration demo, we'll assume we are viewing the current user if userId is null.
    // If userId is provided, we'd need a separate provider. 
    // For simplicity in this step, let's just show the current user's data but enable the follow button if IDs differ.
    
    return currentUserAsync.when(
      data: (currentUser) {
        if (currentUser == null) return const Center(child: Text('User not found'));
        
        final isCurrentUser = userId == null || userId == currentUser.id;
        final targetUserId = userId ?? currentUser.id;

        return Scaffold(
          body: DefaultTabController(
            length: 3,
            child: NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) {
                return [
                  SliverAppBar(
                    expandedHeight: 280,
                    pinned: true,
                    backgroundColor: Colors.black,
                    flexibleSpace: FlexibleSpaceBar(
                      background: Stack(
                        fit: StackFit.expand,
                        children: [
                          // Cover Image
                          Image.network(
                            'https://media.formula1.com/image/upload/f_auto,c_limit,w_1440,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Abu%20Dhabi',
                            fit: BoxFit.cover,
                            color: Colors.black.withValues(alpha: 0.7),
                            colorBlendMode: BlendMode.darken,
                          ),
                          
                          // Profile Info
                          Positioned(
                            bottom: 60,
                            left: 20,
                            right: 20,
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 40,
                                  backgroundColor: AppTheme.racingRed,
                                  backgroundImage: currentUser.photoUrl != null 
                                      ? NetworkImage(currentUser.photoUrl!) 
                                      : null,
                                  child: currentUser.photoUrl == null 
                                      ? Text(currentUser.name[0].toUpperCase(), 
                                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white))
                                      : null,
                                ),
                                const SizedBox(width: 20),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        currentUser.name,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 24,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                      Text(
                                        '@${currentUser.email.split('@')[0]}',
                                        style: TextStyle(
                                          color: Colors.white.withValues(alpha: 0.7),
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          _buildStat('Races', currentUser.racesWatched),
                                          const SizedBox(width: 16),
                                          _buildStat('Reviews', 0), // TODO: Calculate from logs
                                          const SizedBox(width: 16),
                                          _buildStat('Following', currentUser.following),
                                          const SizedBox(width: 16),
                                          _buildStat('Followers', currentUser.followers),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    actions: [
                      if (isCurrentUser) ...[
                        IconButton(
                          icon: const Icon(LucideIcons.edit, color: Colors.white),
                          onPressed: () => context.push('/profile/edit'),
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.settings, color: Colors.white),
                          onPressed: () => context.push('/settings'),
                        ),
                      ] else
                        _FollowButton(userId: targetUserId),
                    ],
                    bottom: TabBar(
                      indicatorColor: AppTheme.racingRed,
                      labelColor: AppTheme.racingRed,
                      unselectedLabelColor: Colors.white54,
                      labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
                      tabs: const [
                        Tab(text: 'LOGS'),
                        Tab(text: 'REVIEWS'),
                        Tab(text: 'LISTS'),
                      ],
                    ),
                  ),
                ];
              },
              body: TabBarView(
                children: [
                  _UserLogsTab(userId: targetUserId),
                  _UserReviewsTab(userId: targetUserId),
                  _UserListsTab(userId: targetUserId, isCurrentUser: isCurrentUser),
                ],
              ),
            ),
          ),
        );
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.racingRed))),
      error: (err, stack) => Scaffold(body: Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white)))),
    );
  }

  Widget _buildStat(String label, int value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value.toString(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        Text(
          label.toUpperCase(),
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }
}

class _UserListsTab extends ConsumerWidget {
  final String userId;
  final bool isCurrentUser;

  const _UserListsTab({required this.userId, required this.isCurrentUser});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listsAsync = ref.watch(userListsProvider(userId));

    return listsAsync.when(
      data: (lists) {
        if (lists.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(LucideIcons.list, size: 48, color: Colors.white24),
                const SizedBox(height: 16),
                const Text('No lists yet', style: TextStyle(color: Colors.white54)),
                if (isCurrentUser) ...[
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.push('/create-list'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.racingRed,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('CREATE LIST'),
                  ),
                ],
              ],
            ),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: lists.length + (isCurrentUser ? 1 : 0),
          separatorBuilder: (context, index) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            if (isCurrentUser && index == 0) {
              return ElevatedButton(
                onPressed: () => context.push('/create-list'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.racingRed,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.plus, size: 16),
                    SizedBox(width: 8),
                    Text('CREATE NEW LIST', style: TextStyle(fontWeight: FontWeight.w900)),
                  ],
                ),
              );
            }

            final list = lists[isCurrentUser ? index - 1 : index];
            return InkWell(
              onTap: () => context.push('/list/${list.id}'),
              child: Container(
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
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          list.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        if (!list.isPublic)
                          const Icon(LucideIcons.lock, size: 14, color: Colors.white54),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      list.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Text(
                          '${list.races.length} races',
                          style: const TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        const Icon(LucideIcons.heart, size: 14, color: Colors.white54),
                        const SizedBox(width: 4),
                        Text(
                          list.likesCount.toString(),
                          style: const TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                      ],
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
    );
  }
}

class _FollowButton extends ConsumerStatefulWidget {
  final String userId;

  const _FollowButton({required this.userId});

  @override
  ConsumerState<_FollowButton> createState() => _FollowButtonState();
}

class _FollowButtonState extends ConsumerState<_FollowButton> {
  bool _isFollowing = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final service = ref.read(followServiceProvider);
    final isFollowing = await service.isFollowing(widget.userId);
    if (mounted) {
      setState(() {
        _isFollowing = isFollowing;
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleFollow() async {
    setState(() => _isLoading = true);
    final service = ref.read(followServiceProvider);
    try {
      if (_isFollowing) {
        await service.unfollowUser(widget.userId);
      } else {
        await service.followUser(widget.userId);
      }
      setState(() => _isFollowing = !_isFollowing);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.racingRed),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(right: 16),
      child: ElevatedButton(
        onPressed: _toggleFollow,
        style: ElevatedButton.styleFrom(
          backgroundColor: _isFollowing ? Colors.transparent : AppTheme.racingRed,
          foregroundColor: Colors.white,
          side: _isFollowing ? const BorderSide(color: Colors.white54) : null,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
        child: Text(
          _isFollowing ? 'FOLLOWING' : 'FOLLOW',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
        ),
      ),
    );
  }
}
class _UserLogsTab extends ConsumerWidget {
  final String userId;

  const _UserLogsTab({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(userLogsProvider(userId));

    return logsAsync.when(
      data: (logs) {
        if (logs.isEmpty) {
          return const Center(child: Text('No logs yet', style: TextStyle(color: Colors.white54)));
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: logs.length,
          separatorBuilder: (context, index) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final log = logs[index];
            return _LogCard(log: log);
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
      error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
    );
  }
}

class _UserReviewsTab extends ConsumerWidget {
  final String userId;

  const _UserReviewsTab({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(userLogsProvider(userId));

    return logsAsync.when(
      data: (logs) {
        final reviews = logs.where((l) => l.review.isNotEmpty).toList();
        if (reviews.isEmpty) {
          return const Center(child: Text('No reviews yet', style: TextStyle(color: Colors.white54)));
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: reviews.length,
          separatorBuilder: (context, index) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final log = reviews[index];
            return _LogCard(log: log);
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
      error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
    );
  }
}

class _LogCard extends StatelessWidget {
  final dynamic log;

  const _LogCard({required this.log});

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '${log.raceName} ${log.raceYear}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
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
          const SizedBox(height: 4),
          Text(
            'Watched on ${_formatDate(log.dateWatched)}',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
          ),
          if (log.review.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              log.review,
              style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
