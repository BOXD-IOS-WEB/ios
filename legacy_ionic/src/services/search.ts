import {
  getDocuments
} from '@/lib/firestore-native';
import { getRacesBySeason } from './f1Api';

export interface SearchResult {
  id: string;
  type: 'race' | 'user' | 'list';
  title: string;
  subtitle?: string;
  metadata?: any;
}

export const searchRaces = async (searchTerm: string, limitCount: number = 10): Promise<SearchResult[]> => {
  const term = searchTerm.toLowerCase();

  // Search across all seasons (2020-2025)
  const seasons = [2025, 2024, 2023, 2022, 2021, 2020];
  const allRacesPromises = seasons.map(year => getRacesBySeason(year));
  const allRacesArrays = await Promise.all(allRacesPromises);
  const allRaces = allRacesArrays.flat();

  const filteredRaces = allRaces.filter(race =>
    race.meeting_name?.toLowerCase().includes(term) ||
    race.circuit_short_name?.toLowerCase().includes(term) ||
    race.location?.toLowerCase().includes(term) ||
    race.country_name?.toLowerCase().includes(term)
  ).slice(0, limitCount);

  return filteredRaces.map(race => ({
    id: `${race.year}-${race.meeting_key}`,
    type: 'race' as const,
    title: race.meeting_name,
    subtitle: `${race.year} • ${race.circuit_short_name}`,
    metadata: race
  }));
};

export const searchUsers = async (searchTerm: string, limitCount: number = 10): Promise<SearchResult[]> => {
  const term = searchTerm.toLowerCase();

  try {
    console.log('[searchUsers] Searching for:', term);
    const docs = await getDocuments('users', {
      limit: 100
    });

    console.log('[searchUsers] Found', docs.length, 'total users');

    const users = docs
      .filter(user => {
        const nameMatch = user.name?.toLowerCase().includes(term);
        const emailMatch = user.email?.toLowerCase().includes(term);
        return nameMatch || emailMatch;
      })
      .slice(0, limitCount);

    console.log('[searchUsers] Filtered to', users.length, 'matching users');

    return users.map(user => ({
      id: user.id,
      type: 'user' as const,
      title: user.name || user.email?.split('@')[0] || 'User',
      subtitle: `@${user.email?.split('@')[0] || 'user'}`,
      metadata: user
    }));
  } catch (error) {
    console.error('[searchUsers] Error searching users:', error);
    return [];
  }
};

export const searchLists = async (searchTerm: string, limitCount: number = 10): Promise<SearchResult[]> => {
  const term = searchTerm.toLowerCase();

  try {
    const docs = await getDocuments('lists', {
      limit: 50
    });

    const lists = docs
      .filter(list =>
        list.title?.toLowerCase().includes(term) ||
        list.description?.toLowerCase().includes(term) ||
        list.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      )
      .slice(0, limitCount);

    return lists.map(list => ({
      id: list.id,
      type: 'list' as const,
      title: list.title,
      subtitle: list.description || `${list.races?.length || 0} races`,
      metadata: list
    }));
  } catch (error) {
    console.error('Error searching lists:', error);
    return [];
  }
};

export const searchAll = async (searchTerm: string): Promise<SearchResult[]> => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const [races, users, lists] = await Promise.all([
    searchRaces(searchTerm, 5),
    searchUsers(searchTerm, 5),
    searchLists(searchTerm, 5)
  ]);

  return [...races, ...users, ...lists];
};
