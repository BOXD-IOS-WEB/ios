import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:boxboxd/features/home/home_screen.dart';
import 'package:boxboxd/features/auth/login_screen.dart';
import 'package:boxboxd/features/race/race_detail_screen.dart';
import 'package:boxboxd/features/explore/explore_screen.dart';
import 'package:boxboxd/features/explore/search_screen.dart';
import 'package:boxboxd/features/diary/diary_screen.dart';
import 'package:boxboxd/features/activity/activity_screen.dart';
import 'package:boxboxd/features/profile/profile_screen.dart';
import 'package:boxboxd/features/settings/settings_screen.dart';
import 'package:boxboxd/features/lists/create_list_screen.dart';
import 'package:boxboxd/features/lists/list_detail_screen.dart';
import 'package:boxboxd/features/profile/edit_profile_screen.dart';
import 'package:boxboxd/features/notifications/notifications_screen.dart';
import 'package:boxboxd/features/watchlist/watchlist_screen.dart';
import 'package:boxboxd/features/onboarding/onboarding_screen.dart';
import 'package:boxboxd/features/support/support_screen.dart';
import 'package:boxboxd/features/legal/privacy_policy_screen.dart';
import 'package:boxboxd/features/legal/terms_of_service_screen.dart';
import 'package:boxboxd/features/auth/providers/auth_state.dart';
import 'package:boxboxd/core/services/auth_service.dart';
import 'package:boxboxd/scaffold_with_navbar.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorHomeKey = GlobalKey<NavigatorState>(debugLabel: 'shellHome');
final _shellNavigatorExploreKey = GlobalKey<NavigatorState>(debugLabel: 'shellExplore');
final _shellNavigatorDiaryKey = GlobalKey<NavigatorState>(debugLabel: 'shellDiary');
final _shellNavigatorActivityKey = GlobalKey<NavigatorState>(debugLabel: 'shellActivity');
final _shellNavigatorProfileKey = GlobalKey<NavigatorState>(debugLabel: 'shellProfile');

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: GoRouterRefreshStream(authState),
    redirect: (context, state) async {
      final isLoggedIn = authState.value != null;
      final isLoggingIn = state.uri.path == '/login';
      final isOnboarding = state.uri.path == '/onboarding';

      // Not logged in - redirect to login
      if (!isLoggedIn && !isLoggingIn) {
        return '/login';
      }

      // Logged in and on login page - check onboarding status
      if (isLoggedIn && isLoggingIn) {
        // Fetch user profile directly from Firestore
        final userId = authState.value!.uid;
        final authService = AuthService();
        final profileData = await authService.getUserProfile(userId);
        
        if (profileData != null && profileData['onboardingCompleted'] != true) {
          return '/onboarding';
        }
        
        return '/';
      }

      // Logged in and trying to access app - check onboarding status
      if (isLoggedIn && !isOnboarding && !isLoggingIn) {
        // Fetch user profile directly from Firestore
        final userId = authState.value!.uid;
        final authService = AuthService();
        final profileData = await authService.getUserProfile(userId);
        
        if (profileData != null && profileData['onboardingCompleted'] != true) {
          return '/onboarding';
        }
      }

      // Already on onboarding page or onboarding completed
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
            navigatorKey: _shellNavigatorDiaryKey,
            routes: [
              GoRoute(
                path: '/diary',
                builder: (context, state) => const DiaryScreen(),
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
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
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
      GoRoute(
        path: '/profile/edit',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/watchlist',
        builder: (context, state) => const WatchlistScreen(),
      ),
      GoRoute(
        path: '/support',
        builder: (context, state) => const SupportScreen(),
      ),
      GoRoute(
        path: '/privacy-policy',
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/terms-of-service',
        builder: (context, state) => const TermsOfServiceScreen(),
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
}
