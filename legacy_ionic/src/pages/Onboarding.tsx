import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDocument, Timestamp } from "@/lib/firestore-native";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const drivers = [
  { id: "verstappen", name: "Max Verstappen", team: "Red Bull Racing" },
  { id: "tsunoda", name: "Yuki Tsunoda", team: "Red Bull Racing" },
  { id: "leclerc", name: "Charles Leclerc", team: "Ferrari" },
  { id: "hamilton", name: "Lewis Hamilton", team: "Ferrari" },
  { id: "russell", name: "George Russell", team: "Mercedes" },
  { id: "antonelli", name: "Kimi Antonelli", team: "Mercedes" },
  { id: "norris", name: "Lando Norris", team: "McLaren" },
  { id: "piastri", name: "Oscar Piastri", team: "McLaren" },
  { id: "alonso", name: "Fernando Alonso", team: "Aston Martin" },
  { id: "stroll", name: "Lance Stroll", team: "Aston Martin" },
  { id: "gasly", name: "Pierre Gasly", team: "Alpine" },
  { id: "colapinto", name: "Franco Colapinto", team: "Alpine" },
  { id: "albon", name: "Alex Albon", team: "Williams" },
  { id: "sainz", name: "Carlos Sainz", team: "Williams" },
  { id: "hadjar", name: "Isack Hadjar", team: "RB" },
  { id: "lawson", name: "Liam Lawson", team: "RB" },
  { id: "bearman", name: "Oliver Bearman", team: "Haas" },
  { id: "ocon", name: "Esteban Ocon", team: "Haas" },
  { id: "hulkenberg", name: "Nico Hülkenberg", team: "Sauber" },
  { id: "bortoleto", name: "Gabriel Bortoleto", team: "Sauber" },
];

const teams = [
  { id: "redbull", name: "Red Bull Racing" },
  { id: "ferrari", name: "Ferrari" },
  { id: "mercedes", name: "Mercedes" },
  { id: "mclaren", name: "McLaren" },
  { id: "astonmartin", name: "Aston Martin" },
  { id: "alpine", name: "Alpine" },
  { id: "williams", name: "Williams" },
  { id: "rb", name: "RB (Racing Bulls)" },
  { id: "haas", name: "Haas" },
  { id: "sauber", name: "Sauber" },
];

const circuits = [
  { id: "melbourne", name: "Albert Park", country: "au" },
  { id: "shanghai", name: "Shanghai", country: "cn" },
  { id: "suzuka", name: "Suzuka", country: "jp" },
  { id: "sakhir", name: "Sakhir", country: "bh" },
  { id: "jeddah", name: "Jeddah", country: "sa" },
  { id: "miami", name: "Miami", country: "us" },
  { id: "imola", name: "Imola", country: "it" },
  { id: "monaco", name: "Monaco", country: "mc" },
  { id: "barcelona", name: "Barcelona", country: "es" },
  { id: "montreal", name: "Montreal", country: "ca" },
  { id: "redbullring", name: "Red Bull Ring", country: "at" },
  { id: "silverstone", name: "Silverstone", country: "gb" },
  { id: "spa", name: "Spa-Francorchamps", country: "be" },
  { id: "hungaroring", name: "Hungaroring", country: "hu" },
  { id: "zandvoort", name: "Zandvoort", country: "nl" },
  { id: "monza", name: "Monza", country: "it" },
  { id: "baku", name: "Baku", country: "az" },
  { id: "singapore", name: "Marina Bay", country: "sg" },
  { id: "austin", name: "Austin", country: "us" },
  { id: "mexico", name: "Mexico City", country: "mx" },
  { id: "interlagos", name: "Interlagos", country: "br" },
  { id: "lasvegas", name: "Las Vegas", country: "us" },
  { id: "losail", name: "Losail", country: "qa" },
  { id: "abudhabi", name: "Yas Marina", country: "ae" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedCircuit, setSelectedCircuit] = useState<string>('');

  const selectDriver = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  const selectTeam = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  const selectCircuit = (circuitId: string) => {
    setSelectedCircuit(circuitId);
  };

  const handleComplete = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to continue', variant: 'destructive' });
      return;
    }

    try {
      console.log('[Onboarding] Completing onboarding for user:', user.uid);

      // Get the actual names instead of IDs
      const favoriteDriverName = drivers.find(d => d.id === selectedDriver)?.name || '';
      const favoriteCircuitName = circuits.find(c => c.id === selectedCircuit)?.name || '';
      const favoriteTeamName = teams.find(t => t.id === selectedTeam)?.name || '';

      console.log('[Onboarding] Saving user profile...');
      await setDocument(`users/${user.uid}`, {
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        description: 'F1 fan',
        favoriteDriver: selectedDriver,
        favoriteTeam: selectedTeam,
        favoriteCircuit: selectedCircuit,
        onboardingCompleted: true,
        createdAt: Timestamp.now(),
      }, true);

      console.log('[Onboarding] Saving user stats...');
      await setDocument(`userStats/${user.uid}`, {
        racesWatched: 0,
        reviewsCount: 0,
        listsCount: 0,
        followersCount: 0,
        followingCount: 0,
        totalHoursWatched: 0,
        favoriteDriver: favoriteDriverName,
        favoriteCircuit: favoriteCircuitName,
        favoriteTeam: favoriteTeamName
      }, true);

      console.log('[Onboarding] ✅ Onboarding completed successfully');
      toast({ title: 'Welcome to BoxBoxd!' });
      navigate('/home');
    } catch (error: any) {
      console.error('[Onboarding] ❌ Error completing onboarding:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-[#0a0a0a] racing-grid flex items-center justify-center p-[2vh] sm:p-[3vh]">
      <div className="max-w-4xl w-full space-y-[2vh] sm:space-y-[3vh]">
        <div className="text-center space-y-3">
          <div className="inline-block px-6 py-2 bg-racing-red/20 border-2 border-racing-red rounded-full mb-2">
            <span className="text-racing-red font-black text-xs tracking-widest">SETUP</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">
            <span className="text-white">BOX</span>
            <span className="text-racing-red">BOXD</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-wider">Personalize your racing experience</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className={`w-20 h-2 rounded ${step >= 1 ? 'bg-racing-red shadow-lg shadow-red-500/50' : 'bg-gray-800'}`} />
          <div className={`w-20 h-2 rounded ${step >= 2 ? 'bg-racing-red shadow-lg shadow-red-500/50' : 'bg-gray-800'}`} />
          <div className={`w-20 h-2 rounded ${step >= 3 ? 'bg-racing-red shadow-lg shadow-red-500/50' : 'bg-gray-800'}`} />
        </div>

        <Card className="p-8 border-2 border-red-900/30 bg-black/40 backdrop-blur relative">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">FAVORITE DRIVER</h2>
                <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Pick your favorite driver</p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-[2vw] sm:gap-[1.5vw]">
                {drivers.map(driver => (
                  <Button
                    key={driver.id}
                    variant={selectedDriver === driver.id ? "default" : "outline"}
                    className={`h-auto py-[1.5vh] flex flex-col items-center justify-center font-black uppercase tracking-wider overflow-hidden min-h-[10vh] ${
                      selectedDriver === driver.id
                        ? 'bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 text-white'
                        : 'border-2 border-red-900/50 bg-black/60 text-white hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => selectDriver(driver.id)}
                  >
                    <span className="font-black text-white text-center leading-tight break-words w-full px-1 text-sm sm:text-base">{driver.name}</span>
                    <span className="text-xs text-gray-400 normal-case font-bold text-center mt-1">{driver.team}</span>
                  </Button>
                ))}
              </div>

              <div className="flex justify-between pt-2 relative z-50">
                <Button
                  type="button"
                  variant="ghost"
                  className="border-2 border-red-900/50 bg-black/60 text-white hover:bg-white/10 font-black uppercase tracking-wider min-h-[44px] px-6 pointer-events-auto"
                  onClick={() => navigate('/login')}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider text-white min-h-[44px] px-6 disabled:opacity-50 pointer-events-auto"
                  onClick={() => setStep(2)}
                  disabled={!selectedDriver}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">FAVORITE TEAM</h2>
                <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Pick your favorite team</p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-[2vw] sm:gap-[1.5vw]">
                {teams.map(team => (
                  <Button
                    key={team.id}
                    variant={selectedTeam === team.id ? "default" : "outline"}
                    className={`h-auto py-[1.5vh] font-black uppercase tracking-wider text-sm sm:text-base min-h-[8vh] ${
                      selectedTeam === team.id
                        ? 'bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 text-white'
                        : 'border-2 border-red-900/50 bg-black/60 text-white hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => selectTeam(team.id)}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between pt-2 relative z-50">
                <Button
                  type="button"
                  variant="ghost"
                  className="border-2 border-red-900/50 bg-black/60 text-white hover:bg-white/10 font-black uppercase tracking-wider min-h-[44px] px-6 pointer-events-auto"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider text-white min-h-[44px] px-6 disabled:opacity-50 pointer-events-auto"
                  onClick={() => setStep(3)}
                  disabled={!selectedTeam}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">FAVORITE CIRCUIT</h2>
                <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Pick your favorite track</p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-[2vw] sm:gap-[1.5vw]">
                {circuits.map(circuit => (
                  <Button
                    key={circuit.id}
                    variant={selectedCircuit === circuit.id ? "default" : "outline"}
                    className={`h-auto py-[1.5vh] flex items-center justify-start gap-2 font-black uppercase tracking-wider text-sm sm:text-base min-h-[7vh] ${
                      selectedCircuit === circuit.id
                        ? 'bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 text-white'
                        : 'border-2 border-red-900/50 bg-black/60 text-white hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => selectCircuit(circuit.id)}
                  >
                    <div className="w-8 h-5 flex-shrink-0 overflow-hidden rounded">
                      <img
                        src={`https://flagcdn.com/w40/${circuit.country}.png`}
                        alt={circuit.country}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white">{circuit.name}</span>
                  </Button>
                ))}
              </div>

              <div className="flex justify-between pt-2 relative z-50">
                <Button
                  variant="ghost"
                  type="button"
                  className="border-2 border-red-900/50 bg-black/60 text-white hover:bg-white/10 font-black uppercase tracking-wider min-h-[44px] px-6 pointer-events-auto"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider text-white min-h-[44px] px-6 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                  onClick={handleComplete}
                  disabled={!selectedCircuit}
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center relative z-10">
          <Button
            type="button"
            variant="link"
            className="text-gray-400 hover:text-racing-red font-bold uppercase tracking-wider pointer-events-auto"
            onClick={() => navigate('/home')}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
