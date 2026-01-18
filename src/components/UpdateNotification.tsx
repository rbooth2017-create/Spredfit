import { useState, useEffect } from 'react';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Listen for service worker updates
  useEffect(() => {
    const handleUpdate = (event: any) => {
      console.log('🔄 Update available detected');
      setUpdateAvailable(true);
      setSwRegistration(event.detail);
    };

    window.addEventListener('swUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  const handleUpdate = () => {
    console.log('🔄 Update button clicked');
    
    if (!swRegistration?.waiting) {
      console.log('❌ No waiting service worker found');
      setUpdateAvailable(false);
      return;
    }
    
    console.log('✅ Applying update...');
    
    // Add listener ONCE before calling skipWaiting
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('🔄 Controller changed, reloading...');
      window.location.reload();
    }, { once: true });
    
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-16 right-4 z-[100] flex justify-end pointer-events-none">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleUpdate();
        }}
        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1.5 transition-all animate-pulse shadow-lg pointer-events-auto"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Update
      </button>
    </div>
  );
}