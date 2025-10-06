import { Header } from "@/components/Header";
import { RaceCard } from "@/components/RaceCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, List, Calendar, History } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicRaceLogs } from "@/services/raceLogs";
import { getPublicLists } from "@/services/lists";
import { getCurrentSeasonRaces, getRacesBySeason } from "@/services/f1Api";

const Explore = () => {
  const [trendingRaces, setTrendingRaces] = useState<any[]>([]);
  const [topReviews, setTopReviews] = useState<any[]>([]);
  const [popularLists, setPopularLists] = useState<any[]>([]);
  const [upcomingRaces, setUpcomingRaces] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [seasonRaces, setSeasonRaces] = useState<any[]>([]);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logs, lists, upcoming] = await Promise.all([
          getPublicRaceLogs(50),
          getPublicLists(),
          getCurrentSeasonRaces()
        ]);

        const logCounts: { [key: string]: number } = {};
        logs.forEach(log => {
          const key = `${log.raceName}-${log.raceYear}`;
          logCounts[key] = (logCounts[key] || 0) + 1;
        });

        const uniqueRaces = Array.from(new Set(logs.map(log => `${log.raceName}-${log.raceYear}`)))
          .map(key => {
            const [raceName, raceYear] = key.split('-');
            const raceLogs = logs.filter(l => l.raceName === raceName && l.raceYear === parseInt(raceYear));
            return raceLogs[0];
          })
          .sort((a, b) => {
            const countA = logCounts[`${a.raceName}-${a.raceYear}`] || 0;
            const countB = logCounts[`${b.raceName}-${b.raceYear}`] || 0;
            return countB - countA;
          })
          .slice(0, 12);

        setTrendingRaces(uniqueRaces);

        const reviewsWithContent = logs
          .filter(log => log.review && log.review.length > 0)
          .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
          .slice(0, 10);

        setTopReviews(reviewsWithContent);

        const sortedLists = lists
          .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
          .slice(0, 6);

        setPopularLists(sortedLists);

        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thisWeekRaces = upcoming.filter(race => {
          const raceDate = new Date(race.date_start);
          return raceDate >= today && raceDate <= nextWeek;
        });

        setUpcomingRaces(thisWeekRaces);
      } catch (error) {
        console.error('Error loading explore data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadSeasonRaces = async () => {
      setSeasonLoading(true);
      try {
        console.log(`Fetching races for season ${selectedSeason}...`);
        const races = await getRacesBySeason(selectedSeason);
        console.log(`Fetched ${races.length} races for ${selectedSeason}`);
        setSeasonRaces(races);
      } catch (error) {
        console.error('Error loading season races:', error);
      } finally {
        setSeasonLoading(false);
      }
    };

    loadSeasonRaces();
  }, [selectedSeason]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">
            Discover trending races, top reviews, and popular lists from the community
          </p>
        </div>

        <Tabs defaultValue="seasons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="seasons" className="gap-2">
              <History className="w-4 h-4" />
              Browse Seasons
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="w-4 h-4" />
              Top Reviews
            </TabsTrigger>
            <TabsTrigger value="lists" className="gap-2">
              <List className="w-4 h-4" />
              Popular Lists
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              This Week in F1
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seasons" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Browse by Season</h2>
              <p className="text-muted-foreground mb-6">Explore races from previous F1 seasons</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                  <Button
                    key={year}
                    variant={selectedSeason === year ? "default" : "outline"}
                    onClick={() => setSelectedSeason(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>

              {seasonLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading {selectedSeason} season...</div>
              ) : seasonRaces.length === 0 ? (
                <EmptyState
                  icon={History}
                  title={`No races found for ${selectedSeason}`}
                  description="Try selecting a different season or check back later"
                />
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-2">Showing {seasonRaces.length} races for {selectedSeason}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {seasonRaces.map((race) => {
                      console.log('Rendering race card in Explore:', race.meeting_name, race);
                      return (
                        <RaceCard
                          key={race.meeting_key}
                          season={race.year}
                          round={race.meeting_key}
                          gpName={race.meeting_name}
                          circuit={race.circuit_short_name}
                          date={race.date_start}
                          country={race.country_code}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Trending Races</h2>
              <p className="text-muted-foreground mb-6">Most logged races this week</p>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : trendingRaces.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No trending races yet"
                  description="Start logging races to see what's trending in the community"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {trendingRaces.map((race) => (
                    <RaceCard
                      key={race.id}
                      id={race.id}
                      season={race.raceYear}
                      round={race.round || 1}
                      gpName={race.raceName}
                      circuit={race.raceLocation}
                      date={race.dateWatched?.toDate?.()?.toISOString() || ''}
                      rating={race.rating}
                      watched={true}
                      country={race.countryCode}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">Top Reviews</h2>
              <p className="text-muted-foreground mb-6">Most liked reviews this week</p>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : topReviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Be the first to write a review and share your thoughts on F1 races"
                />
              ) : (
                topReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="p-6 space-y-4 hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                    onClick={() => window.location.href = `/race/${review.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">
                        {review.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.username}</span>
                          <span className="text-muted-foreground">reviewed</span>
                          <span className="font-semibold">{review.raceName} {review.raceYear}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="w-4 h-4 fill-racing-red text-racing-red" />
                            <span className="text-sm font-semibold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {review.review.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>❤️ {review.likesCount || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">Popular Lists</h2>
              <p className="text-muted-foreground mb-6">Most liked lists this month</p>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : popularLists.length === 0 ? (
                <EmptyState
                  icon={List}
                  title="No lists yet"
                  description="Create the first list and share your favorite race collections"
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {popularLists.map((list) => (
                    <Card key={list.id} className="p-6 space-y-4 hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <List className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{list.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {list.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{list.races?.length || 0} races</span>
                        <span>❤️ {list.likesCount || 0} likes</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div>
              <h2 className="text-2xl font-bold mb-4">This Week in F1</h2>
              <p className="text-muted-foreground mb-6">Upcoming races to watch</p>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : upcomingRaces.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No upcoming races this week"
                  description="Check back later for the next F1 race weekend"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {upcomingRaces.map((race) => (
                    <RaceCard
                      key={race.meeting_key}
                      season={race.year}
                      round={race.meeting_key}
                      gpName={race.meeting_name}
                      circuit={race.circuit_short_name}
                      date={race.date_start}
                      country={race.country_code}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Explore;
