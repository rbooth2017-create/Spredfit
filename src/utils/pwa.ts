// PWA utilities for iOS and Android mobile support

let deferredPrompt: any = null;

// Listen for beforeinstallprompt event (Android)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('✅ PWA install prompt ready');
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
  });
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('✅ ServiceWorker registered:', registration.scope);
        })
        .catch(error => {
          console.log('❌ ServiceWorker registration failed:', error);
        });
    });
  }
}

export function addPWAMetaTags() {
  // Add manifest link first
  addManifestLink();
  
  // Create meta tags for iOS PWA support
  const metaTags = [
    // iOS Web App Capable - enable standalone mode
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    
    // iOS Status Bar Style - translucent black
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    
    // iOS App Title
    { name: 'apple-mobile-web-app-title', content: 'SPREDfit' },
    
    // Prevent iOS text size adjustment
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    
    // Mobile viewport - prevent zoom
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
    
    // Theme color
    { name: 'theme-color', content: '#2d332d' },
    { name: 'msapplication-TileColor', content: '#2d332d' },
    
    // Mobile web app
    { name: 'mobile-web-app-capable', content: 'yes' },
    
    // Format detection (prevent iOS from auto-detecting phone numbers, etc.)
    { name: 'format-detection', content: 'telephone=no' },
    
    // PWA description
    { name: 'description', content: 'Join friends and compete to move more each month. Track workouts, join leagues, and stay motivated together.' },
    
    // Application name
    { name: 'application-name', content: 'SPREDfit' },
  ];

  metaTags.forEach(({ name, content }) => {
    const existing = document.querySelector(`meta[name="${name}"]`);
    if (!existing) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  });

  // Add apple-touch-icon links (for iOS home screen icon)
  const iconSizes = [
    '180x180', // iPhone/iPad
    '167x167', // iPad Pro
    '152x152', // iPad
    '120x120', // iPhone
  ];

  iconSizes.forEach(size => {
    const existing = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.sizes = size;
      link.href = `/icons/icon-${size}.png`; // You'll need to add these icons
      document.head.appendChild(link);
    }
  });

  // Add iOS splash screens
  addIOSSplashScreens();
  
  // Add iOS safe area CSS variables
  addIOSSafeAreaStyles();
}

function addManifestLink() {
  const existing = document.querySelector('link[rel="manifest"]');
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }
}

function addIOSSplashScreens() {
  const splashScreens = [
    // iPhone 14 Pro Max, 13 Pro Max, 12 Pro Max
    { media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphone-14-pro-max.png' },
    
    // iPhone 14, 13, 12
    { media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphone-14.png' },
    
    // iPhone 14 Plus, 13 Pro Max, 12 Pro Max
    { media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphone-14-plus.png' },
    
    // iPhone 11, XR
    { media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/iphone-11.png' },
    
    // iPhone 11 Pro Max, XS Max
    { media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphone-11-pro-max.png' },
    
    // iPhone 11 Pro, XS, X
    { media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphone-11-pro.png' },
    
    // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
    { media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphone-8-plus.png' },
    
    // iPhone 8, 7, 6s, 6
    { media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/iphone-8.png' },
    
    // iPad Pro 12.9"
    { media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipad-pro-12.9.png' },
    
    // iPad Pro 11"
    { media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipad-pro-11.png' },
    
    // iPad Pro 10.5"
    { media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipad-pro-10.5.png' },
    
    // iPad, iPad Air
    { media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipad.png' },
  ];

  splashScreens.forEach(({ media, href }) => {
    const existing = document.querySelector(`link[rel="apple-touch-startup-image"][media="${media}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-startup-image';
      link.media = media;
      link.href = href;
      document.head.appendChild(link);
    }
  });
}

function addIOSSafeAreaStyles() {
  // Check if CSS custom properties already exist
  const existingStyle = document.getElementById('ios-safe-area-styles');
  if (existingStyle) return;

  // Add CSS custom properties for safe areas
  const style = document.createElement('style');
  style.id = 'ios-safe-area-styles';
  style.textContent = `
    :root {
      /* iOS Safe Area Variables */
      --sat: env(safe-area-inset-top);
      --sar: env(safe-area-inset-right);
      --sab: env(safe-area-inset-bottom);
      --sal: env(safe-area-inset-left);
      
      /* Default fallbacks for non-iOS */
      --safe-area-top: env(safe-area-inset-top, 0px);
      --safe-area-right: env(safe-area-inset-right, 0px);
      --safe-area-bottom: env(safe-area-inset-bottom, 0px);
      --safe-area-left: env(safe-area-inset-left, 0px);
    }
    
    /* Prevent iOS pull-to-refresh/overscroll */
    body {
      overscroll-behavior-y: none;
      -webkit-overflow-scrolling: touch;
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    /* Allow scrolling within app */
    #root {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Prevent iOS double-tap zoom */
    * {
      touch-action: manipulation;
    }
    
    /* iOS input focus fix - prevent zoom */
    input, select, textarea {
      font-size: 16px !important;
    }
    
    /* Hide iOS Safari UI elements in standalone mode */
    @media (display-mode: standalone) {
      body {
        padding-top: var(--safe-area-top);
        padding-right: var(--safe-area-right);
        padding-bottom: var(--safe-area-bottom);
        padding-left: var(--safe-area-left);
      }
    }
    
    /* Prevent text selection on iOS (optional - makes app feel more native) */
    * {
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    
    /* Allow text selection in inputs and text areas */
    input, textarea {
      -webkit-user-select: text;
      -webkit-touch-callout: default;
    }
    
    /* Smooth scrolling for iOS */
    * {
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
}

// Detect if app is running in iOS standalone mode
export function isIOSStandalone(): boolean {
  return (
    window.navigator.standalone === true || 
    window.matchMedia('(display-mode: standalone)').matches
  );
}

// Detect if running on iOS
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// Check if app can be installed (iOS 13+)
export function canInstallPWA(): boolean {
  // Check for beforeinstallprompt event (Android)
  if ('beforeinstallprompt' in window) {
    return true;
  }
  
  // For iOS, check if in Safari and not standalone
  if (isIOS() && !isIOSStandalone()) {
    return true;
  }
  
  return false;
}

// Show iOS install instructions
export function showIOSInstallPrompt() {
  if (!isIOS() || isIOSStandalone()) {
    return null;
  }
  
  return {
    platform: 'iOS',
    instructions: [
      'Tap the Share button',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" in the top right corner',
    ],
  };
}

// Vibration API wrapper for iOS haptics
export function vibrate(pattern: number | number[] = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Request notification permission (for future push notifications)
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
}

// Show Android install prompt (for Android devices)
export async function showAndroidInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('❌ No install prompt available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
}

// Check if Android install prompt is available
export function isAndroidInstallAvailable(): boolean {
  return deferredPrompt !== null;
}

// Get install prompt data for UI display
export function getInstallPromptInfo() {
  if (isIOS() && !isIOSStandalone()) {
    return {
      platform: 'iOS',
      canPrompt: false,
      instructions: [
        'Tap the Share button (square with arrow)',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right corner',
      ],
    };
  }

  if (isAndroidInstallAvailable()) {
    return {
      platform: 'Android',
      canPrompt: true,
      instructions: [],
    };
  }

  return null;
}