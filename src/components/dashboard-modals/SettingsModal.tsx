import { memo } from "react";
import { toast } from "sonner@2.0.3";
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
  closeModal: () => void;
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
  closeModal,
  onSignOut,
}: SettingsModalProps) {
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
                Account Settings
              </button>
              <button 
                onClick={() => setSettingsScreen('privacy')}
                className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all text-white text-sm"
              >
                Notifications
              </button>
              <button 
  onClick={() => {
    console.log('🔴 handleLogout called from SettingsModal');
    toast.success('Signed out successfully');
    if (onSignOut) {
      onSignOut();
    }
    if (closeModal && typeof closeModal === 'function') {
      closeModal();
    }
  }}
  className="w-full p-3 rounded-full bg-red-600/60 backdrop-blur-sm border border-red-400/20 hover:bg-red-600/80 transition-all text-white text-sm"
>
  Sign Out
</button>
            </div>
          </>
        )}

        {/* Account Settings Screen */}
        {settingsScreen === 'account' && (
          <>
            <div className="mb-4 flex-shrink-0 text-center">
              <p className="text-white text-sm">Account Settings</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Old Password</label>
                <input
                  type="password"
                  placeholder="Enter old password"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-white/40"
                />
              </div>
            </div>
          </>
        )}

        {/* Notifications Screen */}
        {settingsScreen === 'notifications' && (
          <>
            <div className="mb-4 flex-shrink-0 text-center">
              <p className="text-white text-sm">Notifications</p>
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

// ✅ Memoize to prevent unnecessary re-renders
export default memo(SettingsModal);