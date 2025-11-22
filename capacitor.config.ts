import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spredfit.app',
  appName: 'SPREDfit',
  webDir: 'build'
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    // For development - allows loading from local server
    // url: 'http://192.168.1.100:3000', // Uncomment and set your local IP for live reload
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1B2632', // SPREDfit sage green
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK', // Dark text for light background
      backgroundColor: '#1B2632', // SPREDfit sage green
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
    // Custom iOS build settings
    scheme: 'SPREDfit',
  },
  android: {
    // Allow clear text traffic for development
    allowMixedContent: false,
    // Background color for Android
    backgroundColor: '#1B2632',
    // Build settings
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    },
  },
};

export default config;
