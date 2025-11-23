import { memo, useState } from 'react';
import { X, Link, Check, Info, Upload, ExternalLink, Clock } from 'lucide-react';
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
      description: 'Import your Android workouts',
      icon: '🏃',
      connected: false,
    },
    {
      id: 'applehealth',
      name: 'Apple Health',
      description: 'Import your iPhone workouts',
      icon: '❤️',
      connected: false,
    },
  ]);

  const [showInstructions, setShowInstructions] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleFileImport = async (appId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const app = apps.find(a => a.id === appId);
    if (!app) return;

    setImporting(true);

    try {
      const text = await file.text();

      if (appId === 'googlefit') {
        const data = JSON.parse(text);
        console.log('📊 Google Fit data:', data);
        toast.success('Google Fit Data Imported!');
      } else if (appId === 'applehealth') {
        console.log('📊 Apple Health data length:', text.length);
        toast.success('Apple Health Data Imported!');
      }

      setApps(prevApps =>
        prevApps.map(a =>
          a.id === appId ? { ...a, connected: true } : a
        )
      );
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import Failed - Check file format');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleConnect = (appId: string) => {
    const fileInput = document.getElementById(`file-input-${appId}`) as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Linked Apps</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* App Cards */}
          <div className="space-y-3 mb-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{app.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      {app.name}
                      {app.connected && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                    </h3>
                    <p className="text-white/60 text-sm">{app.description}</p>
                  </div>
                  <button
                    onClick={() => handleConnect(app.id)}
                    disabled={importing}
                    className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      app.connected
                        ? 'bg-green-500/20 text-green-400'
                        : importing
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                  >
                    {importing ? 'Importing...' : app.connected ? 'Connected' : 'Import'}
                  </button>
                </div>
                <input
                  id={`file-input-${app.id}`}
                  type="file"
                  accept={app.id === 'googlefit' ? '.json' : '.xml,.zip'}
                  className="hidden"
                  onChange={(e) => handleFileImport(app.id, e)}
                />
              </div>
            ))}
          </div>

          {/* Instructions */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">How to Export Data</span>
            </div>
            <span className="text-blue-400 text-xs">{showInstructions ? 'Hide' : 'Show'}</span>
          </button>

          {showInstructions && (
            <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-lg space-y-4 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-2">🏃 Google Fit</h4>
                <ol className="text-white/70 text-xs space-y-1.5 list-decimal list-inside">
                  <li className="flex items-start gap-1">
                    <span className="flex-shrink-0">1.</span>
                    <div className="flex-1">
                      Go to{' '}
                      <a 
                        href="https://takeout.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                      >
                        Google Takeout
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </li>
                  <li>Select only "Fit" (deselect all others)</li>
                  <li>Choose "Export once" and "JSON" format</li>
                  <li>Click "Create export"</li>
                  <li>Click Import above when file is ready</li>
                </ol>
                <p className="mt-3 text-white/70 text-xs flex items-start gap-2">
                  <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>
                    Google may take 1-3 hours to prepare your export. 
                    You'll receive an email when it's ready to download.
                  </span>
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-semibold mb-2">❤️ Apple Health</h4>
                <ol className="text-white/70 text-xs space-y-1 list-decimal list-inside">
                  <li>Open Health app on iPhone</li>
                  <li>Tap profile → Export All Health Data</li>
                  <li>Transfer export.xml to this device</li>
                  <li>Click Import above</li>
                </ol>
              </div>

              <p className="text-white/50 text-xs border-t border-white/10 pt-4">
                💡 Your export includes all workouts from connected devices (Garmin, Strava, Fitbit, etc.)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const LinkedAppsModal = memo(LinkedAppsModalComponent);