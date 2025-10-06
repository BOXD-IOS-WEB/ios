import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const drivers = [
  { id: "verstappen", name: "Max Verstappen", team: "Red Bull Racing" },
  { id: "hamilton", name: "Lewis Hamilton", team: "Mercedes" },
  { id: "leclerc", name: "Charles Leclerc", team: "Ferrari" },
  { id: "norris", name: "Lando Norris", team: "McLaren" },
  { id: "sainz", name: "Carlos Sainz", team: "Ferrari" },
  { id: "alonso", name: "Fernando Alonso", team: "Aston Martin" },
  { id: "russell", name: "George Russell", team: "Mercedes" },
  { id: "perez", name: "Sergio Perez", team: "Red Bull Racing" },
  { id: "piastri", name: "Oscar Piastri", team: "McLaren" },
  { id: "gasly", name: "Pierre Gasly", team: "Alpine" },
];

const teams = [
  { id: "redbull", name: "Red Bull Racing" },
  { id: "ferrari", name: "Ferrari" },
  { id: "mercedes", name: "Mercedes" },
  { id: "mclaren", name: "McLaren" },
  { id: "astonmartin", name: "Aston Martin" },
  { id: "alpine", name: "Alpine" },
  { id: "williams", name: "Williams" },
  { id: "haas", name: "Haas F1 Team" },
  { id: "rbvcarb", name: "RB" },
  { id: "sauber", name: "Sauber" },
];

const circuits = [
  { id: "silverstone", name: "Silverstone", country: "gb" },
  { id: "monza", name: "Monza", country: "it" },
  { id: "spa", name: "Spa-Francorchamps", country: "be" },
  { id: "suzuka", name: "Suzuka", country: "jp" },
  { id: "monaco", name: "Monaco", country: "mc" },
  { id: "interlagos", name: "Interlagos", country: "br" },
  { id: "austin", name: "Circuit of the Americas", country: "us" },
  { id: "melbourne", name: "Albert Park", country: "au" },
  { id: "zandvoort", name: "Zandvoort", country: "nl" },
  { id: "singapore", name: "Marina Bay", country: "sg" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedCircuits, setSelectedCircuits] = useState<string[]>([]);

  const toggleDriver = (driverId: string) => {
    setSelectedDrivers(prev =>
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const toggleCircuit = (circuitId: string) => {
    setSelectedCircuits(prev =>
      prev.includes(circuitId)
        ? prev.filter(id => id !== circuitId)
        : [...prev, circuitId]
    );
  };

  const handleComplete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        description: 'F1 fan',
        favoriteDrivers: selectedDrivers,
        favoriteTeams: selectedTeams,
        favoriteCircuits: selectedCircuits,
        onboardingCompleted: true,
        createdAt: new Date(),
      }, { merge: true });

      await setDoc(doc(db, 'userStats', user.uid), {
        racesWatched: 0,
        reviewsCount: 0,
        listsCount: 0,
        followersCount: 0,
        followingCount: 0,
        totalHoursWatched: 0,
        favoriteDriver: selectedDrivers[0] || '',
        favoriteCircuit: selectedCircuits[0] || '',
        favoriteTeam: selectedTeams[0] || ''
      }, { merge: true });

      toast({ title: 'Welcome to BoxBoxd!' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            <span className="text-foreground">BOX</span>
            <span className="text-racing-red">BOXD</span>
          </h1>
          <p className="text-muted-foreground">Let's personalize your experience</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className={`w-20 h-1 rounded ${step >= 1 ? 'bg-racing-red' : 'bg-muted'}`} />
          <div className={`w-20 h-1 rounded ${step >= 2 ? 'bg-racing-red' : 'bg-muted'}`} />
          <div className={`w-20 h-1 rounded ${step >= 3 ? 'bg-racing-red' : 'bg-muted'}`} />
        </div>

        <Card className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Choose Your Favorite Drivers</h2>
                <p className="text-muted-foreground">Select the drivers you support</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {drivers.map(driver => (
                  <Button
                    key={driver.id}
                    variant={selectedDrivers.includes(driver.id) ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => toggleDriver(driver.id)}
                  >
                    <span className="font-semibold">{driver.name}</span>
                    <span className="text-xs text-muted-foreground">{driver.team}</span>
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Back
                </Button>
                <Button onClick={() => setStep(2)} disabled={selectedDrivers.length === 0}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Choose Your Favorite Teams</h2>
                <p className="text-muted-foreground">Which teams do you follow?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teams.map(team => (
                  <Button
                    key={team.id}
                    variant={selectedTeams.includes(team.id) ? "default" : "outline"}
                    className="h-auto py-4"
                    onClick={() => toggleTeam(team.id)}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={selectedTeams.length === 0}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Choose Your Favorite Circuits</h2>
                <p className="text-muted-foreground">Which tracks excite you the most?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {circuits.map(circuit => (
                  <Button
                    key={circuit.id}
                    variant={selectedCircuits.includes(circuit.id) ? "default" : "outline"}
                    className="h-auto py-4 flex items-center gap-2"
                    onClick={() => toggleCircuit(circuit.id)}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${circuit.country}.png`}
                      alt={circuit.country}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <span>{circuit.name}</span>
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={selectedCircuits.length === 0}>
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/')}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
