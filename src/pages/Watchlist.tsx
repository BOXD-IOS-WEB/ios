import { Header } from "@/components/Header";
import { RaceCard } from "@/components/RaceCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserWatchlist } from "@/services/watchlist";

const Watchlist = () => {
  const [upcomingRaces, setUpcomingRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const items = await getUserWatchlist(user.uid);
      const formattedRaces = items.map(item => ({
        id: item.id,
        season: item.raceYear,
        round: 1,
        gpName: item.raceName,
        circuit: item.raceLocation,
        date: item.raceDate?.toDate?.()?.toISOString() || item.raceDate.toString(),
      }));
      setUpcomingRaces(formattedRaces);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
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
              <RaceCard key={idx} {...race} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
