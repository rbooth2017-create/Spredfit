import { memo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../utils/auth";
import { Eye, EyeOff } from "lucide-react";
import type { SettingsScreen } from "../../hooks/useDashboardState";

interface SettingsModalProps {
  settingsScreen: SettingsScreen;
  setSettingsScreen: (screen: SettingsScreen) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  privateProfile: boolean;
  setPrivateProfile: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  distanceUnit: string;
  setDistanceUnit: (unit: string) => void;
  weightUnit: string;
  setWeightUnit: (unit: string) => void;
  connectedApps: {
    strava: boolean;
    appleHealthKit: boolean;
    googleFitness: boolean;
  };
  setConnectedApps: (apps: any) => void;
  onClose: () => void;
  onSignOut?: () => void;
}

export function SettingsModal({
  settingsScreen,
  setSettingsScreen,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  privateProfile,
  setPrivateProfile,
  notificationsEnabled,
  setNotificationsEnabled,
  distanceUnit,
  setDistanceUnit,
  weightUnit,
  setWeightUnit,
  connectedApps,
  setConnectedApps,
  onClose,
  onSignOut,
}: SettingsModalProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle password update
  const handlePasswordUpdate = async () => {
    // Validation
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsUpdating(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Go back to main settings
      setSettingsScreen('main');
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-96 h-96 rounded-full bg-transparent border-2 border-white/40 flex items-center justify-center p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col w-full h-full p-6">
        {/* Main Settings Menu */}
        {settingsScreen === 'main' && (
          <>
            <div className="mb-4 flex-shrink-0 text-center">
              <p className="text-white text-sm">Settings</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0">
              <button 
                onClick={() => setSettingsScreen('account')}
                className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all text-white text-sm"
              >
                Change Password
      
              </button>
              <button 
                onClick={() => {
                  console.log('🔴 Sign out clicked');
                  toast.success('Signed out successfully');
                  if (onSignOut) {
                    onSignOut();
                  }
                  if (onClose) {
                    onClose();
                  }
                }}
                className="w-full p-3 rounded-full bg-red-600/60 backdrop-blur-sm border border-red-400/20 hover:bg-red-600/80 transition-all text-white text-sm"
              >
                Sign Out
              </button>
            </div>
          </>
        )}

        {/* Change Password Screen */}
        {settingsScreen === 'account' && (
          <>
            <div className="mb-4 flex-shrink-0 flex items-center justify-between">
              <button
                onClick={() => setSettingsScreen('main')}
                className="text-white/60 hover:text-white text-xs"
              >
                ← Back
              </button>
              <p className="text-white text-sm">Change Password</p>
              <div className="w-12" />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
              {/* Current Password */}
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-3 pr-9 py-2 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-3 pr-9 py-2 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-3 pr-9 py-2 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={isUpdating}
                className="w-full p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isUpdating ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </>
        )}

        {/* Notifications Screen */}
        {settingsScreen === 'notifications' && (
          <>
            <div className="mb-4 flex-shrink-0 flex items-center justify-between">
              <button
                onClick={() => setSettingsScreen('main')}
                className="text-white/60 hover:text-white text-xs"
              >
                ← Back
              </button>
              <p className="text-white text-sm">Notifications</p>
              <div className="w-12" />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="flex-1">
                  <p className="text-white text-xs">Push Notifications</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Get notified about activity</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${notificationsEnabled ? 'bg-white/30' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="space-y-2 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-white/60 text-[10px]">Notify me about:</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-4 h-4 rounded border-white/20 checked:bg-white/40 checked:border-white/40 focus:ring-white/20 focus:ring-offset-0 bg-white/10 accent-white/40"
                    style={{ accentColor: 'rgba(255, 255, 255, 0.4)' }}
                  />
                  <span className="text-white text-xs">League updates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-4 h-4 rounded border-white/20 checked:bg-white/40 checked:border-white/40 focus:ring-white/20 focus:ring-offset-0 bg-white/10 accent-white/40"
                    style={{ accentColor: 'rgba(255, 255, 255, 0.4)' }}
                  />
                  <span className="text-white text-xs">Friend requests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-4 h-4 rounded border-white/20 checked:bg-white/40 checked:border-white/40 focus:ring-white/20 focus:ring-offset-0 bg-white/10 accent-white/40"
                    style={{ accentColor: 'rgba(255, 255, 255, 0.4)' }}
                  />
                  <span className="text-white text-xs">New messages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-white/20 checked:bg-white/40 checked:border-white/40 focus:ring-white/20 focus:ring-offset-0 bg-white/10 accent-white/40"
                    style={{ accentColor: 'rgba(255, 255, 255, 0.4)' }}
                  />
                  <span className="text-white text-xs">Weekly summaries</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(SettingsModal);