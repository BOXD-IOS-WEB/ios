import { Header } from "@/components/Header";
import { RaceCard } from "@/components/RaceCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserWatchlist } from "@/services/watchlist";
import { getRacesBySeason } from "@/services/f1Api";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Watchlist = () => {
  const { user } = useAuth();
  const [upcomingRaces, setUpcomingRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth state to be ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('[Watchlist Page] Auth state changed, user logged in:', user.uid);
        loadWatchlist();
      } else {
        console.log('[Watchlist Page] Auth state changed, no user');
        setLoading(false);
        setUpcomingRaces([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadWatchlist = async () => {
    if (!user) {
      console.log('[Watchlist Page] No user authenticated');
      setLoading(false);
      return;
    }

    console.log('[Watchlist Page] Loading watchlist for user:', user.uid);
    setLoading(true);
    try {
      const items = await getUserWatchlist(user.uid);
      console.log('[Watchlist Page] Received items:', items.length);

      // Group items by year to minimize API calls
      const yearMap = new Map<number, any[]>();
      items.forEach(item => {
        if (!yearMap.has(item.raceYear)) {
          yearMap.set(item.raceYear, []);
        }
        yearMap.get(item.raceYear)!.push(item);
      });

      // Fetch F1 data for each year
      const yearRacesMap = new Map<number, any[]>();
      for (const year of yearMap.keys()) {
        try {
          const races = await getRacesBySeason(year);
          yearRacesMap.set(year, races);
        } catch (error) {
          console.warn(`[Watchlist Page] Failed to fetch F1 data for year ${year}:`, error);
          yearRacesMap.set(year, []);
        }
      }

      const formattedRaces = items.map((item, index) => {
        // Handle both Timestamp and Date objects
        let dateString: string;
        if (item.raceDate && typeof item.raceDate === 'object' && 'toDate' in item.raceDate) {
          // It's a Firestore Timestamp
          dateString = item.raceDate.toDate().toISOString();
        } else if (item.raceDate instanceof Date) {
          // It's a Date object
          dateString = item.raceDate.toISOString();
        } else {
          // Fallback to string representation
          dateString = item.raceDate.toString();
        }

        // Try to find the race in F1 API data to get the correct round number
        const yearRaces = yearRacesMap.get(item.raceYear) || [];
        const matchedRace = yearRaces.find(r =>
          r.meeting_name.toLowerCase().includes(item.raceName.toLowerCase()) ||
          item.raceName.toLowerCase().includes(r.meeting_name.toLowerCase())
        );

        const formattedRace = {
          // Don't pass id so RaceCard uses season/round for navigation
          season: item.raceYear,
          round: matchedRace?.round || index + 1, // Use F1 API round if available, otherwise use index
          gpName: item.raceName,
          circuit: item.raceLocation,
          date: dateString,
          country: matchedRace?.country_code,
        };

        console.log('[Watchlist Page] Formatted race:', formattedRace);
        return formattedRace;
      });

      console.log('[Watchlist Page] Setting races:', formattedRaces);
      setUpcomingRaces(formattedRaces);
    } catch (error) {
      console.error('[Watchlist Page] Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast({ title: "Refreshing watchlist..." });
    await loadWatchlist();
    toast({ title: "Watchlist refreshed" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Watchlist</h1>
            <p className="text-muted-foreground">
              {upcomingRaces.length} races on your watchlist
            </p>
          </div>

          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Races</SelectItem>
                <SelectItem value="2025">2025 Season</SelectItem>
                <SelectItem value="2024">2024 Season</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : upcomingRaces.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Your watchlist is empty</p>
            <p className="text-sm mt-2">Add races you want to watch!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {upcomingRaces.map((race, idx) => (
              <RaceCard key={idx} {...race} showWatchlistButton={false} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
