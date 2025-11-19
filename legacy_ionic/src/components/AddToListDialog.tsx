import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getUserLists, addRaceToList, RaceListItem } from "@/services/lists";
import { useToast } from "@/hooks/use-toast";
import { Plus, List as ListIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AddToListDialogProps {
  trigger?: React.ReactNode;
  raceYear: number;
  raceName: string;
  raceLocation: string;
  countryCode?: string;
  onSuccess?: () => void;
}

export const AddToListDialog = ({ trigger, raceYear, raceName, raceLocation, countryCode, onSuccess }: AddToListDialogProps) => {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadUserLists();
    }
  }, [open, user]);

  const loadUserLists = async () => {
    if (!user) return;

    setLoadingLists(true);
    try {
      const userLists = await getUserLists(user.uid);
      console.log('[AddToListDialog] Loaded user lists:', userLists);
      setLists(userLists);
    } catch (error) {
      console.error('[AddToListDialog] Error loading lists:', error);
      toast({
        title: "Error",
        description: "Failed to load your lists",
        variant: "destructive"
      });
    } finally {
      setLoadingLists(false);
    }
  };

  const handleAddToList = async (listId: string, listTitle: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add races to lists",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const raceItem: RaceListItem = {
        raceYear,
        raceName,
        raceLocation,
        countryCode,
        order: 0,
        note: ''
      };

      await addRaceToList(listId, raceItem);

      toast({
        title: "Added to list!",
        description: `${raceName} added to "${listTitle}"`
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('[AddToListDialog] Error adding to list:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add race to list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add to List
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select a list to add this race to:</Label>

            {loadingLists ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading your lists...
              </div>
            ) : lists.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {lists.map((list) => {
                  const alreadyAdded = list.races?.some(
                    (r: RaceListItem) => r.raceYear === raceYear && r.raceName === raceName
                  );

                  return (
                    <Card
                      key={list.id}
                      className={`p-4 hover:ring-2 hover:ring-primary transition-all cursor-pointer ${
                        alreadyAdded ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => !alreadyAdded && !loading && handleAddToList(list.id, list.title)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ListIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{list.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {list.races?.length || 0} races
                          </p>
                        </div>
                        {alreadyAdded && (
                          <span className="text-sm text-muted-foreground">Already added</span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>You don't have any lists yet.</p>
                <p className="text-sm mt-2">Create a list first to add races to it.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
