import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaceCard } from "@/components/RaceCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { UserPlus, UserMinus, Settings, Heart, List, Calendar, Star, Users, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getUserProfile, getUserRaceLogs, calculateTotalHoursWatched } from "@/services/raceLogs";
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing } from "@/services/follows";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { EditProfileDialog } from "@/components/EditProfileDialog";

const Profile = () => {
  const { userId } = useParams();
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    racesWatched: 0,
    hoursSpent: 0,
    reviews: 0,
    lists: 0,
    followers: 0,
    following: 0,
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followingUser, setFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);

  const loadProfile = async () => {
    const user = auth.currentUser;
    const targetUserId = userId || user?.uid;

    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      const profileDoc = await getDoc(doc(db, 'users', targetUserId));
      if (profileDoc.exists()) {
        setProfile({ id: profileDoc.id, ...profileDoc.data() });
      } else {
        setProfile({
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email,
          description: 'F1 fan',
        });
      }

      const userLogs = await getUserRaceLogs(targetUserId);
      const hoursWatched = calculateTotalHoursWatched(userLogs);
      const reviewsCount = userLogs.filter(log => log.review && log.review.length > 0).length;

      const statsDoc = await getDoc(doc(db, 'userStats', targetUserId));
      if (statsDoc.exists()) {
        const statsData = statsDoc.data();
        setStats({
          racesWatched: userLogs.length,
          hoursSpent: Math.round(hoursWatched),
          reviews: reviewsCount,
          lists: statsData.listsCount || 0,
          followers: statsData.followersCount || 0,
          following: statsData.followingCount || 0,
        });
      } else {
        setStats({
          racesWatched: userLogs.length,
          hoursSpent: Math.round(hoursWatched),
          reviews: reviewsCount,
          lists: 0,
          followers: 0,
          following: 0,
        });
      }

      setLogs(userLogs.map(log => ({
        id: log.id,
        season: log.raceYear,
        round: log.round || 1,
        gpName: log.raceName,
        circuit: log.raceLocation,
        date: log.dateWatched.toString(),
        rating: log.rating,
        watched: true,
        country: log.countryCode,
      })));

      if (user && targetUserId !== user.uid) {
        const following = await isFollowing(targetUserId);
        setFollowingUser(following);
      }

      // Load followers and following
      const [followersList, followingList] = await Promise.all([
        getFollowers(targetUserId),
        getFollowing(targetUserId)
      ]);
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    const user = auth.currentUser;
    const targetUserId = userId || user?.uid;

    if (!user || !targetUserId || targetUserId === user.uid) return;

    setFollowLoading(true);
    try {
      if (followingUser) {
        await unfollowUser(targetUserId);
        setFollowingUser(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast({ title: 'Unfollowed user' });
      } else {
        await followUser(targetUserId);
        setFollowingUser(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast({ title: 'Following user' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Profile Header */}
        <div className="space-y-6 mb-8">
          {/* Cover/Banner */}
          <div className="h-48 bg-gradient-to-r from-racing-red/20 to-primary/5 rounded-lg" />
          
          {/* Profile Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start -mt-20 relative">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted flex items-center justify-center">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl font-bold">
                  {(profile?.name || profile?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 pt-16 md:pt-14">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile?.name || 'Loading...'}</h1>
                  <p className="text-muted-foreground">@{profile?.email?.split('@')[0] || 'user'}</p>
                  <p className="mt-2">{profile?.description || 'F1 fan'}</p>
                </div>
                
                <div className="flex gap-2">
                  {auth.currentUser?.uid === (userId || auth.currentUser?.uid) ? (
                    <EditProfileDialog profile={profile} onSuccess={loadProfile} />
                  ) : (
                    <Button
                      className="gap-2"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      variant={followingUser ? "outline" : "default"}
                    >
                      {followingUser ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.racesWatched}</div>
                  <div className="text-xs text-muted-foreground">Races</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.hoursSpent}h</div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.reviews}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.lists}</div>
                  <div className="text-xs text-muted-foreground">Lists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>

              {/* Favourites */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Badge variant="secondary" className="gap-2 py-2 px-3">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  Favorite Driver: Lewis Hamilton
                </Badge>
                <Badge variant="secondary" className="gap-2 py-2 px-3">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  Favorite Circuit: Suzuka
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="logs" className="gap-2">
              <Calendar className="w-4 h-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="lists" className="gap-2">
              <List className="w-4 h-4" />
              Lists
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-2">
              <Eye className="w-4 h-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="likes" className="gap-2">
              <Heart className="w-4 h-4" />
              Likes
            </TabsTrigger>
            <TabsTrigger value="followers" className="gap-2">
              <Users className="w-4 h-4" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <Users className="w-4 h-4" />
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : logs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {logs.map((race, idx) => (
                  <RaceCard key={idx} {...race} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No race logs yet"
                description="Start logging F1 races you've watched to build your collection"
              />
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : logs.filter(log => logs.find(l => l.id === log.id && l.rating > 0)).length > 0 ? (
              logs
                .filter(log => {
                  const fullLog = logs.find(l => l.id === log.id);
                  return fullLog && fullLog.rating > 0;
                })
                .map((race) => (
                  <Card key={race.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-lg font-bold">
                            {(profile?.name || profile?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold">{profile?.name || profile?.email?.split('@')[0]}</span>
                          <span className="text-muted-foreground text-sm">reviewed</span>
                          <span
                            className="font-semibold hover:text-racing-red cursor-pointer"
                            onClick={() => navigate(`/race/${race.season}/${race.round}`)}
                          >
                            {race.season} {race.gpName}
                          </span>
                          {race.rating && (
                            <div className="flex items-center gap-1 ml-auto">
                              <Star className="w-4 h-4 fill-racing-red text-racing-red" />
                              <span className="text-sm font-semibold">{race.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Watched at {race.circuit} on {new Date(race.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
            ) : (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description="Rate and review the races you've watched to share your thoughts"
              />
            )}
          </TabsContent>

          <TabsContent value="lists">
            <EmptyState
              icon={List}
              title="No lists yet"
              description="Create custom lists to organize your favorite races"
            />
          </TabsContent>

          <TabsContent value="watchlist">
            <EmptyState
              icon={Eye}
              title="Watchlist is empty"
              description="Add races to your watchlist to keep track of what you want to watch"
            />
          </TabsContent>

          <TabsContent value="likes">
            <EmptyState
              icon={Heart}
              title="No likes yet"
              description="Like reviews and lists to show your appreciation"
            />
          </TabsContent>

          <TabsContent value="followers">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <Card key={follower.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {follower.photoURL ? (
                          <img src={follower.photoURL} alt={follower.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-lg font-bold">
                            {(follower.name || follower.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{follower.name || follower.email?.split('@')[0]}</p>
                        <p className="text-sm text-muted-foreground truncate">@{follower.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => navigate(`/user/${follower.id}`)}
                    >
                      View Profile
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No followers yet"
                description="Share your profile and connect with other F1 fans"
              />
            )}
          </TabsContent>

          <TabsContent value="following">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((followedUser) => (
                  <Card key={followedUser.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {followedUser.photoURL ? (
                          <img src={followedUser.photoURL} alt={followedUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-lg font-bold">
                            {(followedUser.name || followedUser.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{followedUser.name || followedUser.email?.split('@')[0]}</p>
                        <p className="text-sm text-muted-foreground truncate">@{followedUser.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => navigate(`/user/${followedUser.id}`)}
                    >
                      View Profile
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Not following anyone yet"
                description="Follow other F1 fans to see their activity and race logs"
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
