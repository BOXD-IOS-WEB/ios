import { Header } from "@/components/Header";
import { LogRaceDialog } from "@/components/LogRaceDialog";
import { RaceCard } from "@/components/RaceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, List, Plus, Trash2, Edit, Star, Grid3x3 } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserRaceLogs, calculateTotalHoursWatched, deleteRaceLog, RaceLog } from "@/services/raceLogs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCountryFlag } from "@/services/f1Api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Diary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "grid">("list");
  const [logs, setLogs] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<RaceLog[]>([]); // Store raw logs for calculations
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const loadLogs = async () => {
    if (!user) {
      console.log('[Diary] No authenticated user found');
      setLoading(false);
      return;
    }

    try {
      console.log('[Diary] Loading race logs for user:', user.uid);
      const userLogs = await getUserRaceLogs(user.uid);
      console.log('[Diary] Retrieved', userLogs.length, 'race logs');

      // Store raw logs for calculations (including sessionType)
      setRawLogs(userLogs);

      const mappedLogs = userLogs.map(log => {
        // dateWatched is now a Date object after conversion in getUserRaceLogs
        const dateString = log.dateWatched instanceof Date
          ? log.dateWatched.toISOString()
          : new Date(log.dateWatched).toISOString();

        return {
          id: log.id,
          season: log.raceYear,
          round: log.round || 1,
          gpName: log.raceName,
          circuit: log.raceLocation,
          date: dateString,
          rating: log.rating,
          watched: true,
          country: log.countryCode,
        };
      });

      console.log('[Diary] Mapped logs:', mappedLogs);
      setLogs(mappedLogs);
    } catch (error) {
      console.error('[Diary] Error loading logs:', error);
      toast({
        title: 'Error loading diary',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleDeleteClick = (logId: string) => {
    setLogToDelete(logId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;

    try {
      console.log('[Diary] Deleting race log:', logToDelete);
      await deleteRaceLog(logToDelete);
      toast({ title: 'Race log deleted' });
      await loadLogs(); // Reload logs after deletion
    } catch (error: any) {
      console.error('[Diary] Error deleting race log:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b-2 border-border/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-12 bg-foreground rounded-full" />
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My Race Diary</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground pl-5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-foreground rounded-full" />
                {logs.length} races logged
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {calculateTotalHoursWatched(rawLogs).toFixed(1)} hours of F1
              </span>
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={view === "list" ? "secondary" : "ghost"}
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={view === "grid" ? "secondary" : "ghost"}
                onClick={() => setView("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
            
            <LogRaceDialog
              onSuccess={loadLogs}
              trigger={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Log Race</span>
                  <span className="xs:hidden">Log</span>
                </Button>
              }
            />
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No races logged yet</p>
            <p className="text-sm mt-2">Start logging races to build your diary!</p>
          </div>
        ) : view === "list" ? (
          <div className="relative">
            {/* Starting Line with Traffic Lights */}
            <div className="mb-6 sm:mb-8 relative">
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-5 py-4 sm:py-6 border-y-4 border-white/10 bg-gradient-to-r from-background via-foreground/5 to-background">
                {/* F1 Traffic Light Panel - Single at top */}
                <div className="flex gap-1.5 sm:gap-2 md:gap-3 p-3 sm:p-4 md:p-5 bg-gradient-to-b from-zinc-900 to-black rounded-lg sm:rounded-xl border-2 sm:border-3 md:border-4 border-zinc-800 shadow-xl">
                  {/* Row 1 - 2 lights */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                  </div>
                  {/* Row 2 - 2 lights */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                  </div>
                  {/* Row 3 - 2 lights */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                  </div>
                  {/* Row 4 - 2 lights */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                  </div>
                  {/* Row 5 - 2 lights */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-red-700"></div>
                  </div>
                </div>

                {/* Text below lights */}
                <div className="text-center px-2">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">LIGHTS OUT</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{logs.length} races logged</div>
                </div>
              </div>

              {/* Starting line on track */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
            </div>

            {/* Racing Grid Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ top: '120px' }}>
              {/* Track edges */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground/20"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-foreground/20"></div>

              {/* Starting grid pattern - repeating horizontal lines */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 160px,
                    rgba(255, 255, 255, 0.03) 160px,
                    rgba(255, 255, 255, 0.03) 165px,
                    transparent 165px,
                    transparent 170px,
                    rgba(255, 255, 255, 0.03) 170px,
                    rgba(255, 255, 255, 0.03) 175px
                  )
                `
              }}>
              </div>

              {/* Checkered flag pattern on sides */}
              <div className="absolute left-[5%] top-0 bottom-0 w-12 opacity-5">
                <div className="h-full" style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      #000 0,
                      #000 10px,
                      #fff 10px,
                      #fff 20px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      #000 0,
                      #000 10px,
                      #fff 10px,
                      #fff 20px
                    )
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 0'
                }}></div>
              </div>
              <div className="absolute right-[5%] top-0 bottom-0 w-12 opacity-5">
                <div className="h-full" style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      #000 0,
                      #000 10px,
                      #fff 10px,
                      #fff 20px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      #000 0,
                      #000 10px,
                      #fff 10px,
                      #fff 20px
                    )
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 0'
                }}></div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto relative z-10 px-2 sm:px-0">
              {rawLogs.map((log, index) => {
                const flagUrl = log.countryCode ? getCountryFlag(log.countryCode) : null;
                const dateStr = log.dateWatched instanceof Date
                  ? log.dateWatched.toLocaleDateString()
                  : new Date(log.dateWatched).toLocaleDateString();

                console.log('[Diary] Log data:', { id: log.id, driverOfTheDay: log.driverOfTheDay, hasDriver: !!log.driverOfTheDay });

                return (
                  <Card
                    key={log.id}
                    className="p-3 sm:p-4 md:p-5 hover:border-foreground transition-all cursor-pointer group relative overflow-hidden bg-card hover:shadow-lg border border-border"
                    onClick={() => navigate(`/race/${log.id}`)}
                  >
                    {/* Racing stripe */}
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-foreground to-transparent" />

                      <div className="flex gap-2 sm:gap-3 md:gap-4 items-center flex-wrap sm:flex-nowrap">
                        {/* Flag & Title */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          {flagUrl && (
                            <div className="w-14 h-9 sm:w-16 sm:h-10 md:w-20 md:h-12 rounded overflow-hidden border-2 border-border shadow-sm flex-shrink-0">
                              <img
                                src={flagUrl}
                                alt={log.countryCode || log.raceLocation}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base md:text-lg mb-0.5 truncate">{log.raceName}</h3>
                            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                              {log.raceYear} • {log.raceLocation}
                            </p>
                            {log.raceWinner && (
                              <p className="text-[10px] sm:text-xs font-semibold text-foreground mt-0.5">
                                🏆 {log.raceWinner}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        {log.rating && (
                          <div className="flex items-center gap-1 bg-foreground/10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-foreground/20 flex-shrink-0">
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-foreground text-foreground" />
                            <span className="font-bold text-xs sm:text-sm">{log.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Driver of the Day & Review compact */}
                      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                        {log.driverOfTheDay && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Driver of the Day:</span>
                            <span className="font-semibold text-foreground">🏆 {log.driverOfTheDay}</span>
                          </div>
                        )}

                        {log.review && (
                          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 italic">
                            "{log.review}"
                          </p>
                        )}

                        {/* Footer compact */}
                        <div className="flex items-center justify-between pt-1.5 sm:pt-2">
                          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>{dateStr}</span>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(log.id!);
                            }}
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </Button>
                        </div>
                      </div>
                  </Card>
                );
              })}
            </div>

            {/* Finish Line */}
            {rawLogs.length > 0 && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-dashed border-border px-2">
                <div className="text-3xl sm:text-4xl">🏁</div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-base sm:text-lg">Race Complete!</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {rawLogs.length} races • {calculateTotalHoursWatched(rawLogs).toFixed(1)} hours on track
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl">🏁</div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {logs.map((race) => (
              <div key={race.id} className="relative group">
                <RaceCard {...race} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(race.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Race Log?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this race log. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Diary;
