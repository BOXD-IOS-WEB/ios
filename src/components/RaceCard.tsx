import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCountryFlag } from "@/services/f1Api";

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
}: RaceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/race/${id}`);
    } else if (season && round) {
      navigate(`/race/${season}/${round}`);
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
          <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4">
            {flagUrl && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
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
              <div className="text-2xl font-bold">{season}</div>
              <div className="text-xs mt-1 font-medium line-clamp-2">{gpName}</div>
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
