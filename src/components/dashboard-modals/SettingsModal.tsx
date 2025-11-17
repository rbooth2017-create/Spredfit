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
                Privacy
              </button>
              <button 
                onClick={() => setSettingsScreen('notifications')}
                className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all text-white text-sm"
              >
                Notifications
              </button>
              <button 
                onClick={() => setSettingsScreen('units')}
                className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all text-white text-sm"
              >
                Units & Preferences
              </button>
              <button 
                onClick={() => setSettingsScreen('connectedApps')}
                className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all text-white text-sm"
              >
                Connected Apps
              </button>
              <button 
                onClick={() => {
                  toast.success('Signed out successfully');
                  closeModal();
                  if (onSignOut) onSignOut();
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

        {/* Privacy Screen */}
        {settingsScreen === 'privacy' && (
          <>
            <div className="mb-4 flex-shrink-0 text-center">
              <p className="text-white text-sm">Privacy</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="flex-1">
                  <p className="text-white text-xs">Private Profile</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Only friends can see your activity</p>
                </div>
                <button
                  onClick={() => setPrivateProfile(!privateProfile)}
                  className={`w-12 h-6 rounded-full transition-all ${privateProfile ? 'bg-white/30' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${privateProfile ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button
                onClick={() => toast.info('Data export will be sent to your email')}
                className="w-full p-3 rounded-full bg-[#2d332d]/60 backdrop-blur-sm border border-white/10 hover:bg-[#2d332d]/80 transition-all text-white text-xs"
              >
                Download My Data
              </button>
              <button
                onClick={() => toast.error('Please contact support to delete your account')}
                className="w-full p-3 rounded-full bg-red-600/40 backdrop-blur-sm border border-red-400/20 hover:bg-red-600/60 transition-all text-white text-xs"
              >
                Delete Account
              </button>
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

        {/* Units & Preferences Screen */}
        {settingsScreen === 'units' && (
          <>
            <div className="mb-4 flex-shrink-0 text-center">
              <p className="text-white text-sm">Units & Preferences</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Distance Unit</label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="km" className="bg-[#2d332d]">Kilometers (km)</option>
                  <option value="miles" className="bg-[#2d332d]">Miles</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 text-[10px] mb-1.5 block">Weight Unit</label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="kg" className="bg-[#2d332d]">Kilograms (kg)</option>
                  <option value="lbs" className="bg-[#2d332d]">Pounds (lbs)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Connected Apps Screen */}
        {settingsScreen === 'connectedApps' && (
          <>
            <div className="mb-4 flex-shrink-0 text-center">
              <p className="text-white text-sm">Connected Apps</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 min-h-0 pr-2">
              <p className="text-white/60 text-[10px] mb-2 text-center">Sync your workouts automatically</p>
              
              {/* Strava */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="flex-1">
                  <p className="text-white text-xs">Strava</p>
                  <p className="text-white/50 text-[10px] mt-0.5">
                    {connectedApps.strava ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConnectedApps((prev: any) => ({ ...prev, strava: !prev.strava }));
                    toast.success(connectedApps.strava ? 'Strava disconnected' : 'Strava connected');
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] transition-all ${
                    connectedApps.strava 
                      ? 'bg-red-600/60 text-white border border-red-400/20' 
                      : 'bg-white/20 text-white border border-white/20 hover:bg-white/30'
                  }`}
                >
                  {connectedApps.strava ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Apple HealthKit */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="flex-1">
                  <p className="text-white text-xs">Apple HealthKit</p>
                  <p className="text-white/50 text-[10px] mt-0.5">
                    {connectedApps.appleHealthKit ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConnectedApps((prev: any) => ({ ...prev, appleHealthKit: !prev.appleHealthKit }));
                    toast.success(connectedApps.appleHealthKit ? 'Apple HealthKit disconnected' : 'Apple HealthKit connected');
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] transition-all ${
                    connectedApps.appleHealthKit 
                      ? 'bg-red-600/60 text-white border border-red-400/20' 
                      : 'bg-white/20 text-white border border-white/20 hover:bg-white/30'
                  }`}
                >
                  {connectedApps.appleHealthKit ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Google Fitness */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="flex-1">
                  <p className="text-white text-xs">Google Fitness</p>
                  <p className="text-white/50 text-[10px] mt-0.5">
                    {connectedApps.googleFitness ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConnectedApps((prev: any) => ({ ...prev, googleFitness: !prev.googleFitness }));
                    toast.success(connectedApps.googleFitness ? 'Google Fitness disconnected' : 'Google Fitness connected');
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] transition-all ${
                    connectedApps.googleFitness 
                      ? 'bg-red-600/60 text-white border border-red-400/20' 
                      : 'bg-white/20 text-white border border-white/20 hover:bg-white/30'
                  }`}
                >
                  {connectedApps.googleFitness ? 'Disconnect' : 'Connect'}
                </button>
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