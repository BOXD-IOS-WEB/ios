import { useState } from "react";
import { Flag } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  totalRatings?: number;
  onClickWhenReadonly?: () => void;
}

export const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  totalRatings = 0,
  onClickWhenReadonly,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (readonly && onClickWhenReadonly) {
      onClickWhenReadonly();
    } else if (!readonly && onRatingChange) {
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
    sm: "h-5",
    md: "h-7",
    lg: "h-9",
  };

  const flagSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  const getRatingColor = (position: number) => {
    if (displayRating >= position) {
      // Each flag gets its own color in a gradient from green to red
      const colors = [
        "bg-emerald-500",  // 1 - Green
        "bg-lime-500",     // 2 - Light green
        "bg-yellow-500",   // 3 - Yellow
        "bg-orange-500",   // 4 - Orange
        "bg-racing-red",   // 5 - Red
      ];
      return colors[position - 1];
    }
    return "bg-muted";
  };

  return (
    <div className="space-y-2">
      {/* Rating Display */}
      {(readonly || displayRating > 0) && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl sm:text-4xl font-bold text-racing-red">{displayRating.toFixed(1)}</span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground leading-tight">out of</span>
            <span className="text-sm font-semibold text-muted-foreground leading-tight">5.0</span>
          </div>
        </div>
      )}

      {/* Flags */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((position) => {
          const isActive = displayRating >= position;
          const isPartial = displayRating > position - 1 && displayRating < position;
          const fillPercentage = isPartial ? ((displayRating - (position - 1)) * 100) : (isActive ? 100 : 0);

          return (
            <div
              key={position}
              className={`relative flex-1 ${sizeClasses[size]} rounded-md overflow-hidden ${
                (readonly && onClickWhenReadonly) || !readonly ? 'cursor-pointer' : ''
              } shadow-sm`}
              onClick={() => handleClick(position)}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-muted/50" />

              {/* Fill */}
              <div
                className={`absolute inset-0 ${getRatingColor(position)}`}
                style={{ width: `${fillPercentage}%` }}
              />

              {/* Flag icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Flag
                  size={flagSizes[size]}
                  className={isActive || isPartial ? 'text-white drop-shadow-sm' : 'text-muted-foreground'}
                  fill={isActive || isPartial ? 'currentColor' : 'none'}
                />
              </div>

              {/* Position number */}
              <div className="absolute bottom-0.5 right-0.5 px-0.5">
                <span className={`text-[10px] font-bold ${
                  isActive || isPartial ? 'text-white/90' : 'text-muted-foreground/60'
                }`}>
                  {position}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Label */}
      <div className="pt-0.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {readonly
            ? `Average Rating ${totalRatings > 0 ? `(${totalRatings.toLocaleString()} ${totalRatings === 1 ? 'rating' : 'ratings'})` : '(No ratings yet)'}`
            : 'Rate this race'
          }
        </span>
      </div>
    </div>
  );
};
