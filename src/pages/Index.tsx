import { Header } from "@/components/Header";
import { RaceCard } from "@/components/RaceCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicRaceLogs } from "@/services/raceLogs";
import { getCurrentSeasonRaces, getPosterUrl } from "@/services/f1Api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "@/lib/firebase";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');
  const [currentRaces, setCurrentRaces] = useState<any[]>([]);
  const [popularRaces, setPopularRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching current season races...');
        const f1Races = await getCurrentSeasonRaces();
        console.log('Races fetched:', f1Races.length, 'races');

        if (Array.isArray(f1Races) && f1Races.length > 0) {
          setCurrentRaces(f1Races.slice(0, 6));
        } else {
          console.warn('No races returned from API');
        }

        try {
          const publicLogs = await getPublicRaceLogs(100);
          if (Array.isArray(publicLogs) && publicLogs.length > 0) {
            // Filter by tag if present
            if (tagFilter) {
              const filtered = publicLogs.filter(log =>
                log.tags && log.tags.includes(tagFilter)
              );
              setPopularRaces(filtered);
            } else {
              setPopularRaces(publicLogs.slice(0, 6));
            }
          }
        } catch (logError) {
          console.error('Error loading public logs:', logError);
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tagFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-12 md:space-y-16">
        {/* Hero Section */}
        <section className="relative text-center space-y-4 md:space-y-6 py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 md:px-8 rounded-xl md:rounded-3xl overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(/ferrari-f1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
              filter: 'grayscale(0%)'
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-8 leading-tight">
              <span className="hidden sm:inline">Track every <span className="text-racing-red">race</span> you watch.</span>
              <span className="sm:hidden">Track every <span className="text-racing-red">race.</span></span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white max-w-xl md:max-w-2xl mx-auto px-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)' }}>
              BoxBoxd lets you log, rate and review every F1 race. Keep a diary and connect with fellow fans. 🏎️
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 pt-6 md:pt-10">
              <Button size="lg" className="gap-2 w-full sm:w-auto md:h-14 md:px-8 md:text-lg" onClick={() => navigate('/diary')}>
                Get Racing <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto md:h-14 md:px-8 md:text-lg" onClick={() => navigate('/explore')}>
                Pit Stop
              </Button>
            </div>
          </div>
        </section>

        {tagFilter && (
          <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 bg-racing-red/10 border border-racing-red/20 rounded-lg">
            <span className="text-xs sm:text-sm font-medium">Filtering by tag:</span>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              #{tagFilter}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-8 gap-1.5"
              onClick={() => navigate('/')}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Clear</span>
            </Button>
          </div>
        )}

        <section className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Current Season</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1">2025 F1 Grand Prix Schedule</p>
            </div>
            <Button variant="ghost" className="gap-2 self-start sm:self-auto md:h-12 md:px-6 md:text-base" onClick={() => navigate('/explore')}>
              View All <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {error ? (
            <div className="text-center py-12 text-red-500">Error: {error}</div>
          ) : loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading races...</div>
          ) : currentRaces.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mb-2">Showing {currentRaces.length} races</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {currentRaces.map((race) => {
                  console.log('Rendering race card:', race.meeting_name, race);
                  const posterUrl = getPosterUrl(race.circuit_short_name || race.circuit_key);
                  return (
                    <RaceCard
                      key={race.meeting_key}
                      season={race.year}
                      round={race.round}
                      gpName={race.meeting_name}
                      circuit={race.circuit_short_name}
                      date={race.date_start}
                      country={race.country_code}
                      posterUrl={posterUrl || undefined}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No races available</div>
          )}
        </section>

        <section className="space-y-4 sm:space-y-6 md:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Activity</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1">See what the community is watching</p>
          </div>

          <Tabs defaultValue={auth.currentUser ? "following" : "global"}>
            {auth.currentUser && (
              <TabsList>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="global">Global</TabsTrigger>
              </TabsList>
            )}

            {auth.currentUser && (
              <TabsContent value="following">
                <ActivityFeed feedType="following" limit={20} />
              </TabsContent>
            )}

            <TabsContent value="global">
              <ActivityFeed feedType="global" limit={20} />
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-4 sm:space-y-6 md:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              {tagFilter ? `Races tagged with #${tagFilter}` : 'Recently Logged'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1">
              {tagFilter ? `${popularRaces.length} race${popularRaces.length === 1 ? '' : 's'} found` : 'Latest races logged by the community'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : popularRaces.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {popularRaces.map((race) => (
                <RaceCard
                  key={race.id}
                  id={race.id}
                  season={race.raceYear}
                  round={1}
                  gpName={race.raceName}
                  circuit={race.raceLocation}
                  date={race.dateWatched?.toDate?.()?.toISOString() || ''}
                  rating={race.rating}
                  watched={true}
                  country={race.countryCode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No races logged yet</p>
              <p className="text-sm mt-2">Be the first to log a race!</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-border mt-16 pt-8 pb-12">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="/support" className="text-muted-foreground hover:text-racing-red transition-colors">
                Support
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="/privacy-policy" className="text-muted-foreground hover:text-racing-red transition-colors">
                Privacy Policy
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="/terms-of-service" className="text-muted-foreground hover:text-racing-red transition-colors">
                Terms of Service
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 BoxBoxd. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
