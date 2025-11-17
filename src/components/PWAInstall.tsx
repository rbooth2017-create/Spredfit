import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getInstallPromptInfo,
  showAndroidInstallPrompt,
  isIOSStandalone,
  isAndroidInstallAvailable,
} from '../utils/pwa';
import { toast } from 'sonner@2.0.3';

interface PWAInstallProps {
  /**
   * Whether to show the install prompt automatically
   * If false, component returns null until user triggers it
   */
  autoShow?: boolean;
  /**
   * Custom className for positioning
   */
  className?: string;
}

export function PWAInstall({ autoShow = true, className = '' }: PWAInstallProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installInfo, setInstallInfo] = useState<ReturnType<typeof getInstallPromptInfo>>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already running as standalone app
    if (isIOSStandalone()) {
      return;
    }

    // Check if install is available
    const info = getInstallPromptInfo();
    setInstallInfo(info);

    // Auto-show if enabled and install is available
    if (autoShow && info) {
      // Delay showing by 3 seconds to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [autoShow]);

  // Listen for Android install prompt becoming available
  useEffect(() => {
    const checkInstallAvailability = () => {
      const info = getInstallPromptInfo();
      setInstallInfo(info);
    };

    // Check periodically (Android install prompt may not be available immediately)
    const interval = setInterval(checkInstallAvailability, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    if (!installInfo) return;

    if (installInfo.platform === 'Android' && installInfo.canPrompt) {
      setIsInstalling(true);
      const installed = await showAndroidInstallPrompt();
      
      if (installed) {
        // Successfully installed, hide prompt
        setShowPrompt(false);
        toast.success('App installed successfully!');
      }
      setIsInstalling(false);
    }
    // For iOS, instructions are already shown, no action needed
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently (within 7 days)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (dismissedTime > sevenDaysAgo) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt || !installInfo) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed bottom-6 left-4 right-4 max-w-[440px] mx-auto z-50 ${className}`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-[#2d332d]" />
          </button>

          {/* Content */}
          <div className="pr-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2d332d] flex items-center justify-center">
                <img src="/logo.png" alt="SPREDfit" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2d332d]">
                  Install SPREDfit
                </h3>
                <p className="text-sm text-[#2d332d]/60">
                  Access faster, work offline
                </p>
              </div>
            </div>

            {/* Android - Show install button */}
            {installInfo.platform === 'Android' && installInfo.canPrompt && (
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full mt-4 py-3 px-4 rounded-2xl bg-[#2d332d] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#2d332d]/90 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
            )}

            {/* iOS - Show instructions */}
            {installInfo.platform === 'iOS' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-3 text-sm text-[#2d332d]/80">
                  <Share className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-2">To install:</p>
                    <ol className="list-decimal list-inside space-y-1 text-[#2d332d]/60">
                      {installInfo.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-4 pt-4 border-t border-[#2d332d]/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl mb-1">⚡</div>
                  <p className="text-xs text-[#2d332d]/60">Faster</p>
                </div>
                <div>
                  <div className="text-xl mb-1">📱</div>
                  <p className="text-xs text-[#2d332d]/60">Home Screen</p>
                </div>
                <div>
                  <div className="text-xl mb-1">✈️</div>
                  <p className="text-xs text-[#2d332d]/60">Offline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to programmatically trigger the install prompt
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [platform, setPlatform] = useState<'iOS' | 'Android' | null>(null);

  useEffect(() => {
    const info = getInstallPromptInfo();
    setCanInstall(!!info);
    setPlatform(info?.platform || null);
  }, []);

  const triggerInstall = async () => {
    const info = getInstallPromptInfo();
    if (info?.platform === 'Android' && info.canPrompt) {
      const installed = await showAndroidInstallPrompt();
      if (installed) {
        toast.success('App installed successfully!');
      }
      return installed;
    } else if (info?.platform === 'iOS') {
      // For iOS, show toast with instructions
      toast.info('Tap Share → Add to Home Screen to install');
      return false;
    }
    return false;
  };

  return {
    canInstall,
    platform,
    triggerInstall,
    isAndroidWithPrompt: platform === 'Android' && isAndroidInstallAvailable(),
    isIOS: platform === 'iOS',
    isPWAInstallable: canInstall,
    promptInstall: triggerInstall,
  };
}