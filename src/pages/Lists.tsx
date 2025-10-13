import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/ActivityFeed";
import { auth } from "@/lib/firebase";

const Lists = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] racing-grid pb-20 lg:pb-0">
      <Header />

      <main className="container px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        <div className="mb-6 sm:mb-8 pb-4 border-b-2 border-red-900/50">
          <div className="inline-block px-4 py-1 bg-black/60 backdrop-blur-sm border-2 border-racing-red rounded-full mb-2">
            <span className="text-racing-red font-black text-xs tracking-widest drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]">GLOBAL FEED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">COMMUNITY ACTIVITY</h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1 font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            See what the F1 community is watching
          </p>
        </div>

        <ActivityFeed feedType="global" limit={50} />
      </main>
    </div>
  );
};

export default Lists;
