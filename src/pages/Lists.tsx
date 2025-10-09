import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/ActivityFeed";
import { auth } from "@/lib/firebase";

const Lists = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Activity</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            See what the F1 community is watching
          </p>
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
              <ActivityFeed feedType="following" limit={50} />
            </TabsContent>
          )}

          <TabsContent value="global">
            <ActivityFeed feedType="global" limit={50} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Lists;
