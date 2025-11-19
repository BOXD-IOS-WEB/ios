import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Trash2, Download, Mail, Heart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getDocument, getDocuments, updateDocument, deleteDocument } from "@/lib/firestore-native";
import { reauthenticateUser, updateUserPassword, deleteUserAccount, getCurrentUser } from "@/lib/auth-native";
import { resendVerificationEmail } from "@/services/auth";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [favoriteDriver, setFavoriteDriver] = useState("");
  const [favoriteCircuit, setFavoriteCircuit] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const statsData = await getDocument(`userStats/${user.uid}`);
        if (statsData) {
          setFavoriteDriver(statsData.favoriteDriver || "");
          setFavoriteCircuit(statsData.favoriteCircuit || "");
          setFavoriteTeam(statsData.favoriteTeam || "");
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, [user]);

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate and update password
      await reauthenticateUser(user.email!, currentPassword);
      await updateUserPassword(newPassword);

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !deletePassword) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user
      await reauthenticateUser(user.email!, deletePassword);

      // Delete user data from Firestore
      await deleteDocument(`users/${user.uid}`);
      await deleteDocument(`userStats/${user.uid}`);

      // Delete user's race logs
      const raceLogs = await getDocuments('raceLogs', {
        where: [{ field: 'userId', operator: '==', value: user.uid }]
      });
      const deleteLogPromises = raceLogs.map((log) =>
        deleteDocument(`raceLogs/${log.id}`)
      );
      await Promise.all(deleteLogPromises);

      // Delete user's lists
      const lists = await getDocuments('lists', {
        where: [{ field: 'userId', operator: '==', value: user.uid }]
      });
      const deleteListsPromises = lists.map((list) =>
        deleteDocument(`lists/${list.id}`)
      );
      await Promise.all(deleteListsPromises);

      // Delete Firebase Auth user
      await deleteUserAccount();

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      toast({
        title: "Verification email sent",
        description: "Check your inbox for the verification link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    toast({
      title: "Export data",
      description: "This feature is coming soon",
    });
  };

  const handleSaveFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateDocument(`userStats/${user.uid}`, {
        favoriteDriver,
        favoriteCircuit,
        favoriteTeam,
      });

      toast({
        title: "Favorites saved",
        description: "Your F1 favorites have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-[#0a0a0a] racing-grid pb-[env(safe-area-inset-bottom,5rem)] lg:pb-[2vh]">
      <Header />

      <main className="container px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">SETTINGS</h1>
          <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider">Manage your account and preferences</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Account Section */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-red-900/40 bg-black/90">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Account</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold">
                Manage your account settings
              </p>
            </div>

            <Separator className="bg-red-900/30" />

            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.email}
                </p>
                {!user?.emailVerified && (
                  <Button
                    variant="link"
                    className="px-0 text-racing-red"
                    onClick={handleResendVerification}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend verification email
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider"
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </Card>

          {/* F1 Favorites Section */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-red-900/40 bg-black/90">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-racing-red fill-racing-red" />
                F1 Favorites
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold">
                Set your favorite driver, circuit, and team
              </p>
            </div>

            <Separator className="bg-red-900/30" />

            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favoriteDriver">Favorite Driver</Label>
                <Input
                  id="favoriteDriver"
                  value={favoriteDriver}
                  onChange={(e) => setFavoriteDriver(e.target.value)}
                  placeholder="e.g., Pierre Gasly"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteCircuit">Favorite Circuit</Label>
                <Input
                  id="favoriteCircuit"
                  value={favoriteCircuit}
                  onChange={(e) => setFavoriteCircuit(e.target.value)}
                  placeholder="e.g., Marina Bay"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteTeam">Favorite Team</Label>
                <Input
                  id="favoriteTeam"
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  placeholder="e.g., Alpine"
                  maxLength={50}
                />
              </div>

              <Button
                onClick={handleSaveFavorites}
                disabled={loading}
                className="w-full sm:w-auto bg-racing-red hover:bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30 font-black uppercase tracking-wider"
              >
                {loading ? "Saving..." : "Save Favorites"}
              </Button>
            </div>
          </Card>

          {/* Privacy Section */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-red-900/40 bg-black/90">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Privacy</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold">
                Control who can see your content
              </p>
            </div>

            <Separator className="bg-red-900/30" />

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-semibold text-white">Private Account</Label>
                  <p className="text-xs text-gray-400">
                    Only approved followers can see your content
                  </p>
                </div>
                <Switch className="mt-1 flex-shrink-0" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-semibold text-white">Show Activity Status</Label>
                  <p className="text-xs text-gray-400">
                    Let others see when you're active
                  </p>
                </div>
                <Switch defaultChecked className="mt-1 flex-shrink-0" />
              </div>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-red-900/40 bg-black/90">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Notifications</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold">
                Choose what you want to be notified about
              </p>
            </div>

            <Separator className="bg-red-900/30" />

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-semibold text-white">Email Notifications</Label>
                  <p className="text-xs text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="mt-1 flex-shrink-0"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-semibold text-white">Push Notifications</Label>
                  <p className="text-xs text-gray-400">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  className="mt-1 flex-shrink-0"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-semibold text-white">Likes & Comments</Label>
                  <p className="text-xs text-gray-400">
                    When someone likes or comments on your content
                  </p>
                </div>
                <Switch defaultChecked className="mt-1 flex-shrink-0" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-semibold text-white">New Followers</Label>
                  <p className="text-xs text-gray-400">
                    When someone follows you
                  </p>
                </div>
                <Switch defaultChecked className="mt-1 flex-shrink-0" />
              </div>
            </div>
          </Card>

          {/* Data & Privacy Section */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-red-900/40 bg-black/90">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">Data & Privacy</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold">
                Manage your data and privacy settings
              </p>
            </div>

            <Separator className="bg-red-900/30" />

            <div className="space-y-3 sm:space-y-4">
              <div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full sm:w-auto border-2 border-racing-red bg-black/60 text-white hover:bg-racing-red/20 font-black uppercase tracking-wider"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Download a copy of your data
                </p>
              </div>

              <div>
                <p className="text-sm mb-2">
                  <a href="/privacy-policy" className="text-racing-red hover:underline">
                    Privacy Policy
                  </a>
                  {" • "}
                  <a href="/terms-of-service" className="text-racing-red hover:underline">
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-red-600/60 bg-black/90">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-red-600 uppercase tracking-wider">Danger Zone</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold">
                Irreversible actions
              </p>
            </div>

            <Separator className="bg-red-600/40" />

            <div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2 w-full sm:w-auto font-black uppercase tracking-wider">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl font-black">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                      <p>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </p>
                      <p className="font-semibold">All of the following will be deleted:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your profile and account information</li>
                        <li>All your race logs and reviews</li>
                        <li>All your lists and collections</li>
                        <li>All your likes and comments</li>
                        <li>Your followers and following connections</li>
                      </ul>
                      <div className="space-y-2 pt-4">
                        <Label>Enter your password to confirm</Label>
                        <Input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={loading || !deletePassword}
                    >
                      {loading ? "Deleting..." : "Yes, delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground mt-2">
                Once you delete your account, there is no going back
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
