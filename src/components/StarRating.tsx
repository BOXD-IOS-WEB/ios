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

  const handleClick = (value: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (readonly && onClickWhenReadonly) {
      onClickWhenReadonly();
    } else if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    // Disable hover on touch devices to prevent conflicts
    if (!readonly && !('ontouchstart' in window)) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && !('ontouchstart' in window)) {
      setHoverRating(0);
    }
  };

  const displayRating = readonly ? rating : (hoverRating || rating);

  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  const flagSizes = {
    sm: 16,
    md: 18,
    lg: 22,
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
      {/* Flags */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {[1, 2, 3, 4, 5].map((position) => {
          const isActive = displayRating >= position;
          const isPartial = displayRating > position - 1 && displayRating < position;
          const fillPercentage = isPartial ? ((displayRating - (position - 1)) * 100) : (isActive ? 100 : 0);

          return (
            <div
              key={position}
              className={`relative flex-1 ${sizeClasses[size]} rounded-lg overflow-hidden border-2 ${
                isActive || isPartial ? 'border-white/20' : 'border-border/50'
              } ${
                (readonly && onClickWhenReadonly) || !readonly ? 'cursor-pointer' : ''
              }`}
              onClick={(e) => handleClick(position, e)}
              onMouseEnter={() => handleMouseEnter(position)}
              onMouseLeave={handleMouseLeave}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleClick(position, e as any);
              }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-muted/60 pointer-events-none" />

              {/* Fill */}
              <div
                className={`absolute inset-0 ${getRatingColor(position)} pointer-events-none`}
                style={{ width: `${fillPercentage}%` }}
              />

              {/* Flag icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Flag
                  size={flagSizes[size]}
                  className={isActive || isPartial ? 'text-black' : 'text-muted-foreground'}
                  fill={isActive || isPartial ? 'currentColor' : 'none'}
                  strokeWidth={2.5}
                />
              </div>

              {/* Position number */}
              <div className="absolute bottom-1 right-1 pointer-events-none">
                <span className={`text-[10px] sm:text-xs font-bold ${
                  isActive || isPartial ? 'text-black/80' : 'text-muted-foreground/70'
                }`}>
                  {position}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Display */}
      {(readonly || displayRating > 0) && (
        <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold text-racing-red">{displayRating.toFixed(1)}</span>
          <span className="text-lg sm:text-xl font-medium text-muted-foreground">/ 5.0</span>
        </div>
      )}

      {/* Label */}
      <div className="pt-0.5 text-center sm:text-left">
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
