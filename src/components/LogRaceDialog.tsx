import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { createRaceLog, updateRaceLog } from "@/services/raceLogs";
import { createActivity } from "@/services/activity";
import { getUserProfile } from "@/services/auth";
import { getCountryCodeFromName } from "@/services/f1Api";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface LogRaceDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  existingLog?: any; // Existing log data for editing
  editMode?: boolean;
  defaultCircuit?: string; // Pre-fill circuit
  defaultRaceName?: string; // Pre-fill race name
  defaultYear?: number; // Pre-fill year
  defaultCountryCode?: string; // Pre-fill country code
}

export const LogRaceDialog = ({
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  existingLog,
  editMode = false,
  defaultCircuit,
  defaultRaceName,
  defaultYear,
  defaultCountryCode,
}: LogRaceDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [date, setDate] = useState<Date>(new Date());
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [raceName, setRaceName] = useState("");
  const [raceLocation, setRaceLocation] = useState("");
  const [raceYear, setRaceYear] = useState(new Date().getFullYear());
  const [sessionType, setSessionType] = useState<'race' | 'sprint' | 'qualifying' | 'highlights'>('race');
  const [watchMode, setWatchMode] = useState<'live' | 'replay' | 'tvBroadcast' | 'highlights' | 'attendedInPerson'>('live');
  const [review, setReview] = useState("");
  const [companions, setCompanions] = useState<string[]>([]);
  const [companionInput, setCompanionInput] = useState("");
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUsername(profile?.username || profile?.name || user.email?.split('@')[0] || 'user');
        } catch (error) {
          console.error('Error loading profile:', error);
          setUsername(user.email?.split('@')[0] || 'user');
        }
      }
    };
    loadUserProfile();
  }, [user]);

  // Load existing log data when in edit mode
  useEffect(() => {
    if (editMode && existingLog) {
      console.log('[LogRaceDialog] Loading existing log for editing:', existingLog);
      setRaceName(existingLog.raceName || '');
      setRaceLocation(existingLog.raceLocation || '');
      setRaceYear(existingLog.raceYear || new Date().getFullYear());
      setRating(existingLog.rating || 0);
      setReview(existingLog.review || '');
      setTags(existingLog.tags || []);
      setSessionType(existingLog.sessionType || 'race');
      setWatchMode(existingLog.watchMode || 'live');
      setVisibility(existingLog.visibility || 'public');
      setCompanions(existingLog.companions || []);
      setSpoiler(existingLog.hasSpoilers || false);
      setCountryCode(existingLog.countryCode);

      // Handle date conversion
      if (existingLog.dateWatched) {
        const logDate = existingLog.dateWatched instanceof Date
          ? existingLog.dateWatched
          : existingLog.dateWatched.toDate?.() || new Date();
        setDate(logDate);
      }
    }
  }, [editMode, existingLog]);

  // Pre-fill with default values when dialog opens
  useEffect(() => {
    if (open && !editMode) {
      // Find the matching circuit from the circuits array
      const matchingCircuit = allCircuits.find(c =>
        c.location === defaultCircuit || c.name === defaultRaceName
      );

      if (matchingCircuit) {
        setRaceName(matchingCircuit.name);
        setRaceLocation(matchingCircuit.location);
        setCountryCode(getCountryCodeFromName(matchingCircuit.country));
      }

      if (defaultYear) setRaceYear(defaultYear);
    }
  }, [open, defaultRaceName, defaultCircuit, defaultYear, defaultCountryCode, editMode]);

  const suggestedTags = ["rain", "safety-car", "overtake", "pitstop-chaos", "attended", "late-drama", "dnf"];

  const allCircuits = [
    { name: "Monaco Grand Prix", location: "Circuit de Monaco", country: "Monaco" },
    { name: "Italian Grand Prix", location: "Autodromo Nazionale di Monza", country: "Italy" },
    { name: "British Grand Prix", location: "Silverstone Circuit", country: "United Kingdom" },
    { name: "Belgian Grand Prix", location: "Circuit de Spa-Francorchamps", country: "Belgium" },
    { name: "Japanese Grand Prix", location: "Suzuka Circuit", country: "Japan" },
    { name: "Brazilian Grand Prix", location: "Autódromo José Carlos Pace", country: "Brazil" },
    { name: "Australian Grand Prix", location: "Albert Park Circuit", country: "Australia" },
    { name: "Austrian Grand Prix", location: "Red Bull Ring", country: "Austria" },
    { name: "Canadian Grand Prix", location: "Circuit Gilles Villeneuve", country: "Canada" },
    { name: "Singapore Grand Prix", location: "Marina Bay Street Circuit", country: "Singapore" },
    { name: "Abu Dhabi Grand Prix", location: "Yas Marina Circuit", country: "United Arab Emirates" },
    { name: "Bahrain Grand Prix", location: "Bahrain International Circuit", country: "Bahrain" },
    { name: "Saudi Arabian Grand Prix", location: "Jeddah Corniche Circuit", country: "Saudi Arabia" },
    { name: "Miami Grand Prix", location: "Miami International Autodrome", country: "United States" },
    { name: "United States Grand Prix", location: "Circuit of the Americas", country: "United States" },
    { name: "Las Vegas Grand Prix", location: "Las Vegas Street Circuit", country: "United States" },
    { name: "Mexico City Grand Prix", location: "Autódromo Hermanos Rodríguez", country: "Mexico" },
    { name: "Spanish Grand Prix", location: "Circuit de Barcelona-Catalunya", country: "Spain" },
    { name: "Hungarian Grand Prix", location: "Hungaroring", country: "Hungary" },
    { name: "Dutch Grand Prix", location: "Circuit Zandvoort", country: "Netherlands" },
    { name: "Azerbaijan Grand Prix", location: "Baku City Circuit", country: "Azerbaijan" },
    { name: "French Grand Prix", location: "Circuit Paul Ricard", country: "France" },
    { name: "Portuguese Grand Prix", location: "Algarve International Circuit", country: "Portugal" },
    { name: "Turkish Grand Prix", location: "Istanbul Park", country: "Turkey" },
  ];

  // Sort circuits with default circuit at the top
  const circuits = useMemo(() => {
    const sorted = [...allCircuits].sort((a, b) => a.name.localeCompare(b.name));
    if (defaultCircuit || defaultRaceName) {
      const defaultIndex = sorted.findIndex(c =>
        c.location === defaultCircuit || c.name === defaultRaceName
      );
      if (defaultIndex > -1) {
        const [defaultCircuitItem] = sorted.splice(defaultIndex, 1);
        return [defaultCircuitItem, ...sorted];
      }
    }
    return sorted;
  }, [defaultCircuit, defaultRaceName]);

  const addCompanion = (name: string) => {
    if (name && companions.length < 2 && !companions.includes(name)) {
      setCompanions([...companions, name]);
      setCompanionInput("");
    } else if (companions.length >= 2) {
      toast({
        title: "Maximum reached",
        description: "You can only tag up to 2 people",
        variant: "destructive"
      });
    }
  };

  const removeCompanion = (name: string) => {
    setCompanions(companions.filter(c => c !== name));
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!user || !raceName || !raceLocation) {
      toast({
        title: "Missing fields",
        description: "Please fill in race name and location",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[LogRaceDialog] Submitting race log:', {
        editMode,
        existingLogId: existingLog?.id,
        raceName,
        raceYear,
        dateWatched: date,
        rating,
        sessionType,
        watchMode,
      });

      const logData = {
        userId: user.uid,
        username: username,
        raceYear,
        raceName,
        raceLocation,
        countryCode,
        dateWatched: date,
        sessionType,
        watchMode,
        rating,
        review,
        tags,
        companions,
        mediaUrls: [],
        spoilerWarning: spoiler,
        visibility,
      };

      let logId: string;

      if (editMode && existingLog?.id) {
        // Update existing log
        await updateRaceLog(existingLog.id, logData);
        logId = existingLog.id;
        console.log('[LogRaceDialog] Race log updated successfully:', logId);
        toast({ title: "Race log updated successfully!" });
      } else {
        // Create new log
        logId = await createRaceLog(logData);
        console.log('[LogRaceDialog] Race log created successfully with ID:', logId);
        toast({ title: "Race logged successfully!" });

        // Only create activity for new public logs
        if (visibility === 'public') {
          console.log('[LogRaceDialog] Creating activity for public log');
          await createActivity({
            type: review && review.length > 0 ? 'review' : 'log',
            targetId: logId,
            targetType: 'raceLog',
            content: review && review.length > 0 ? review.substring(0, 100) : `${raceName} - ${raceYear}`,
          });
        }
      }

      setOpen(false);
      onSuccess?.();

      // Reset form
      setRaceName("");
      setRaceLocation("");
      setCountryCode(undefined);
      setRating(0);
      setReview("");
      setTags([]);
      setCompanions([]);
      setCompanionInput("");
    } catch (error: any) {
      console.error('[LogRaceDialog] Error saving race log:', error);
      toast({
        title: "Error",
        description: error.message,
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Log Race
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-racing-red/5">
        <DialogHeader className="border-b border-border/50 pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-1 h-8 bg-racing-red rounded-full" />
            {editMode ? 'Edit Race Log' : 'Log a Race'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Race Info Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2">
              <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
              Race Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Select Circuit *</Label>
                <Select
                  value={raceLocation}
                  onValueChange={(value) => {
                    const circuit = circuits.find(c => c.location === value);
                    if (circuit) {
                      setRaceLocation(circuit.location);
                      setRaceName(circuit.name);
                      setCountryCode(getCountryCodeFromName(circuit.country));
                    }
                  }}
                >
                  <SelectTrigger className="border-border/50 hover:border-racing-red">
                    <SelectValue placeholder="Choose a circuit..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {circuits.map((circuit) => (
                      <SelectItem key={circuit.location} value={circuit.location}>
                        <div className="flex flex-col">
                          <span className="font-medium">{circuit.name}</span>
                          <span className="text-xs text-muted-foreground">{circuit.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {raceName && (
                <div className="bg-muted/50 rounded-md p-3 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="text-2xl">🏁</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{raceName}</p>
                      <p className="text-xs text-muted-foreground">{raceLocation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Year *</Label>
              <Select
                value={raceYear.toString()}
                onValueChange={(value) => setRaceYear(parseInt(value))}
              >
                <SelectTrigger className="border-border/50 hover:border-racing-red max-w-xs">
                  <SelectValue placeholder="Select year..." />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

                    // Put default year at the top if it exists and is different from current year
                    if (defaultYear && defaultYear !== currentYear && !years.includes(defaultYear)) {
                      years.unshift(defaultYear);
                    } else if (defaultYear && defaultYear !== years[0]) {
                      const index = years.indexOf(defaultYear);
                      if (index > -1) {
                        years.splice(index, 1);
                        years.unshift(defaultYear);
                      }
                    }

                    return years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Viewing Details Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2">
              <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
              Viewing Details
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date Watched *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-border/50 hover:border-racing-red",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Session</Label>
                <Select value={sessionType} onValueChange={(v: any) => setSessionType(v)}>
                  <SelectTrigger className="border-border/50 hover:border-racing-red">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="race">🏁 Race</SelectItem>
                    <SelectItem value="sprint">⚡ Sprint</SelectItem>
                    <SelectItem value="qualifying">🏎️ Qualifying</SelectItem>
                    <SelectItem value="highlights">📺 Highlights</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Watch Mode</Label>
                <Select value={watchMode} onValueChange={(v: any) => setWatchMode(v)}>
                  <SelectTrigger className="border-border/50 hover:border-racing-red">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">🔴 Live</SelectItem>
                    <SelectItem value="replay">▶️ Replay</SelectItem>
                    <SelectItem value="tvBroadcast">📡 TV Broadcast</SelectItem>
                    <SelectItem value="highlights">✨ Highlights</SelectItem>
                    <SelectItem value="attendedInPerson">🎟️ Attended in Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2">
              <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
              Your Rating
            </h3>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          {/* Review Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2">
              <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
              Review (Optional)
            </h3>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this race... What made it memorable?"
              className="min-h-[120px] border-border/50 focus:border-racing-red resize-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={spoiler}
                onCheckedChange={setSpoiler}
                id="spoiler"
              />
              <Label htmlFor="spoiler" className="text-sm font-normal text-muted-foreground cursor-pointer">
                ⚠️ Contains spoilers
              </Label>
            </div>
          </div>

          {/* Tags & Social Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2">
                <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 hover:bg-racing-red hover:text-white transition-colors">
                    #{tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  className="border-border/50 focus:border-racing-red"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(tagInput)}
                  className="hover:bg-racing-red hover:text-white"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground w-full mb-1">Quick tags:</p>
                {suggestedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-racing-red hover:text-white hover:border-racing-red transition-colors"
                    onClick={() => addTag(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
                  Watched With
                </h3>
                <p className="text-xs text-muted-foreground">Tag up to 2 people</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {companions.map(companion => (
                  <Badge key={companion} variant="secondary" className="gap-1 hover:bg-racing-red hover:text-white transition-colors">
                    @{companion}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeCompanion(companion)}
                    />
                  </Badge>
                ))}
              </div>
              {companions.length < 2 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Username"
                    value={companionInput}
                    onChange={(e) => setCompanionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompanion(companionInput);
                      }
                    }}
                    className="border-border/50 focus:border-racing-red"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addCompanion(companionInput)}
                    disabled={!companionInput.trim()}
                    className="hover:bg-racing-red hover:text-white"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Visibility Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-racing-red flex items-center gap-2">
              <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
              Privacy
            </h3>
            <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <SelectTrigger className="border-border/50 hover:border-racing-red">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌍 Public - Everyone can see</SelectItem>
                <SelectItem value="friends">👥 Friends Only</SelectItem>
                <SelectItem value="private">🔒 Private - Only you</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-racing-red hover:bg-racing-red/90 text-white min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              editMode ? '💾 Update Log' : '🏁 Save Log'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
