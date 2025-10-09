import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, MessageCircle, List, UserPlus, Eye } from 'lucide-react';
import { Activity, getFollowingActivity, getGlobalActivity } from '@/services/activity';
import { Link } from 'react-router-dom';

interface ActivityFeedProps {
  feedType: 'following' | 'global';
  limit?: number;
  initialShow?: number;
}

export const ActivityFeed = ({ feedType, limit = 50, initialShow = 10 }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(initialShow);

  const loadActivities = async () => {
    try {
      const data = feedType === 'following'
        ? await getFollowingActivity(limit)
        : await getGlobalActivity(limit);
      setActivities(data);
    } catch (error: any) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [feedType, limit]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'log':
        return <Eye className="w-4 h-4" />;
      case 'review':
        return <MessageCircle className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4 fill-racing-red text-racing-red" />;
      case 'list':
        return <List className="w-4 h-4" />;
      case 'follow':
        return <UserPlus className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'log':
        return 'logged';
      case 'review':
        return 'reviewed';
      case 'like':
        return 'liked';
      case 'list':
        return 'added to a list';
      case 'follow':
        return 'followed';
    }
  };

  const getActivityLink = (activity: Activity) => {
    switch (activity.targetType) {
      case 'raceLog':
        return `/race/${activity.targetId}`;
      case 'list':
        return `/lists/${activity.targetId}`;
      case 'user':
        return `/user/${activity.targetId}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {feedType === 'following'
          ? 'Follow users to see their activity here'
          : 'No activity yet'}
      </div>
    );
  }

  const displayedActivities = activities.slice(0, showCount);
  const hasMore = activities.length > showCount;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2 sm:px-0">
      {displayedActivities.map((activity) => (
        <Card key={activity.id} className="group hover:border-racing-red/30 transition-all relative overflow-hidden">

          <div className="p-3 sm:p-4 md:p-5">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Avatar with racing ring */}
              <Link to={`/user/${activity.userId}`} className="flex-shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-racing-red/20 to-background flex items-center justify-center border-2 border-racing-red/30 group-hover:border-racing-red/50 transition-colors overflow-hidden">
                    {activity.userAvatar ? (
                      <img
                        src={activity.userAvatar}
                        alt={activity.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs sm:text-sm md:text-base font-bold">
                        {activity.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Activity type badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-racing-red border-2 border-background flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                  <Link to={`/user/${activity.userId}`} className="font-bold text-sm sm:text-base hover:text-racing-red transition-colors">
                    {activity.username}
                  </Link>
                  <span className="text-xs sm:text-sm text-muted-foreground">{getActivityText(activity)}</span>
                  {activity.targetType === 'raceLog' && (
                    <Link to={getActivityLink(activity)} className="text-xs sm:text-sm font-semibold text-racing-red hover:underline">
                      a race
                    </Link>
                  )}
                  {activity.targetType === 'list' && (
                    <Link to={getActivityLink(activity)} className="text-xs sm:text-sm font-semibold text-racing-red hover:underline">
                      a list
                    </Link>
                  )}
                  {activity.targetType === 'user' && activity.type === 'follow' && (
                    <Link to={getActivityLink(activity)} className="text-xs sm:text-sm font-semibold text-racing-red hover:underline">
                      a user
                    </Link>
                  )}
                </div>

                {/* Content */}
                {activity.content && (
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 italic">"{activity.content}"</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <span>📅</span>
                    {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <span>🕐</span>
                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowCount(prev => prev + 10)}
            className="w-full sm:w-auto"
          >
            View More ({activities.length - showCount} remaining)
          </Button>
        </div>
      )}

      {!hasMore && activities.length > initialShow && (
        <div className="text-center pt-4 text-sm text-muted-foreground">
          Showing all {activities.length} activities
        </div>
      )}
    </div>
  );
};
