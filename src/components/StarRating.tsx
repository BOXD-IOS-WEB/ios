import { useState } from "react";
import { Flag } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  const sizeClasses = {
    sm: "h-6",
    md: "h-10",
    lg: "h-12",
  };

  const flagSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const getRatingColor = (position: number) => {
    if (displayRating >= position) {
      if (displayRating >= 4.5) return "bg-racing-red"; // Red for excellent
      if (displayRating >= 3.5) return "bg-orange-500"; // Orange for good
      if (displayRating >= 2.5) return "bg-yellow-500"; // Yellow for average
      return "bg-gray-500"; // Gray for below average
    }
    return "bg-muted";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((position) => {
          const isActive = displayRating >= position;
          const isPartial = displayRating > position - 1 && displayRating < position;
          const fillPercentage = isPartial ? ((displayRating - (position - 1)) * 100) : (isActive ? 100 : 0);

          return (
            <div
              key={position}
              className={`relative flex-1 ${sizeClasses[size]} rounded-sm overflow-hidden ${
                readonly ? '' : 'cursor-pointer'
              } transition-all duration-200 hover:scale-105`}
              onClick={() => handleClick(position)}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-muted" />

              {/* Fill */}
              <div
                className={`absolute inset-0 ${getRatingColor(position)} transition-all duration-300`}
                style={{ width: `${fillPercentage}%` }}
              />

              {/* Flag icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Flag
                  size={flagSizes[size]}
                  className={`transition-colors ${
                    isActive || isPartial ? 'text-white' : 'text-muted-foreground'
                  }`}
                  fill={isActive || isPartial ? 'currentColor' : 'none'}
                />
              </div>

              {/* Position number */}
              <div className="absolute bottom-0 right-0 px-1">
                <span className={`text-[10px] font-bold ${
                  isActive || isPartial ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {position}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Rate this race</span>
        {displayRating > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-racing-red">{displayRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 5.0</span>
          </div>
        )}
      </div>
    </div>
  );
};
