import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaceCard } from "@/components/RaceCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { UserPlus, UserMinus, Settings, Heart, List, Calendar, Star, Users, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserProfile, getUserRaceLogs, calculateTotalHoursWatched } from "@/services/raceLogs";
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing } from "@/services/follows";
import { getUserLists } from "@/services/lists";
import { getUserWatchlist } from "@/services/watchlist";
import { getDocument, getDocuments } from "@/lib/firestore-native";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();
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
  const [visibleLogsCount, setVisibleLogsCount] = useState(6);
  const [refreshKey, setRefreshKey] = useState(0);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  const loadProfile = async (forceRefresh = false) => {
    const targetUserId = userId || currentUser?.uid;

    console.log('[Profile] Loading profile for userId:', targetUserId, 'forceRefresh:', forceRefresh);
    console.log('[Profile] URL param userId:', userId);
    console.log('[Profile] Current user UID:', currentUser?.uid);

    if (!targetUserId) {
      console.warn('[Profile] No target user ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('[Profile] Fetching user document...');

      // If force refresh, add a small delay to ensure Firestore has the latest data
      if (forceRefresh) {
        console.log('[Profile] Force refresh - waiting for data propagation...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const profileData = await getDocument(`users/${targetUserId}`);
      if (profileData) {
        console.log('[Profile] ✅ Profile data loaded for:', targetUserId, 'photoURL:', profileData.photoURL);
        // Add timestamp to force image reload
        const photoURL = profileData.photoURL ? `${profileData.photoURL}?t=${Date.now()}` : null;
        setProfile({ id: targetUserId, ...profileData, photoURL });
      } else {
        console.log('[Profile] ⚠️ No profile data found, using defaults');
        setProfile({
          id: targetUserId,
          name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User',
          email: currentUser?.email,
          description: 'F1 fan',
        });
      }

      console.log('[Profile] Fetching user race logs...');
      const userLogs = await getUserRaceLogs(targetUserId);
      console.log('[Profile] Found', userLogs.length, 'race logs');

      const hoursWatched = calculateTotalHoursWatched(userLogs);
      const reviewsCount = userLogs.filter(log => log.review && log.review.length > 0).length;

      console.log('[Profile] Fetching user stats...');
      const userStatsData = await getDocument(`userStats/${targetUserId}`);
      setStatsDoc(userStatsData ? { exists: () => true, data: () => userStatsData } : { exists: () => false, data: () => ({}) });
      const statsData = userStatsData || {};

      setStats({
        racesWatched: userLogs.length,
        hoursSpent: Math.round(hoursWatched),
        reviews: reviewsCount,
        lists: statsData.listsCount || 0,
        followers: statsData.followersCount || 0,
        following: statsData.followingCount || 0,
      });

      console.log('[Profile] Stats loaded:', {
        racesWatched: userLogs.length,
        followers: statsData.followersCount || 0,
        following: statsData.followingCount || 0,
      });

      setLogs(userLogs.map(log => ({
        id: log.id,
        season: log.raceYear,
        round: log.round || 1,
        gpName: log.raceName,
        circuit: log.raceLocation,
        date: log.dateWatched ? (typeof log.dateWatched.toDate === 'function' ? log.dateWatched.toDate().toISOString() : log.dateWatched.toString()) : new Date().toISOString(),
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
        const likesDocs = await getDocuments('likes', {
          where: [{ field: 'userId', operator: '==', value: targetUserId }]
        });
        const likedRaceLogIds = likesDocs.map(doc => doc.raceLogId);

        // Fetch the actual race logs
        if (likedRaceLogIds.length > 0) {
          // Fetch each race log individually since native plugin may not support 'in' operator
          const likedLogs = await Promise.all(
            likedRaceLogIds.slice(0, 10).map(async (logId) => {
              const logData = await getDocument(`raceLogs/${logId}`);
              return logData ? { id: logId, ...logData } : null;
            })
          );
          setLikes(likedLogs.filter(log => log !== null));
        }
      } catch (error) {
        console.error('Error loading likes:', error);
        setLikes([]);
      }
    } catch (error) {
      console.error('[Profile] ❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async () => {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return;

    setFollowersLoading(true);
    try {
      const followersList = await getFollowers(targetUserId);
      setFollowers(followersList);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  const loadFollowing = async () => {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) return;

    setFollowersLoading(true);
    try {
      const followingList = await getFollowing(targetUserId);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setFollowersLoading(false);
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
        setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        toast({ title: 'Unfollowed user' });
        // Reload the lists if dialogs are open
        if (followersDialogOpen) {
          await loadFollowers();
        }
        if (followingDialogOpen) {
          await loadFollowing();
        }
      } else {
        await followUser(targetUserId);
        setFollowingUser(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast({ title: 'Following user' });
        // Reload the lists if dialogs are open
        if (followersDialogOpen) {
          await loadFollowers();
        }
        if (followingDialogOpen) {
          await loadFollowing();
        }
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update follow status', variant: 'destructive' });
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading before attempting to load profile
    if (authLoading) {
      console.log('[Profile] Waiting for auth to load...');
      return;
    }

    // Only load profile if we have a user (currentUser for own profile, userId for other profiles)
    if (currentUser || userId) {
      loadProfile();
    } else {
      console.log('[Profile] No user available after auth loaded');
      setLoading(false);
    }
  }, [userId, currentUser?.uid, authLoading]);

  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-[#0a0a0a] racing-grid pb-[env(safe-area-inset-bottom,4rem)] lg:pb-0">
      <Header />

      <main className="container px-[4vw] py-[2vh] sm:py-[3vh] max-w-full">
        {/* Profile Header */}
        <div className="space-y-6 mb-6 sm:mb-8">
          {/* Profile Info */}
          <div className="px-0 sm:px-6">
            <div className="bg-black/90 backdrop-blur-sm border-2 border-red-900/40 rounded-lg p-4 sm:p-6">
            {/* Avatar */}
            <div className="flex items-end justify-between mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-racing-red/40 overflow-hidden bg-black/80 flex items-center justify-center shadow-xl shadow-red-500/30">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    {(profile?.name || profile?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mb-2">
                {currentUser?.uid === (userId || currentUser?.uid) ? (
                  <EditProfileDialog profile={profile} onSuccess={() => loadProfile(true)} />
                ) : (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    variant={followingUser ? "outline" : "default"}
                    className={followingUser ? "border-2 border-racing-red bg-black/60 text-white hover:bg-racing-red/20 font-black uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" : "bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider"}
                  >
                    {followingUser ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>

            {/* Name and Bio */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
                {profile?.name || 'Loading...'}
              </h1>
              <p className="text-sm sm:text-base text-gray-200 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                @{profile?.email?.split('@')[0] || 'user'}
              </p>

              {profile?.description && (
                <p className="mt-3 text-sm sm:text-base text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  {profile.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm mb-6">
              <div>
                <span className="font-black text-racing-red drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{stats.racesWatched}</span>{' '}
                <span className="text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Races</span>
              </div>
              <button
                onClick={async () => {
                  setFollowersDialogOpen(true);
                  if (followers.length === 0) {
                    await loadFollowers();
                  }
                }}
                className="hover:opacity-70 transition-opacity cursor-pointer touch-manipulation"
              >
                <span className="font-black text-racing-red drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{stats.followers}</span>{' '}
                <span className="text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Followers</span>
              </button>
              <button
                onClick={async () => {
                  setFollowingDialogOpen(true);
                  if (following.length === 0) {
                    await loadFollowing();
                  }
                }}
                className="hover:opacity-70 transition-opacity cursor-pointer touch-manipulation"
              >
                <span className="font-black text-racing-red drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{stats.following}</span>{' '}
                <span className="text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Following</span>
              </button>
            </div>

            {/* Time Spent Watching */}
            <div className="mb-6 py-3 px-4 bg-gradient-to-r from-racing-red/10 via-racing-red/15 to-racing-red/10 rounded-lg border-2 border-racing-red/40">
              <div className="flex items-center gap-1.5 flex-wrap text-sm sm:text-base">
                <span className="text-gray-100 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{currentUser?.uid === (userId || currentUser?.uid) ? "You've" : `${profile?.name || 'They'} has`} spent</span>
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
                          <span className="font-black text-racing-red drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{months}</span>
                          <span className="text-gray-200 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{months === 1 ? 'month' : 'months'}</span>
                        </>
                      )}
                      {days > 0 && (
                        <>
                          <span className="font-black text-racing-red drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{days}</span>
                          <span className="text-gray-200 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{days === 1 ? 'day' : 'days'}</span>
                        </>
                      )}
                      <span className="font-black text-racing-red drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{hours}</span>
                      <span className="text-gray-200 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{hours === 1 ? 'hour' : 'hours'}</span>
                      <span className="text-gray-100 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">watching GPs 🏎️</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Favourites */}
            {(statsDoc?.exists() && (statsDoc.data()?.favoriteDriver || statsDoc.data()?.favoriteCircuit || statsDoc.data()?.favoriteTeam)) && (
              <Card className="p-4 sm:p-5 mb-6 border-2 border-red-900/40 bg-black/90 backdrop-blur-sm">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white mb-3 sm:mb-4 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-racing-red fill-racing-red drop-shadow-[0_0_4px_rgba(220,38,38,0.8)]" />
                  FAVORITES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {statsDoc.data()?.favoriteDriver && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-racing-red/15 border border-racing-red/40">
                      <p className="text-[10px] sm:text-xs text-gray-200 mb-0.5 sm:mb-1 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Driver</p>
                      <p className="font-black text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{statsDoc.data().favoriteDriver}</p>
                    </div>
                  )}
                  {statsDoc.data()?.favoriteCircuit && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-racing-red/15 border border-racing-red/40">
                      <p className="text-[10px] sm:text-xs text-gray-200 mb-0.5 sm:mb-1 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Circuit</p>
                      <p className="font-black text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{statsDoc.data().favoriteCircuit}</p>
                    </div>
                  )}
                  {statsDoc.data()?.favoriteTeam && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-racing-red/15 border border-racing-red/40">
                      <p className="text-[10px] sm:text-xs text-gray-200 mb-0.5 sm:mb-1 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Team</p>
                      <p className="font-black text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{statsDoc.data().favoriteTeam}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-full sm:w-auto inline-flex justify-start min-w-max border-2 border-red-900/30 bg-black/50">
              <TabsTrigger value="logs" className="gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 font-black uppercase tracking-wider data-[state=active]:bg-racing-red data-[state=active]:text-white">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 font-black uppercase tracking-wider data-[state=active]:bg-racing-red data-[state=active]:text-white">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="lists" className="gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 font-black uppercase tracking-wider data-[state=active]:bg-racing-red data-[state=active]:text-white">
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
                Lists
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 font-black uppercase tracking-wider data-[state=active]:bg-racing-red data-[state=active]:text-white">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                Watch
              </TabsTrigger>
              <TabsTrigger value="likes" className="gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 font-black uppercase tracking-wider data-[state=active]:bg-racing-red data-[state=active]:text-white">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                Likes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="logs" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : logs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[2vw] sm:gap-[1.5vw]">
                  {logs.slice(0, visibleLogsCount).map((race, idx) => (
                    <RaceCard key={idx} {...race} />
                  ))}
                </div>
                {logs.length > visibleLogsCount && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={() => setVisibleLogsCount(prev => prev + 12)}
                      className="bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider"
                    >
                      View More ({logs.length - visibleLogsCount} remaining)
                    </Button>
                  </div>
                )}
              </>
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
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : logs.filter(log => logs.find(l => l.id === log.id && l.rating > 0)).length > 0 ? (
              logs
                .filter(log => {
                  const fullLog = logs.find(l => l.id === log.id);
                  return fullLog && fullLog.rating > 0;
                })
                .map((race) => (
                  <Card key={race.id} className="p-6 border-2 border-red-900/30 bg-black/40 backdrop-blur hover:ring-2 hover:ring-racing-red transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-black/60 border-2 border-racing-red/40 flex items-center justify-center">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-lg font-bold text-white">
                            {(profile?.name || profile?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-white">{profile?.name || profile?.email?.split('@')[0]}</span>
                          <span className="text-gray-200 text-sm font-bold">reviewed</span>
                          <span
                            className="font-semibold text-white hover:text-racing-red cursor-pointer"
                            onClick={() => navigate(`/race/${race.season}/${race.round}`)}
                          >
                            {race.season} {race.gpName}
                          </span>
                          {race.rating && (
                            <div className="flex items-center gap-1 ml-auto">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-semibold">{race.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-200 mb-2 font-bold">
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
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : lists.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {lists.map((list) => (
                  <Card
                    key={list.id}
                    className="p-6 hover:ring-2 hover:ring-racing-red border-2 border-red-900/30 bg-black/40 backdrop-blur transition-all cursor-pointer"
                    onClick={() => navigate(`/list/${list.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-racing-red/20 to-racing-red/5 rounded-xl flex items-center justify-center">
                        <List className="w-6 h-6 text-racing-red" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{list.title}</h3>
                        <p className="text-sm text-gray-200 line-clamp-2">{list.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-200 font-bold pt-3 border-t border-red-900/30">
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
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : watchlist.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[2vw] sm:gap-[1.5vw]">
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
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : likes.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[2vw] sm:gap-[1.5vw]">
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
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <Card key={follower.id} className="p-4 border-2 border-red-900/30 bg-black/40 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-black/60 border-2 border-racing-red/40 flex items-center justify-center overflow-hidden">
                        {follower.photoURL ? (
                          <img src={follower.photoURL} alt={follower.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-lg font-bold text-white">
                            {(follower.name || follower.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white">{follower.name || follower.email?.split('@')[0]}</p>
                        <p className="text-sm text-gray-300 font-bold truncate">@{follower.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-2 border-racing-red bg-black/60 text-white hover:bg-racing-red/20 font-black uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] touch-manipulation cursor-pointer min-h-[44px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${follower.id}`);
                      }}
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
              <div className="text-center py-12 text-gray-200 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Loading...</div>
            ) : following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((followedUser) => (
                  <Card key={followedUser.id} className="p-4 border-2 border-red-900/30 bg-black/40 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-black/60 border-2 border-racing-red/40 flex items-center justify-center overflow-hidden">
                        {followedUser.photoURL ? (
                          <img src={followedUser.photoURL} alt={followedUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-lg font-bold text-white">
                            {(followedUser.name || followedUser.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white">{followedUser.name || followedUser.email?.split('@')[0]}</p>
                        <p className="text-sm text-gray-300 font-bold truncate">@{followedUser.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-2 border-racing-red bg-black/60 text-white hover:bg-racing-red/20 font-black uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] touch-manipulation cursor-pointer min-h-[44px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${followedUser.id}`);
                      }}
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

      {/* Followers Dialog */}
      <Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[80vh] bg-black/95 border-2 border-racing-red/40">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white uppercase tracking-wider">
              Followers ({stats.followers})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {followersLoading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : followers.length > 0 ? (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <Card key={follower.id} className="p-3 border-2 border-red-900/30 bg-black/40 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/60 border-2 border-racing-red/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {follower.photoURL ? (
                          <img src={follower.photoURL} alt={follower.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-sm font-bold text-white">
                            {(follower.name || follower.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white text-sm">{follower.name || follower.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-300 font-bold truncate">@{follower.email?.split('@')[0]}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-racing-red bg-black/60 text-white hover:bg-racing-red/20 font-black uppercase tracking-wider text-xs"
                        onClick={() => {
                          navigate(`/user/${follower.id}`);
                          setFollowersDialogOpen(false);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="font-bold">No followers yet</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[80vh] bg-black/95 border-2 border-racing-red/40">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white uppercase tracking-wider">
              Following ({stats.following})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {followersLoading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : following.length > 0 ? (
              <div className="space-y-3">
                {following.map((followedUser) => (
                  <Card key={followedUser.id} className="p-3 border-2 border-red-900/30 bg-black/40 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/60 border-2 border-racing-red/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {followedUser.photoURL ? (
                          <img src={followedUser.photoURL} alt={followedUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-sm font-bold text-white">
                            {(followedUser.name || followedUser.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white text-sm">{followedUser.name || followedUser.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-300 font-bold truncate">@{followedUser.email?.split('@')[0]}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-racing-red bg-black/60 text-white hover:bg-racing-red/20 font-black uppercase tracking-wider text-xs"
                        onClick={() => {
                          navigate(`/user/${followedUser.id}`);
                          setFollowingDialogOpen(false);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="font-bold">Not following anyone yet</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
