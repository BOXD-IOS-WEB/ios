import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:boxboxd/core/services/search_service.dart';
import 'package:boxboxd/features/home/providers/f1_provider.dart';
import 'package:go_router/go_router.dart';

final searchServiceProvider = Provider<SearchService>((ref) {
  final f1Api = ref.read(f1ApiServiceProvider);
  return SearchService(f1Api);
});

final searchResultsProvider = FutureProvider.family<List<SearchResult>, String>((ref, query) async {
  if (query.isEmpty) return [];
  final service = ref.read(searchServiceProvider);
  return service.searchAll(query);
});

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resultsAsync = ref.watch(searchResultsProvider(_query));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: TextField(
          controller: _searchController,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Search races, users...',
            hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
            border: InputBorder.none,
          ),
          onChanged: (value) {
            setState(() {
              _query = value;
            });
          },
        ),
        actions: [
          if (_query.isNotEmpty)
            IconButton(
              icon: const Icon(LucideIcons.x, color: Colors.white),
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _query = '';
                });
              },
            ),
        ],
      ),
      body: _query.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.search, size: 64, color: Colors.white.withValues(alpha: 0.1)),
                  const SizedBox(height: 16),
                  Text(
                    'Search for races or users',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )
          : resultsAsync.when(
              data: (results) {
                if (results.isEmpty) {
                  return const Center(child: Text('No results found', style: TextStyle(color: Colors.white54)));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: results.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final result = results[index];
                    return ListTile(
                      contentPadding: const EdgeInsets.all(12),
                      tileColor: Colors.white.withValues(alpha: 0.05),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: result.type == 'race' ? AppTheme.racingRed.withValues(alpha: 0.2) : Colors.blue.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          result.type == 'race' ? LucideIcons.flag : LucideIcons.user,
                          color: result.type == 'race' ? AppTheme.racingRed : Colors.blue,
                          size: 20,
                        ),
                      ),
                      title: Text(
                        result.title,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      subtitle: result.subtitle != null
                          ? Text(
                              result.subtitle!,
                              style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                            )
                          : null,
                      onTap: () {
                        if (result.type == 'race') {
                          context.push('/race/${result.id.replaceAll('-', '/')}');
                        } else if (result.type == 'user') {
                          // TODO: Navigate to user profile
                        }
                      },
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.racingRed)),
              error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
            ),
    );
  }
}
