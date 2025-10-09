import { Card } from "@/components/ui/card";
import { Star, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCountryFlag, getRaceWinner } from "@/services/f1Api";
import { Button } from "@/components/ui/button";
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from "@/services/watchlist";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { AddToListDialog } from "@/components/AddToListDialog";

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
  winner?: string;
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
  winner,
}: RaceCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [fetchedWinner, setFetchedWinner] = useState<string | null>(null);

  useEffect(() => {
    checkWatchlistStatus();
  }, [season, gpName]);

  useEffect(() => {
    // Fetch winner if not provided and race is in the past
    const fetchWinner = async () => {
      if (!winner && season && round && date) {
        const raceDate = new Date(date);
        if (raceDate < new Date()) {
          try {
            const raceWinner = await getRaceWinner(season, round);
            if (raceWinner) {
              setFetchedWinner(raceWinner);
            }
          } catch (error) {
            console.error('[RaceCard] Error fetching winner:', error);
          }
        }
      }
    };
    fetchWinner();
  }, [season, round, date, winner]);

  const checkWatchlistStatus = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const items = await getUserWatchlist(user.uid);
      console.log('[RaceCard] Checking watchlist status for:', { season, gpName, totalItems: items.length });

      const watchlistItem = items.find(
        item => item.raceYear === season && item.raceName === gpName
      );

      if (watchlistItem) {
        console.log('[RaceCard] Found in watchlist:', watchlistItem);
        setIsInWatchlist(true);
        setWatchlistId(watchlistItem.id || null);
      } else {
        console.log('[RaceCard] Not in watchlist');
      }
    } catch (error) {
      console.error('[RaceCard] Error checking watchlist:', error);
    }
  };

  const handleClick = () => {
    if (id) {
      navigate(`/race/${id}`);
    } else if (season && round) {
      navigate(`/race/${season}/${round}`);
    }
  };

  const handleWatchlistToggle = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
        console.log('[RaceCard] Removing from watchlist:', watchlistId);
        await removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
        setWatchlistId(null);
        toast({ title: "Removed from watchlist" });
      } else {
        console.log('[RaceCard] Adding to watchlist:', { season, gpName, circuit, date });
        const newId = await addToWatchlist({
          userId: user.uid,
          raceYear: season,
          raceName: gpName,
          raceLocation: circuit,
          raceDate: new Date(date),
          countryCode: country,
          notes: '',
          reminderEnabled: false,
        });
        console.log('[RaceCard] Successfully added with ID:', newId);
        setIsInWatchlist(true);
        setWatchlistId(newId);
        toast({ title: "Added to watchlist" });
      }
    } catch (error: any) {
      console.error('[RaceCard] Error toggling watchlist:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const flagUrl = country ? getCountryFlag(country) : null;
  const displayWinner = winner || fetchedWinner;

  return (
    <Card
      onClick={handleClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className="group relative overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all duration-200 cursor-pointer touch-manipulation"
    >
      {/* Poster */}
      <div className="aspect-square sm:aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-racing-red/20 to-background">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${season} ${gpName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 space-y-2 sm:space-y-3">
            {flagUrl && (
              <div className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-16 rounded overflow-hidden border-2 border-white/20 shadow-lg flex items-center justify-center">
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
            <div className="text-center space-y-1">
              <div className="text-base sm:text-xl md:text-2xl font-bold">{season}</div>
              <div className="text-[10px] sm:text-xs font-medium line-clamp-2 px-1">{gpName}</div>
              {displayWinner && (
                <div className="text-[10px] sm:text-xs font-semibold text-racing-red line-clamp-1 px-1 flex items-center justify-center gap-1">
                  <span>🏆</span>
                  <span>{displayWinner}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rating overlay */}
        {rating && (
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-racing-red text-racing-red" />
            <span className="text-[10px] sm:text-xs font-semibold text-white">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Watched indicator */}
        {watched && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
            Logged
          </div>
        )}

        {/* Action buttons */}
        {showWatchlistButton && !watched && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1">
            <AddToListDialog
              raceYear={season}
              raceName={gpName}
              raceLocation={circuit}
              countryCode={country}
              trigger={
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 sm:h-8 sm:w-8 bg-black/60 hover:bg-black/80 backdrop-blur-sm touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              }
            />
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 sm:h-8 sm:w-8 bg-black/60 hover:bg-black/80 backdrop-blur-sm touch-manipulation"
              onClick={handleWatchlistToggle}
              onTouchEnd={handleWatchlistToggle}
            >
              <Eye className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWatchlist ? 'fill-white' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 sm:p-3 text-center sm:text-left">
        <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">{gpName}</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{season} • Round {round}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{circuit}</p>
      </div>
    </Card>
  );
};
