# GlucoseGuard

A cross-platform glucose monitoring app that connects to FreeStyle Libre sensors and syncs data to Firebase cloud storage.

## Features

- Real-time glucose monitoring via BLE
- Glucose history charts
- Notes for meals, insulin, exercise
- Cloud sync via Firebase
- Glucose alarms
- Data sharing with family/doctors

## Tech Stack

- React Native (Bare Workflow) + TypeScript
- Redux Toolkit + RTK Query
- react-native-ble-plx (BLE communication)
- Firebase (Auth + Firestore + Cloud Messaging)
- React Navigation v7
- victory-native (charts)

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Run iOS
npm run ios

# Run Android
npm run android
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Add iOS and Android apps
3. Configure `src/config/firebase.ts` with your Firebase credentials
4. Enable Email/Password authentication
5. Set up Firestore database

## Project Structure

```
src/
├── config/           # Firebase and app configuration
├── store/            # Redux store and slices
│   ├── slices/       # Redux slices
│   └── api/          # RTK Query API
├── services/         # Business logic services
├── screens/          # React Native screens
├── components/       # Reusable components
├── types/            # TypeScript types
└── navigation/       # Navigation configuration
```

## License

MIT