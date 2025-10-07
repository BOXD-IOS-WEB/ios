import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogRaceDialog } from "@/components/LogRaceDialog";
import { StarRating } from "@/components/StarRating";
import { Comments } from "@/components/Comments";
import { AddToListDialog } from "@/components/AddToListDialog";
import { Plus, Heart, Bookmark, Share2, Eye, Star, MessageSquare, List } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { addToWatchlist, removeFromWatchlist } from "@/services/watchlist";
import { toggleLike } from "@/services/likes";
import { getCountryFlag, getRaceByYearAndRound } from "@/services/f1Api";
import { getRaceLogById, getPublicRaceLogs } from "@/services/raceLogs";
import { auth } from "@/lib/firebase";

const RaceDetail = () => {
  const { id, season, round } = useParams();
  const year = season;
  console.log('[RaceDetail] URL Params:', { id, season, year, round });

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [raceLog, setRaceLog] = useState<any>(null);
  const [raceInfo, setRaceInfo] = useState<any>(null);
  const [allRaceLogs, setAllRaceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadRaceData = async () => {
      console.log('[RaceDetail] Starting data load...');

      // Try to load public race logs, but don't let it block the rest
      try {
        const logs = await getPublicRaceLogs(100);
        console.log('[RaceDetail] Loaded', logs.length, 'public race logs');
        setAllRaceLogs(logs);
      } catch (error) {
        console.warn('[RaceDetail] Failed to load public logs (probably missing index):', error);
        setAllRaceLogs([]);
      }

      try {
        if (id) {
          console.log('[RaceDetail] Loading by ID:', id);
          const log = await getRaceLogById(id);
          console.log('[RaceDetail] Race log by ID:', log);
          setRaceLog(log);

          const user = auth.currentUser;
          if (user && log) {
            setIsLiked(log.likedBy?.includes(user.uid) || false);
          }
        } else if (year && round) {
          console.log('[RaceDetail] Loading by year/round:', year, round);

          // Always fetch race info from F1 API
          console.log('[RaceDetail] Fetching from F1 API: year=', parseInt(year), 'round=', parseInt(round));
          const raceData = await getRaceByYearAndRound(parseInt(year), parseInt(round));
          console.log('[RaceDetail] F1 API returned:', raceData);
          if (raceData) {
            setRaceInfo(raceData);
          } else {
            console.error('[RaceDetail] F1 API returned null!');
          }
        } else {
          console.error('[RaceDetail] No id, year, or round found in URL params!');
        }
      } catch (error) {
        console.error('[RaceDetail] Error loading race data:', error);
      } finally {
        setLoading(false);
        console.log('[RaceDetail] Loading complete');
      }
    };

    loadRaceData();
  }, [id, year, round]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">Loading...</div>
      </div>
    );
  }

  // Use raceInfo from F1 API if no logs exist
  let race = null;

  if (raceLog) {
    console.log('Using race log data:', raceLog);
    race = {
      season: raceLog.raceYear,
      round: raceLog.round || 1,
      gpName: raceLog.raceName,
      circuit: raceLog.raceLocation,
      country: raceLog.raceLocation,
      countryCode: raceLog.countryCode || 'ae',
      date: raceLog.dateWatched?.toDate?.()?.toISOString() || new Date().toISOString(),
      rating: raceLog.rating,
      totalRatings: raceLog.likesCount || 0,
      watched: allRaceLogs.filter(l => l.raceName === raceLog.raceName && l.raceYear === raceLog.raceYear).length,
    };
  } else if (raceInfo) {
    console.log('Using F1 API data:', raceInfo);
    race = {
      season: raceInfo.year,
      round: raceInfo.round,
      gpName: raceInfo.meeting_name,
      circuit: raceInfo.circuit_short_name,
      country: raceInfo.country_name,
      countryCode: raceInfo.country_code || 'BRN',
      date: raceInfo.date_start,
      rating: 0,
      totalRatings: 0,
      watched: allRaceLogs.filter(l => l.raceName === raceInfo.meeting_name && l.raceYear === raceInfo.year).length,
    };
  }

  console.log('Final race object:', race);

  if (!race) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Race not found. Please try again.</p>
        </div>
      </div>
    );
  }

  const flagUrl = getCountryFlag(race.countryCode);

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist && watchlistId) {
        await removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
        setWatchlistId(null);
        toast({ title: "Removed from watchlist" });
      } else {
        const id = await addToWatchlist({
          userId: '',
          raceYear: race.season,
          raceName: race.gpName,
          raceLocation: race.circuit,
          raceDate: new Date(race.date),
          notes: '',
          reminderEnabled: false,
        });
        setIsInWatchlist(true);
        setWatchlistId(id);
        toast({ title: "Added to watchlist" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const reviews = allRaceLogs.filter(log => {
    if (!raceLog && !raceInfo) return false;
    const targetRaceName = raceLog?.raceName || raceInfo?.meeting_name;
    const targetRaceYear = raceLog?.raceYear || raceInfo?.year;
    return log.raceName === targetRaceName &&
      log.raceYear === targetRaceYear &&
      log.review &&
      log.review.length > 0;
  });

  const handleLikeReview = async (reviewId: string) => {
    try {
      const liked = await toggleLike(reviewId);
      const logs = await getPublicRaceLogs(100);
      setAllRaceLogs(logs);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLikeRace = async () => {
    if (!id) return;
    try {
      const liked = await toggleLike(id);
      setIsLiked(liked);
      toast({ title: liked ? "Added to likes" : "Removed from likes" });

      const log = await getRaceLogById(id);
      setRaceLog(log);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? "Bookmark removed" : "Bookmarked" });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: race.gpName,
          text: `Check out ${race.gpName} on BoxBoxd`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied to clipboard" });
      }
    } catch (error) {
      toast({ title: "Link copied to clipboard" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poster & Info */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 aspect-[2/3] md:aspect-[2/3] bg-gradient-to-br from-racing-red/20 to-background rounded-lg overflow-hidden relative">
                <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                    <img
                      src={flagUrl}
                      alt={race.country}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{race.season}</div>
                    <div className="text-sm mt-2 font-medium line-clamp-2">{race.gpName}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{race.gpName}</h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{race.season} • Round {race.round}</p>
                </div>

                <div className="flex items-center gap-2">
                  <StarRating rating={race.rating} readonly />
                  <span className="text-muted-foreground text-sm">
                    ({race.totalRatings.toLocaleString()} ratings)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <LogRaceDialog
                    trigger={
                      <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Log</span>
                      </Button>
                    }
                  />
                  <AddToListDialog
                    raceYear={race.season}
                    raceName={race.gpName}
                    raceLocation={race.circuit}
                    countryCode={race.countryCode}
                    trigger={
                      <Button size="sm" variant="outline" className="gap-2">
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to List</span>
                      </Button>
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={handleWatchlistToggle}
                  >
                    <Eye className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                  </Button>
                  {id && (
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleLikeRace}>
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="hidden xs:inline">{isLiked ? 'Liked' : 'Like'}</span>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={handleBookmark}>
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Circuit</p>
                    <p className="font-semibold">{race.circuit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-semibold">{race.country}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(race.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Reviews <span className="text-muted-foreground font-normal">({reviews.length})</span>
              </h2>

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet. Be the first to review this race!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-0 overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex">
                        {/* Left stripe with rating */}
                        <div className="w-16 sm:w-20 bg-gradient-to-b from-racing-red/10 to-racing-red/5 flex flex-col items-center justify-start pt-4 sm:pt-6 gap-2">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-muted border-2 border-background shadow-sm flex items-center justify-center font-bold text-sm sm:text-lg overflow-hidden">
                            {review.userAvatar ? (
                              <img
                                src={review.userAvatar}
                                alt={review.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{review.username?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                          </div>
                          <div className="flex flex-col items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                  i < review.rating
                                    ? 'fill-racing-red text-racing-red'
                                    : 'text-muted stroke-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-4 sm:p-6">
                          <div className="flex flex-wrap items-baseline gap-2 mb-3">
                            <span className="font-semibold text-base sm:text-lg hover:text-racing-red transition-colors cursor-pointer">
                              {review.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {review.dateWatched instanceof Date
                                ? review.dateWatched.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : review.createdAt instanceof Date
                                  ? review.createdAt.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  : 'Recently'}
                            </span>
                          </div>

                          <div className="text-base leading-relaxed mb-4 text-foreground/90">
                            {review.review}
                          </div>

                          {/* Tags */}
                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {review.tags.map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs hover:bg-racing-red/10 transition-colors cursor-pointer"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t">
                            <button
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-racing-red transition-colors group"
                              onClick={() => review.id && handleLikeReview(review.id)}
                            >
                              <Heart className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                                review.likedBy?.includes(auth.currentUser?.uid || '')
                                  ? 'fill-racing-red text-racing-red'
                                  : ''
                              }`} />
                              <span className="font-medium">
                                {review.likesCount > 0 ? review.likesCount : 'Like'}
                              </span>
                            </button>
                            <button
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                              onClick={() => setExpandedComments(expandedComments === review.id ? null : review.id)}
                            >
                              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">
                                {review.commentsCount > 0 ? `${review.commentsCount} ${review.commentsCount === 1 ? 'comment' : 'comments'}` : 'Comment'}
                              </span>
                            </button>
                          </div>

                          {/* Comments Section */}
                          {expandedComments === review.id && review.id && (
                            <div className="mt-4 pt-4 border-t">
                              <Comments raceLogId={review.id} />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <Comments raceLogId={id || ''} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-lg mb-5">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Watched by</span>
                  <span className="font-bold text-2xl">{race.watched.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-racing-red text-racing-red" />
                    <span className="font-bold text-2xl">{race.rating}</span>
                    <span className="text-muted-foreground text-sm">/5</span>
                  </div>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span className="font-bold text-2xl">{reviews.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="hover:bg-racing-red/10 transition-colors cursor-pointer">
                  overtake
                </Badge>
                <Badge variant="secondary" className="hover:bg-racing-red/10 transition-colors cursor-pointer">
                  late-drama
                </Badge>
                <Badge variant="secondary" className="hover:bg-racing-red/10 transition-colors cursor-pointer">
                  season-finale
                </Badge>
                <Badge variant="secondary" className="hover:bg-racing-red/10 transition-colors cursor-pointer">
                  sunset
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RaceDetail;
