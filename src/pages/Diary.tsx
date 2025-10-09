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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Diary</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {logs.length} races logged • {calculateTotalHoursWatched(rawLogs).toFixed(1)} hours of F1
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
          <div className="space-y-4">
            {rawLogs.map((log) => {
              const flagUrl = log.countryCode ? getCountryFlag(log.countryCode) : null;
              const dateStr = log.dateWatched instanceof Date
                ? log.dateWatched.toLocaleDateString()
                : new Date(log.dateWatched).toLocaleDateString();

              return (
                <Card
                  key={log.id}
                  className="p-4 hover:border-racing-red transition-colors cursor-pointer group"
                  onClick={() => navigate(`/race/${log.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Flag */}
                    {flagUrl && (
                      <div className="w-20 h-12 sm:w-24 sm:h-14 rounded overflow-hidden border-2 border-border flex-shrink-0">
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-base sm:text-lg">{log.raceName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {log.raceYear} • {log.raceLocation}
                          </p>
                        </div>

                        {/* Rating */}
                        {log.rating && (
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                            <Star className="w-4 h-4 fill-racing-red text-racing-red" />
                            <span className="font-semibold text-sm">{log.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Review */}
                      {log.review && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {log.review}
                        </p>
                      )}

                      {/* Tags */}
                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {log.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                          {log.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{log.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Watched on {dateStr}</p>

                        {/* Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(log.id!);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
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
