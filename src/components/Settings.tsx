import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  User,
  Lock,
  Globe,
  Shield,
  Camera,
  LogOut,
  AlertTriangle,
  Bell,
  Moon,
  Eye,
  EyeOff,
  ChevronRight,
  Download,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { FloatingContent } from "./FloatingContent";
import { useAuth } from "../utils/auth";
import { useApp } from "../utils/AppContext";
import { usePWAInstall } from "./PWAInstall";

interface SettingsProps {
  onBack: () => void;
  onUploadPhoto: () => void;
  onLogout: () => void;
}

type SettingsSection = "account" | "security" | "preferences" | "privacy" | null;

export function Settings({ onBack, onUploadPhoto, onLogout }: SettingsProps) {
  const { signOut } = useAuth();
  const { appSettings, setAppSettings } = useApp();
  const { canInstall, platform, triggerInstall, isAndroidWithPrompt, isIOS } = usePWAInstall();
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);
  const [units, setUnits] = useState(appSettings.units);
  const [notifications, setNotifications] = useState(appSettings.notifications);
  const [privateProfile, setPrivateProfile] = useState(appSettings.privateProfile);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex.rivera@email.com");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPWADialog, setShowPWADialog] = useState(false);

  const handleSaveAccount = () => {
    toast.success("Account information updated");
    setActiveSection(null);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActiveSection(null);
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);
    toast.success("Account deletion request submitted");
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  const handleInstallApp = async () => {
    if (isAndroidWithPrompt) {
      const installed = await triggerInstall();
      if (installed) {
        toast.success("App installed successfully!");
      } else {
        toast.error("Installation cancelled");
      }
    } else if (isIOS) {
      // Show iOS instructions
      setShowPWADialog(true);
    }
  };

  useEffect(() => {
    setAppSettings({
      units: units,
      notifications: notifications,
      privateProfile: privateProfile,
    });
  }, [units, notifications, privateProfile]);

  return (
    <FloatingContent onBack={onBack} backLabel="Back">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="bg-[#eef0ed] rounded-full px-6 py-4 mb-6">
          <div>
            <p className="text-[10px] text-[#2d332d] mb-0.5">App Configuration</p>
            <h1 className="text-xl text-[#2d332d]">Settings</h1>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-[#eef0ed] rounded-3xl p-5 mb-4 border border-[#2d332d]/10">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-2 border-[#2d332d]/10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#2d332d] text-[#9ca895] text-xl">AR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-[#2d332d]">{name}</h3>
              <p className="text-sm text-[#2d332d]/60">{email}</p>
            </div>
            <Button
              onClick={onUploadPhoto}
              variant="ghost"
              size="icon"
              className="text-[#2d332d]/60 hover:text-[#2d332d] hover:bg-[#9ca895] rounded-full"
            >
              <Camera className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="space-y-3 mb-32">
          {/* Account */}
          <div
            onClick={() => setActiveSection("account")}
            className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10 cursor-pointer hover:bg-[#9ca895]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                <User className="w-5 h-5 text-[#9ca895]" />
              </div>
              <div className="flex-1">
                <p className="text-[#2d332d]">Account</p>
                <p className="text-xs text-[#2d332d]/60">Name, email, username</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2d332d]/40" />
            </div>
          </div>

          {/* Security */}
          <div
            onClick={() => setActiveSection("security")}
            className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10 cursor-pointer hover:bg-[#9ca895]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#9ca895]" />
              </div>
              <div className="flex-1">
                <p className="text-[#2d332d]">Security</p>
                <p className="text-xs text-[#2d332d]/60">Password, biometrics</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2d332d]/40" />
            </div>
          </div>

          {/* Preferences */}
          <div
            onClick={() => setActiveSection("preferences")}
            className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10 cursor-pointer hover:bg-[#9ca895]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#9ca895]" />
              </div>
              <div className="flex-1">
                <p className="text-[#2d332d]">Preferences</p>
                <p className="text-xs text-[#2d332d]/60">Units, notifications</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2d332d]/40" />
            </div>
          </div>

          {/* Privacy */}
          <div
            onClick={() => setActiveSection("privacy")}
            className="bg-[#eef0ed] rounded-3xl p-4 border border-[#2d332d]/10 cursor-pointer hover:bg-[#9ca895]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2d332d] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#9ca895]" />
              </div>
              <div className="flex-1">
                <p className="text-[#2d332d]">Privacy</p>
                <p className="text-xs text-[#2d332d]/60">Profile visibility</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2d332d]/40" />
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-3xl gap-3"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>

          {/* Delete Account */}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            className="w-full h-12 border-red-600/30 text-red-600 hover:bg-red-50 rounded-3xl"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Delete Account
          </Button>

          {/* Install App */}
          {canInstall && (
            <Button
              onClick={handleInstallApp}
              variant="outline"
              className="w-full h-12 border-[#2d332d]/30 text-[#2d332d] hover:bg-[#9ca895] rounded-3xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          )}
        </div>
      </div>

      {/* Account Dialog */}
      <Dialog open={activeSection === "account"} onOpenChange={(open) => !open && setActiveSection(null)}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d]">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">Account Information</DialogTitle>
            <DialogDescription className="text-[#2d332d]/70">Update your account details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[#2d332d]">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d]"
              />
            </div>
            <div>
              <Label className="text-[#2d332d]">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d]"
              />
            </div>
            <Button
              onClick={handleSaveAccount}
              className="w-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={activeSection === "security"} onOpenChange={(open) => !open && setActiveSection(null)}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d]">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">Security Settings</DialogTitle>
            <DialogDescription className="text-[#2d332d]/70">Change your password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[#2d332d]">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-[#2d332d]">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-[#2d332d]">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d]"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              className="w-full bg-[#2d332d] hover:bg-[#2d332d]/90 text-[#9ca895] rounded-full"
            >
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog open={activeSection === "preferences"} onOpenChange={(open) => !open && setActiveSection(null)}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d]">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[#2d332d]">Units</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger className="bg-[#eef0ed] border-[#2d332d]/10 text-[#2d332d]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#eef0ed]">
                  <SelectItem value="metric">Metric (km, kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (mi, lb)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#2d332d]">Notifications</Label>
                <p className="text-xs text-[#2d332d]/60">Workout reminders & updates</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={activeSection === "privacy"} onOpenChange={(open) => !open && setActiveSection(null)}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d]">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">Privacy Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#2d332d]">Private Profile</Label>
                <p className="text-xs text-[#2d332d]/60">Only approved followers can see your activity</p>
              </div>
              <Switch checked={privateProfile} onCheckedChange={setPrivateProfile} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#9ca895] border-[#2d332d]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#2d332d]">Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#2d332d]/70">
              This action cannot be undone. All your data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#eef0ed] text-[#2d332d] rounded-full">Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              Delete Account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PWA Install Dialog */}
      <Dialog open={showPWADialog} onOpenChange={setShowPWADialog}>
        <DialogContent className="bg-[#9ca895] border-[#2d332d]/20 text-[#2d332d]">
          <DialogHeader>
            <DialogTitle className="text-[#2d332d]">Install App</DialogTitle>
            <DialogDescription className="text-[#2d332d]/70">Follow these steps to install the app on your iOS device:</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[#2d332d]">Step 1</Label>
              <p className="text-sm text-[#2d332d]/60">Tap the "Share" button at the bottom of the screen.</p>
            </div>
            <div>
              <Label className="text-[#2d332d]">Step 2</Label>
              <p className="text-sm text-[#2d332d]/60">Tap "Add to Home Screen".</p>
            </div>
            <div>
              <Label className="text-[#2d332d]">Step 3</Label>
              <p className="text-sm text-[#2d332d]/60">Tap "Add" to confirm.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FloatingContent>
  );
}