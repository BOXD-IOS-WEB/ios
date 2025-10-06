import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Heart, MessageCircle, List, UserPlus, Eye } from 'lucide-react';
import { Activity, getFollowingActivity, getGlobalActivity } from '@/services/activity';
import { Link } from 'react-router-dom';

interface ActivityFeedProps {
  feedType: 'following' | 'global';
  limit?: number;
}

export const ActivityFeed = ({ feedType, limit = 50 }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {activity.userAvatar ? (
                <img
                  src={activity.userAvatar}
                  alt={activity.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {activity.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getActivityIcon(activity.type)}
                <p className="text-sm">
                  <Link to={`/user/${activity.userId}`} className="font-semibold hover:underline">
                    {activity.username}
                  </Link>
                  {' '}
                  <span className="text-muted-foreground">{getActivityText(activity)}</span>
                  {activity.targetType === 'raceLog' && (
                    <>
                      {' '}
                      <Link to={getActivityLink(activity)} className="font-semibold hover:underline">
                        a race
                      </Link>
                    </>
                  )}
                  {activity.targetType === 'list' && (
                    <>
                      {' '}
                      <Link to={getActivityLink(activity)} className="font-semibold hover:underline">
                        a list
                      </Link>
                    </>
                  )}
                  {activity.targetType === 'user' && activity.type === 'follow' && (
                    <>
                      {' '}
                      <Link to={getActivityLink(activity)} className="font-semibold hover:underline">
                        a user
                      </Link>
                    </>
                  )}
                </p>
              </div>

              {activity.content && (
                <p className="text-sm text-muted-foreground mb-2">{activity.content}</p>
              )}

              <span className="text-xs text-muted-foreground">
                {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
