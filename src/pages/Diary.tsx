import { Header } from "@/components/Header";
import { LogRaceDialog } from "@/components/LogRaceDialog";
import { RaceCard } from "@/components/RaceCard";
import { Button } from "@/components/ui/button";
import { Calendar, List, Plus, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserRaceLogs, calculateTotalHoursWatched, deleteRaceLog } from "@/services/raceLogs";
import { useToast } from "@/hooks/use-toast";
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
  const [view, setView] = useState<"list" | "calendar">("list");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const loadLogs = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userLogs = await getUserRaceLogs(user.uid);
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
    } catch (error) {
      console.error('Error loading logs:', error);
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
      await deleteRaceLog(logToDelete);
      toast({ title: 'Race log deleted' });
      loadLogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Diary</h1>
            <p className="text-muted-foreground">
              {logs.length} races logged • {calculateTotalHoursWatched(logs as any).toFixed(1)} hours of F1
            </p>
          </div>
          
          <div className="flex gap-2">
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
                  Log Race
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
