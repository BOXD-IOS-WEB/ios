import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/models/activity.dart';
import 'package:boxboxd/core/services/activity_service.dart';
import 'package:timeago/timeago.dart' as timeago;

final activityServiceProvider = Provider<ActivityService>((ref) => ActivityService());

final globalActivityProvider = FutureProvider<List<Activity>>((ref) async {
  final service = ref.read(activityServiceProvider);
  return service.getGlobalActivity();
});

class ActivityScreen extends ConsumerWidget {
  const ActivityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activityAsync = ref.watch(globalActivityProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'ACTIVITY',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: 1,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell, color: Colors.white),
            onPressed: () {}, // TODO: Notifications
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(globalActivityProvider.future),
        color: AppTheme.racingRed,
        child: activityAsync.when(
          data: (activities) {
            if (activities.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.activity, size: 64, color: Colors.white24),
                    SizedBox(height: 16),
                    Text(
                      'No recent activity',
                      style: TextStyle(color: Colors.white54, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: activities.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final activity = activities[index];
                return _ActivityItem(activity: activity);
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
          error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
        ),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final Activity activity;

  const _ActivityItem({required this.activity});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 20,
            backgroundImage: activity.userAvatar != null && activity.userAvatar!.isNotEmpty
                ? NetworkImage(activity.userAvatar!)
                : null,
            backgroundColor: AppTheme.racingRed,
            child: activity.userAvatar == null || activity.userAvatar!.isEmpty
                ? Text(activity.username[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    children: [
                      TextSpan(
                        text: activity.username,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      TextSpan(
                        text: _getActionText(activity.type),
                        style: const TextStyle(color: Colors.white70),
                      ),
                      if (activity.targetType == 'raceLog') ...[
                        const TextSpan(text: ' a race'), // Ideally fetch race name
                      ] else if (activity.targetType == 'user') ...[
                        const TextSpan(text: ' a user'),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                if (activity.content != null && activity.content!.isNotEmpty)
                  Text(
                    activity.content!,
                    style: const TextStyle(color: Colors.white70, fontSize: 14, fontStyle: FontStyle.italic),
                  ),
                const SizedBox(height: 8),
                Text(
                  timeago.format(activity.createdAt),
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 12),
                ),
              ],
            ),
          ),
          _getIconForType(activity.type),
        ],
      ),
    );
  }

  String _getActionText(String type) {
    switch (type) {
      case 'log': return ' logged';
      case 'review': return ' reviewed';
      case 'like': return ' liked';
      case 'follow': return ' followed';
      case 'list': return ' created a list';
      default: return ' did something';
    }
  }

  Widget _getIconForType(String type) {
    IconData icon;
    Color color = Colors.white;

    switch (type) {
      case 'log':
        icon = LucideIcons.flag;
        color = Colors.white;
        break;
      case 'review':
        icon = LucideIcons.messageSquare;
        color = Colors.blue;
        break;
      case 'like':
        icon = LucideIcons.heart;
        color = AppTheme.racingRed;
        break;
      case 'follow':
        icon = LucideIcons.userPlus;
        color = Colors.green;
        break;
      default:
        icon = LucideIcons.activity;
        color = Colors.grey;
    }

    return Icon(icon, size: 16, color: color);
  }
}
