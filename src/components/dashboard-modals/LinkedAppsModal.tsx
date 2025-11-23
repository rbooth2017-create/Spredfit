import { memo, useState } from 'react';
import { X, Link, Check, Smartphone, Info } from 'lucide-react';
import { toast } from 'sonner';

interface LinkedAppsModalProps {
  onClose: () => void;
}

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
}

function LinkedAppsModalComponent({ onClose }: LinkedAppsModalProps) {
  const [apps, setApps] = useState<App[]>([
    {
      id: 'googlefit',
      name: 'Google Fit',
      description: 'Auto-sync your Android health data',
      icon: '🏃',
      connected: false,
    },
    {
      id: 'applehealth',
      name: 'Apple Health',
      description: 'Auto-sync your iPhone health data',
      icon: '❤️',
      connected: false,
    },
  ]);

  const [showInstructions, setShowInstructions] = useState(false);

  const handleConnect = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    setApps(prevApps =>
      prevApps.map(a =>
        a.id === appId ? { ...a, connected: !a.connected } : a
      )
    );

    if (!app.connected) {
      toast.success(`Connected to ${app.name}!`, {
        description: 'Your workouts will sync automatically',
      });
    } else {
      toast.info(`Disconnected from ${app.name}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Linked Apps</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* App Cards */}
          <div className="space-y-4 mb-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{app.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                        {app.name}
                        {app.connected && (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                      </h3>
                      <p className="text-white/60 text-sm">{app.description}</p>
                      {!app.connected && (
                        <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          Automatic sync available
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnect(app.id)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      app.connected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                  >
                    {app.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions Button */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">How to Connect</span>
            </div>
            <span className="text-blue-400 text-sm">
              {showInstructions ? 'Hide' : 'Show'}
            </span>
          </button>

          {/* Instructions Panel */}
          {showInstructions && (
            <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-lg space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  🏃 Google Fit (Android)
                </h4>
                <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                  <li>Tap "Connect" on Google Fit above</li>
                  <li>Grant permission when prompted by your device</li>
                  <li>Connect your other apps (Garmin, Strava, etc.) to Google Fit</li>
                  <li>SPREDfit will automatically import your workouts and health stats! 🎉</li>
                </ol>
                <p className="text-white/50 text-xs mt-3">
                  💡 <strong>Tip:</strong> In Google Fit, go to Profile → Settings → Connected apps 
                  to link Garmin, Strava, and other fitness devices.
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  ❤️ Apple Health (iPhone)
                </h4>
                <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                  <li>Tap "Connect" on Apple Health above</li>
                  <li>Grant permission when prompted by iOS</li>
                  <li>Connect your other apps (Garmin, Strava, etc.) to Apple Health</li>
                  <li>SPREDfit will automatically import your workouts and health stats! 🎉</li>
                </ol>
                <p className="text-white/50 text-xs mt-3">
                  💡 <strong>Tip:</strong> In Apple Health, go to Sharing → Apps to manage which 
                  fitness apps share data with Health.
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-white font-semibold mb-3">📱 Already installed SPREDfit?</h4>
                <p className="text-white/70 text-sm">
                  Great! Just tap "Connect" above to link your health data. Once connected, 
                  all your workouts from Garmin, Strava, and other connected devices will 
                  automatically sync to SPREDfit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const LinkedAppsModal = memo(LinkedAppsModalComponent);