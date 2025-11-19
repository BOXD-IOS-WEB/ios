import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/ActivityFeed";

const Lists = () => {
  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-[#0a0a0a] racing-grid pb-[env(safe-area-inset-bottom,4rem)] lg:pb-0">
      <Header />

      <main className="container px-[4vw] py-[2vh] sm:py-[3vh] max-w-full">
        <div className="mb-4 sm:mb-6 pb-3 border-b-2 border-red-900/50">
          <div className="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm border-2 border-racing-red rounded-full mb-2">
            <span className="text-racing-red font-black text-[10px] sm:text-xs tracking-widest drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]">GLOBAL FEED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">COMMUNITY ACTIVITY</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            See what the F1 community is watching
          </p>
        </div>

        <ActivityFeed feedType="global" limit={50} />
      </main>
    </div>
  );
};

export default Lists;
