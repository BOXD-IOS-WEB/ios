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
import { useAuth } from "@/contexts/AuthContext";

const Lists = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLists = async () => {
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
          <div className="grid md:grid-cols-2 gap-6">
            {lists.map((list, idx) => (
              <Card
                key={idx}
                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/list/${list.id}`)}
              >
                {/* Header with gradient background */}
                <div className="relative bg-gradient-to-br from-racing-red/10 via-background to-background p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-2xl mb-2 group-hover:text-racing-red transition-colors">
                        {list.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {list.description}
                      </p>

                      {/* Author info */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {list.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium">{list.username}</span>
                      </div>
                    </div>

                    <div className="w-16 h-16 bg-gradient-to-br from-racing-red/20 to-racing-red/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <List className="w-8 h-8 text-racing-red" />
                    </div>
                  </div>
                </div>

                {/* Stats section */}
                <div className="px-6 py-4 bg-muted/30 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
                          <span className="font-bold text-lg">{list.races?.length || 0}</span>
                        </div>
                        <span className="text-muted-foreground">races</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground hover:text-racing-red transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">{list.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{list.commentsCount || 0}</span>
                      </div>
                    </div>

                    {/* Tags preview */}
                    {list.tags && list.tags.length > 0 && (
                      <div className="flex gap-1">
                        {list.tags.slice(0, 2).map((tag: string, tagIdx: number) => (
                          <Badge key={tagIdx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {list.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{list.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
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
