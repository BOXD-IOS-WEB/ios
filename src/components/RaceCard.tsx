import { Card } from "@/components/ui/card";
import { Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCountryFlag } from "@/services/f1Api";
import { Button } from "@/components/ui/button";
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from "@/services/watchlist";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";

interface RaceCardProps {
  season: number;
  round: number;
  gpName: string;
  circuit: string;
  date: string;
  rating?: number;
  posterUrl?: string;
  watched?: boolean;
  id?: string;
  country?: string;
  showWatchlistButton?: boolean;
}

export const RaceCard = ({
  season,
  round,
  gpName,
  circuit,
  date,
  rating,
  posterUrl,
  watched = false,
  id,
  country,
  showWatchlistButton = true,
}: RaceCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);

  useEffect(() => {
    checkWatchlistStatus();
  }, [season, gpName]);

  const checkWatchlistStatus = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const items = await getUserWatchlist(user.uid);
      const watchlistItem = items.find(
        item => item.raceYear === season && item.raceName === gpName
      );
      if (watchlistItem) {
        setIsInWatchlist(true);
        setWatchlistId(watchlistItem.id || null);
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const handleClick = () => {
    if (id) {
      navigate(`/race/${id}`);
    } else if (season && round) {
      navigate(`/race/${season}/${round}`);
    }
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add races to your watchlist",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isInWatchlist && watchlistId) {
        await removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
        setWatchlistId(null);
        toast({ title: "Removed from watchlist" });
      } else {
        const newId = await addToWatchlist({
          userId: user.uid,
          raceYear: season,
          raceName: gpName,
          raceLocation: circuit,
          raceDate: new Date(date),
          notes: '',
          reminderEnabled: false,
        });
        setIsInWatchlist(true);
        setWatchlistId(newId);
        toast({ title: "Added to watchlist" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const flagUrl = country ? getCountryFlag(country) : null;

  return (
    <Card
      onClick={handleClick}
      className="group relative overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all duration-200 cursor-pointer"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-racing-red/20 to-background">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${season} ${gpName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4 text-white">
            {flagUrl && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg bg-white/10">
                <img
                  src={flagUrl}
                  alt={country || circuit}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{season}</div>
              <div className="text-xs mt-1 font-medium line-clamp-2 text-white/90">{gpName}</div>
            </div>
          </div>
        )}
        
        {/* Rating overlay */}
        {rating && (
          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-racing-red text-racing-red" />
            <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Watched indicator */}
        {watched && (
          <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
            Logged
          </div>
        )}

        {/* Watchlist button */}
        {showWatchlistButton && !watched && (
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-sm"
              onClick={handleWatchlistToggle}
            >
              <Eye className={`w-4 h-4 ${isInWatchlist ? 'fill-white' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{gpName}</h3>
        <p className="text-xs text-muted-foreground mt-1">{season} • Round {round}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{circuit}</p>
      </div>
    </Card>
  );
};
