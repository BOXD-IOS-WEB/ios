import { Header } from "@/components/Header";
import { LogRaceDialog } from "@/components/LogRaceDialog";
import { RaceCard } from "@/components/RaceCard";
import { Button } from "@/components/ui/button";
import { Calendar, List, Plus, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserRaceLogs, calculateTotalHoursWatched, deleteRaceLog, RaceLog } from "@/services/raceLogs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  const [view, setView] = useState<"list" | "calendar">("list");
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
                variant={view === "calendar" ? "secondary" : "ghost"}
                onClick={() => setView("calendar")}
              >
                <Calendar className="w-4 h-4" />
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

        {view === "list" ? (
          <div className="space-y-6">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No races logged yet</p>
                <p className="text-sm mt-2">Start logging races to build your diary!</p>
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
          </div>
        ) : (
          <div className="bg-card rounded-lg p-6 text-center text-muted-foreground">
            Calendar view coming soon
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
