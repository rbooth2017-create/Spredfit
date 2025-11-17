// Native mobile app utilities using Capacitor
import { Capacitor } from '@capacitor/core';

// Check if running as native app
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

// Get platform (ios, android, web)
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

// Check if running on iOS native app
export function isIOSNative(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

// Check if running on Android native app
export function isAndroidNative(): boolean {
  return Capacitor.getPlatform() === 'android';
}

// Status Bar Management
export async function setupStatusBar() {
  if (!isNativeApp()) return;
  
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    
    if (isIOSNative()) {
      await StatusBar.setStyle({ style: 'DARK' }); // Dark text on light background
      await StatusBar.setBackgroundColor({ color: '#7a8872' });
    } else if (isAndroidNative()) {
      await StatusBar.setStyle({ style: 'DARK' });
      await StatusBar.setBackgroundColor({ color: '#7a8872' });
    }
  } catch (error) {
    console.log('StatusBar not available:', error);
  }
}

// Splash Screen Management
export async function hideSplashScreen() {
  if (!isNativeApp()) return;
  
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (error) {
    console.log('SplashScreen not available:', error);
  }
}

// Keyboard Management
export async function setupKeyboard() {
  if (!isNativeApp()) return;
  
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    
    // Listen for keyboard events
    Keyboard.addListener('keyboardWillShow', info => {
      console.log('Keyboard will show:', info);
      // Adjust UI if needed
    });
    
    Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide');
      // Reset UI if needed
    });
  } catch (error) {
    console.log('Keyboard not available:', error);
  }
}

// Haptic Feedback (Native vibration)
export async function hapticImpact(style: 'LIGHT' | 'MEDIUM' | 'HEAVY' = 'MEDIUM') {
  if (!isNativeApp()) {
    // Fallback to web vibration API
    if ('vibrate' in navigator) {
      const duration = style === 'LIGHT' ? 10 : style === 'MEDIUM' ? 20 : 30;
      navigator.vibrate(duration);
    }
    return;
  }
  
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch (error) {
    console.log('Haptics not available:', error);
  }
}

export async function hapticVibrate() {
  if (!isNativeApp()) {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    return;
  }
  
  try {
    const { Haptics } = await import('@capacitor/haptics');
    await Haptics.vibrate({ duration: 50 });
  } catch (error) {
    console.log('Haptics not available:', error);
  }
}

export async function hapticNotification(type: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS') {
  if (!isNativeApp()) return;
  
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType[type] });
  } catch (error) {
    console.log('Haptics not available:', error);
  }
}

// Camera Access
export async function takePhoto() {
  if (!isNativeApp()) {
    // Fallback to web file input
    return null;
  }
  
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    
    return image.dataUrl;
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
}

export async function pickPhoto() {
  if (!isNativeApp()) {
    // Fallback to web file input
    return null;
  }
  
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    
    return image.dataUrl;
  } catch (error) {
    console.error('Photo picker error:', error);
    return null;
  }
}

// Geolocation
export async function getCurrentPosition() {
  if (!isNativeApp()) {
    // Fallback to web geolocation API
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      } else {
        reject(new Error('Geolocation not available'));
      }
    });
  }
  
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      },
      timestamp: position.timestamp,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    throw error;
  }
}

export async function watchPosition(callback: (position: any) => void) {
  if (!isNativeApp()) {
    // Fallback to web geolocation API
    if ('geolocation' in navigator) {
      return navigator.geolocation.watchPosition(callback, console.error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    }
    return null;
  }
  
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      callback
    );
    
    return watchId;
  } catch (error) {
    console.error('Watch position error:', error);
    return null;
  }
}

// Push Notifications
export async function requestNotificationPermissions() {
  if (!isNativeApp()) {
    // Fallback to web notification API
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
  
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    // Request permission
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register();
      return 'granted';
    }
    
    return 'denied';
  } catch (error) {
    console.error('Push notification error:', error);
    return 'denied';
  }
}

export async function setupPushNotifications(
  onNotificationReceived?: (notification: any) => void,
  onRegistrationSuccess?: (token: string) => void
) {
  if (!isNativeApp()) return;
  
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    // Listen for registration success
    await PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      if (onRegistrationSuccess) {
        onRegistrationSuccess(token.value);
      }
    });
    
    // Listen for registration errors
    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });
    
    // Listen for push notifications
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });
    
    // Handle notification tap when app is in background
    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
    });
  } catch (error) {
    console.error('Push notification setup error:', error);
  }
}

// Network Status
export async function getNetworkStatus() {
  if (!isNativeApp()) {
    // Fallback to web navigator.onLine
    return {
      connected: navigator.onLine,
      connectionType: navigator.onLine ? 'wifi' : 'none',
    };
  }
  
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.error('Network status error:', error);
    return {
      connected: navigator.onLine,
      connectionType: 'unknown',
    };
  }
}

export async function watchNetworkStatus(callback: (status: any) => void) {
  if (!isNativeApp()) {
    // Fallback to web online/offline events
    const handler = () => callback({ connected: navigator.onLine });
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }
  
  try {
    const { Network } = await import('@capacitor/network');
    const handler = await Network.addListener('networkStatusChange', callback);
    return () => handler.remove();
  } catch (error) {
    console.error('Network watch error:', error);
    return () => {};
  }
}

// App Information
export async function getAppInfo() {
  if (!isNativeApp()) {
    return {
      name: 'SPREDfit',
      id: 'com.spredfit.web',
      version: '1.0.0',
      build: '1',
    };
  }
  
  try {
    const { App } = await import('@capacitor/app');
    const info = await App.getInfo();
    return info;
  } catch (error) {
    console.error('App info error:', error);
    return null;
  }
}

// Handle back button (Android)
export async function setupBackButton(handler: () => boolean) {
  if (!isAndroidNative()) return;
  
  try {
    const { App } = await import('@capacitor/app');
    
    App.addListener('backButton', ({ canGoBack }) => {
      const shouldExit = handler();
      if (shouldExit) {
        App.exitApp();
      }
    });
  } catch (error) {
    console.error('Back button setup error:', error);
  }
}

// Share API
export async function shareContent(title: string, text: string, url?: string) {
  if (!isNativeApp()) {
    // Fallback to web share API
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        console.error('Web share error:', error);
        return false;
      }
    }
    return false;
  }
  
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share SPREDfit',
    });
    return true;
  } catch (error) {
    console.error('Native share error:', error);
    return false;
  }
}

// Initialize all native features
export async function initializeNativeApp() {
  if (!isNativeApp()) {
    console.log('Running as web app');
    return;
  }
  
  console.log(`Initializing native app on ${getPlatform()}`);
  
  // Setup status bar
  await setupStatusBar();
  
  // Setup keyboard
  await setupKeyboard();
  
  // Hide splash screen after initialization
  setTimeout(async () => {
    await hideSplashScreen();
  }, 1000);
  
  console.log('Native app initialized');
}
