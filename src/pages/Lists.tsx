import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { CreateListDialog } from "@/components/CreateListDialog";
import { Plus, List, Heart, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { getUserLists } from "@/services/lists";

const Lists = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLists = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userLists = await getUserLists(user.uid);
      setLists(userLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Lists</h1>
            <p className="text-muted-foreground">
              Your curated collections of F1 races
            </p>
          </div>

          <CreateListDialog
            onSuccess={loadLists}
            trigger={
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New List
              </Button>
            }
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : lists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list, idx) => (
              <Card
                key={idx}
                className="p-6 space-y-4 hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                onClick={() => navigate(`/list/${list.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <List className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{list.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {list.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{list.races?.length || 0} races</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {list.likesCount || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {list.commentsCount || 0}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">by {list.username}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={List}
            title="No lists yet"
            description="Create your first list to organize your favorite F1 races"
          />
        )}
      </main>
    </div>
  );
};

export default Lists;
