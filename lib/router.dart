import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/features/home/home_screen.dart';
import 'package:boxboxd/features/auth/login_screen.dart';
import 'package:boxboxd/features/race/race_detail_screen.dart';
import 'package:boxboxd/features/explore/explore_screen.dart';
import 'package:boxboxd/features/explore/search_screen.dart';
import 'package:boxboxd/features/activity/activity_screen.dart';
import 'package:boxboxd/features/profile/profile_screen.dart';
import 'package:boxboxd/features/settings/settings_screen.dart';
import 'package:boxboxd/features/lists/create_list_screen.dart';
import 'package:boxboxd/features/lists/list_detail_screen.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';
import 'package:boxboxd/scaffold_with_navbar.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorHomeKey = GlobalKey<NavigatorState>(debugLabel: 'shellHome');
final _shellNavigatorExploreKey = GlobalKey<NavigatorState>(debugLabel: 'shellExplore');
final _shellNavigatorActivityKey = GlobalKey<NavigatorState>(debugLabel: 'shellActivity');
final _shellNavigatorProfileKey = GlobalKey<NavigatorState>(debugLabel: 'shellProfile');

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: GoRouterRefreshStream(authState),
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isLoggingIn = state.uri.path == '/login';

      if (!isLoggedIn && !isLoggingIn) {
        return '/login';
      }

      if (isLoggedIn && isLoggingIn) {
        return '/';
      }

      return null;
    },
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNavBar(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _shellNavigatorHomeKey,
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const HomeScreen(),
                routes: [
                  GoRoute(
                    path: 'race/:season/:round',
                    builder: (context, state) {
                      final season = int.parse(state.pathParameters['season']!);
                      final round = int.parse(state.pathParameters['round']!);
                      return RaceDetailScreen(season: season, round: round);
                    },
                  ),
                  GoRoute(
                    path: 'search',
                    builder: (context, state) => const SearchScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorExploreKey,
            routes: [
              GoRoute(
                path: '/explore',
                builder: (context, state) => const ExploreScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorActivityKey,
            routes: [
              GoRoute(
                path: '/activity',
                builder: (context, state) => const ActivityScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorProfileKey,
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/create-list',
        builder: (context, state) => const CreateListScreen(),
      ),
      GoRoute(
        path: '/list/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ListDetailScreen(listId: id);
        },
      ),
    ],
  );
});

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(AsyncValue<dynamic> asyncValue) {
    notifyListeners();
    // For AsyncValue, we just notify on creation
    // The router will rebuild when the provider changes
  }

  @override
  void dispose() {
    super.dispose();
  }
}
