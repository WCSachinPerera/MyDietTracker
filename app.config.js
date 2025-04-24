import 'dotenv/config';

export default {
  expo: {
    "name": "MyDietTracker",
    "slug": "MyDietTracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermissionText": "We need access to your camera to scan barcodes and take pictures."
        }
      ],
      "expo-font",
      [
        "expo-media-library",
        {
          "photosPermission": "Allow MyDietTracker to access your photos.",
          "savePhotosPermission": "Allow MyDietTracker to save photos."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow access to your photos to select profile images"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
    },
  }
};