import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogRaceDialog } from "@/components/LogRaceDialog";
import { Search, Plus, User, Bell, LogOut, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationsCount } from "@/services/notifications";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        getUserNotifications(user.uid),
        getUnreadNotificationsCount(user.uid)
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
    setNotificationsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.uid);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const loadUserPhoto = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserPhotoURL(userData.photoURL || user.photoURL || null);
        } else {
          setUserPhotoURL(user.photoURL || null);
        }
      } catch (error) {
        console.error('Error loading user photo:', error);
        setUserPhotoURL(user.photoURL || null);
      }
    };
    loadUserPhoto();
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 md:h-20 items-center px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-1">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <a
                  href="/"
                  className="text-lg font-medium hover:text-racing-red transition-colors touch-manipulation py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchEnd={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/explore"
                  className="text-lg font-medium hover:text-racing-red transition-colors touch-manipulation py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchEnd={() => setMobileMenuOpen(false)}
                >
                  Explore
                </a>
                <a
                  href="/lists"
                  className="text-lg font-medium hover:text-racing-red transition-colors touch-manipulation py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchEnd={() => setMobileMenuOpen(false)}
                >
                  Activity
                </a>
                <a
                  href="/diary"
                  className="text-lg font-medium hover:text-racing-red transition-colors touch-manipulation py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchEnd={() => setMobileMenuOpen(false)}
                >
                  Diary
                </a>
                <a
                  href="/watchlist"
                  className="text-lg font-medium hover:text-racing-red transition-colors touch-manipulation py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchEnd={() => setMobileMenuOpen(false)}
                >
                  Watchlist
                </a>
                <a
                  href="/profile"
                  className="text-lg font-medium hover:text-racing-red transition-colors touch-manipulation py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchEnd={() => setMobileMenuOpen(false)}
                >
                  Profile
                </a>
              </nav>
            </SheetContent>
          </Sheet>

          <a href="/" className="flex items-center gap-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="text-foreground">BOX</span>
              <span className="text-racing-red">BOXD</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-sm md:text-base font-medium ml-4 md:ml-8">
            <a href="/" className="text-foreground hover:text-racing-red transition-colors">
              Home
            </a>
            <a href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </a>
            <a href="/lists" className="text-muted-foreground hover:text-foreground transition-colors">
              Activity
            </a>
            <a href="/diary" className="text-muted-foreground hover:text-foreground transition-colors">
              Diary
            </a>
            <a href="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors">
              Watchlist
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search races, users..."
              className="pl-9 md:pl-11 w-48 lg:w-64 xl:w-80 bg-muted/50 md:h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => navigate('/search')}
          >
            <Search className="w-5 h-5" />
          </Button>

          <LogRaceDialog
            trigger={
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 md:h-11 md:px-6 md:text-base">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Log</span>
              </Button>
            }
          />

          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative md:w-11 md:h-11">
                <Bell className="w-5 h-5 md:w-6 md:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-racing-red text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex items-start gap-3 p-3 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {notification.actorPhotoURL ? (
                          <img src={notification.actorPhotoURL} alt={notification.actorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-sm font-bold">
                            {notification.actorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.actorName}</span>
                          {' '}
                          <span className="text-muted-foreground">{notification.content}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-racing-red rounded-full flex-shrink-0 mt-2" />
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No notifications yet
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative rounded-full md:w-11 md:h-11 touch-manipulation">
                {userPhotoURL ? (
                  <img
                    src={userPhotoURL}
                    alt="Profile"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-racing-red/20 flex items-center justify-center text-racing-red font-bold md:text-lg">
                    {(user?.displayName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="touch-manipulation">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/profile');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  navigate('/profile');
                }}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                }}
                className="cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                className="cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
