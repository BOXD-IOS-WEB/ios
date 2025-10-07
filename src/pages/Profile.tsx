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
import { getUserLists } from "@/services/lists";
import { getUserWatchlist } from "@/services/watchlist";
import { collection, query, where, getDocs } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
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
  const [statsDoc, setStatsDoc] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);

  const loadProfile = async () => {
    const targetUserId = userId || currentUser?.uid;

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
          name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User',
          email: currentUser?.email,
          description: 'F1 fan',
        });
      }

      const userLogs = await getUserRaceLogs(targetUserId);
      const hoursWatched = calculateTotalHoursWatched(userLogs);
      const reviewsCount = userLogs.filter(log => log.review && log.review.length > 0).length;

      const userStatsDoc = await getDoc(doc(db, 'userStats', targetUserId));
      setStatsDoc(userStatsDoc);
      const statsData = userStatsDoc.exists() ? userStatsDoc.data() : {};

      setStats({
        racesWatched: userLogs.length,
        hoursSpent: Math.round(hoursWatched),
        reviews: reviewsCount,
        lists: statsData.listsCount || 0,
        followers: statsData.followersCount || 0,
        following: statsData.followingCount || 0,
      });

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

      if (currentUser && targetUserId !== currentUser.uid) {
        const following = await isFollowing(targetUserId);
        setFollowingUser(following);
      }

      // Load followers, following, lists, watchlist, and likes
      const [followersList, followingList, userLists, userWatchlist] = await Promise.all([
        getFollowers(targetUserId),
        getFollowing(targetUserId),
        getUserLists(targetUserId).catch(() => []),
        getUserWatchlist(targetUserId).catch(() => []),
      ]);

      setFollowers(followersList);
      setFollowing(followingList);
      setLists(userLists);
      setWatchlist(userWatchlist);

      // Load likes (race logs that user has liked)
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', targetUserId)
        );
        const likesSnapshot = await getDocs(likesQuery);
        const likedRaceLogIds = likesSnapshot.docs.map(doc => doc.data().raceLogId);

        // Fetch the actual race logs
        if (likedRaceLogIds.length > 0) {
          const raceLogsQuery = query(
            collection(db, 'raceLogs'),
            where('__name__', 'in', likedRaceLogIds.slice(0, 10)) // Firestore limit
          );
          const raceLogsSnapshot = await getDocs(raceLogsQuery);
          const likedLogs = raceLogsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setLikes(likedLogs);
        }
      } catch (error) {
        console.error('Error loading likes:', error);
        setLikes([]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    const targetUserId = userId || currentUser?.uid;

    if (!currentUser || !targetUserId || targetUserId === currentUser.uid) return;

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
          <div className="h-48 sm:h-56 bg-gradient-to-r from-racing-red/20 to-racing-red/10 rounded-lg" />

          {/* Profile Info */}
          <div className="-mt-16 sm:-mt-20 px-4 sm:px-6">
            {/* Avatar */}
            <div className="flex items-end justify-between mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background overflow-hidden bg-muted flex items-center justify-center shadow-lg">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl sm:text-5xl font-bold">
                    {(profile?.name || profile?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mb-2">
                {currentUser?.uid === (userId || currentUser?.uid) ? (
                  <EditProfileDialog profile={profile} onSuccess={loadProfile} />
                ) : (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    variant={followingUser ? "outline" : "default"}
                  >
                    {followingUser ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>

            {/* Name and Bio */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {profile?.name || 'Loading...'}
              </h1>
              <p className="text-muted-foreground">
                @{profile?.email?.split('@')[0] || 'user'}
              </p>

              {profile?.description && (
                <p className="mt-3 text-base">
                  {profile.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm mb-6">
              <div>
                <span className="font-bold">{stats.racesWatched}</span>{' '}
                <span className="text-muted-foreground">Races</span>
              </div>
              <div>
                <span className="font-bold">{stats.followers}</span>{' '}
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div>
                <span className="font-bold">{stats.following}</span>{' '}
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>

            {/* Time Spent Watching */}
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">You've spent</span>
                {(() => {
                  const totalHours = stats.hoursSpent;
                  const months = Math.floor(totalHours / (24 * 30));
                  const remainingAfterMonths = totalHours % (24 * 30);
                  const days = Math.floor(remainingAfterMonths / 24);
                  const hours = remainingAfterMonths % 24;

                  return (
                    <>
                      {months > 0 && (
                        <>
                          <span className="font-bold text-racing-red">{months}</span>
                          <span className="text-muted-foreground">{months === 1 ? 'month' : 'months'}</span>
                        </>
                      )}
                      {days > 0 && (
                        <>
                          <span className="font-bold text-racing-red">{days}</span>
                          <span className="text-muted-foreground">{days === 1 ? 'day' : 'days'}</span>
                        </>
                      )}
                      <span className="font-bold text-racing-red">{hours}</span>
                      <span className="text-muted-foreground">{hours === 1 ? 'hour' : 'hours'}</span>
                      <span className="text-muted-foreground">watching GPs</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Favourites */}
            {(statsDoc?.exists() && (statsDoc.data()?.favoriteDriver || statsDoc.data()?.favoriteCircuit || statsDoc.data()?.favoriteTeam)) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">F1 Favorites</h3>
                <div className="space-y-2 text-sm">
                  {statsDoc.data()?.favoriteDriver && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-racing-red" />
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-semibold">{statsDoc.data().favoriteDriver}</span>
                    </div>
                  )}
                  {statsDoc.data()?.favoriteCircuit && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-racing-red" />
                      <span className="text-muted-foreground">Circuit:</span>
                      <span className="font-semibold">{statsDoc.data().favoriteCircuit}</span>
                    </div>
                  )}
                  {statsDoc.data()?.favoriteTeam && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-racing-red" />
                      <span className="text-muted-foreground">Team:</span>
                      <span className="font-semibold">{statsDoc.data().favoriteTeam}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : lists.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {lists.map((list) => (
                  <Card
                    key={list.id}
                    className="p-6 hover:ring-2 hover:ring-racing-red transition-all cursor-pointer"
                    onClick={() => navigate(`/list/${list.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-racing-red/20 to-racing-red/5 rounded-xl flex items-center justify-center">
                        <List className="w-6 h-6 text-racing-red" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{list.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                      <span>{list.races?.length || 0} races</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {list.likesCount || 0}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={List}
                title="No lists yet"
                description="Create custom lists to organize your favorite races"
              />
            )}
          </TabsContent>

          <TabsContent value="watchlist">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {watchlist.map((item, idx) => (
                  <RaceCard
                    key={idx}
                    season={item.raceYear}
                    round={idx + 1}
                    gpName={item.raceName}
                    circuit={item.raceLocation}
                    date={item.raceDate?.toDate?.()?.toISOString() || new Date().toISOString()}
                    country={item.countryCode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Eye}
                title="Watchlist is empty"
                description="Add races to your watchlist to keep track of what you want to watch"
              />
            )}
          </TabsContent>

          <TabsContent value="likes">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : likes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {likes.map((log) => (
                  <RaceCard
                    key={log.id}
                    id={log.id}
                    season={log.raceYear}
                    round={log.round || 1}
                    gpName={log.raceName}
                    circuit={log.raceLocation}
                    date={log.dateWatched?.toDate?.()?.toISOString() || new Date().toISOString()}
                    rating={log.rating}
                    watched={true}
                    country={log.countryCode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="No likes yet"
                description="Like reviews and lists to show your appreciation"
              />
            )}
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
