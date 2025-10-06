import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogRaceDialog } from "@/components/LogRaceDialog";
import { StarRating } from "@/components/StarRating";
import { Comments } from "@/components/Comments";
import { Plus, Heart, Bookmark, Share2, Eye, Star, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { addToWatchlist, removeFromWatchlist } from "@/services/watchlist";
import { toggleLike } from "@/services/likes";
import { getCountryFlag, getRaceByYearAndRound } from "@/services/f1Api";
import { getRaceLogById, getPublicRaceLogs } from "@/services/raceLogs";
import { auth } from "@/lib/firebase";

const RaceDetail = () => {
  const { id, year, round } = useParams();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [raceLog, setRaceLog] = useState<any>(null);
  const [raceInfo, setRaceInfo] = useState<any>(null);
  const [allRaceLogs, setAllRaceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadRaceData = async () => {
      try {
        const logs = await getPublicRaceLogs(100);
        setAllRaceLogs(logs);

        if (id) {
          // Load specific race log by ID
          const log = await getRaceLogById(id);
          setRaceLog(log);

          const user = auth.currentUser;
          if (user && log) {
            setIsLiked(log.likedBy?.includes(user.uid) || false);
          }
        } else if (year && round) {
          // Try to find a race log for this year/round
          const matchingLogs = logs.filter(log =>
            log.raceYear === parseInt(year) && log.round === parseInt(round)
          );

          if (matchingLogs.length > 0) {
            // Use the first matching log for race details
            setRaceLog(matchingLogs[0]);
          }

          // Always fetch race info from F1 API
          const raceData = await getRaceByYearAndRound(parseInt(year), parseInt(round));
          if (raceData) {
            setRaceInfo(raceData);
          }
        }
      } catch (error) {
        console.error('Error loading race data:', error);
      } finally {
        setLoading(false);
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
  const race = raceLog ? {
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
  } : raceInfo ? {
    season: raceInfo.year,
    round: raceInfo.meeting_key,
    gpName: raceInfo.meeting_name,
    circuit: raceInfo.circuit_short_name,
    country: raceInfo.country_name,
    countryCode: raceInfo.country_code || 'ae',
    date: raceInfo.date_start,
    rating: 0,
    totalRatings: 0,
    watched: allRaceLogs.filter(l => l.raceName === raceInfo.meeting_name && l.raceYear === raceInfo.year).length,
  } : null;

  if (!race) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Race Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This race doesn't exist in our database.
            </p>
          </div>
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

  const reviews = allRaceLogs.filter(log =>
    log.raceName === raceLog.raceName &&
    log.raceYear === raceLog.raceYear &&
    log.review &&
    log.review.length > 0
  );

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
      
      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poster & Info */}
            <div className="flex gap-6">
              <div className="w-64 aspect-[2/3] bg-gradient-to-br from-racing-red/20 to-background rounded-lg overflow-hidden relative">
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
                  <h1 className="text-4xl font-bold mb-2">{race.gpName}</h1>
                  <p className="text-xl text-muted-foreground">{race.season} • Round {race.round}</p>
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
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Log
                      </Button>
                    }
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleWatchlistToggle}
                  >
                    <Eye className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                    {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleLikeRace}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'}
                  </Button>
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
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{race.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Laps</p>
                    <p className="font-semibold">{race.laps}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Reviews ({reviews.length})
              </h2>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review this race!
                  </div>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">
                          {review.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.username}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-racing-red text-racing-red" />
                              <span className="text-sm font-semibold">{review.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {review.dateWatched?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{review.review}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {review.tags?.map((tag: string) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                              <button
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                                onClick={() => review.id && handleLikeReview(review.id)}
                              >
                                <Heart className={`w-4 h-4 ${review.likedBy?.includes(auth.currentUser?.uid || '') ? 'fill-red-500 text-red-500' : ''}`} />
                                {review.likesCount || 0}
                              </button>
                              <button className="flex items-center gap-1 hover:text-foreground">
                                <MessageSquare className="w-4 h-4" />
                                {review.commentsCount || 0}
                              </button>
                            </div>
                          </div>
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
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Watched by</span>
                  <span className="font-semibold">{race.watched.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-semibold">{race.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-semibold">{reviews.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">overtake</Badge>
                <Badge variant="secondary">late-drama</Badge>
                <Badge variant="secondary">season-finale</Badge>
                <Badge variant="secondary">sunset</Badge>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RaceDetail;
