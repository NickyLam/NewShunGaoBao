# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GlucoseGuard** is a cross-platform React Native app for glucose monitoring via FreeStyle Libre BLE sensors with Firebase cloud sync.

## Common Commands

```bash
# Install dependencies
npm install

# Run iOS/Android
npm run ios
npm run android

# Run tests
npm test                              # Run all unit tests once
npm run test:watch                    # Run tests in watch mode
npm run test:coverage                 # Run with coverage report

# Run a single test file
npm test -- src/__tests__/slices/glucoseSlice.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should update glucose"
```

## Architecture

### Path Aliases

The project uses `@/*` as an alias for `./src/*` (configured in `tsconfig.json`):
```typescript
import { store } from '@/store/store';
import { GlucoseReading } from '@/types/sensor.types';
```

### State Management (Redux Toolkit)

Store configuration in `src/store/store.ts`:
- **Slices**: `glucoseSlice`, `settingsSlice`, `authSlice`, `notesSlice`
- **RTK Query**: `glucoseApi` for glucose reading API operations
- **Middleware**: Redux Logger in development only
- **Serializable Check**: `glucose.currentReading.timestamp` is ignored (non-serializable Date)

### Service Layer Pattern

Services are class-based with business logic:
- `SensorService` - BLE communication with glucose sensors
- `SyncService` - Firebase Firestore sync operations
- `AuthService` - Firebase Authentication
- `AlarmService` - Glucose threshold alarms
- `StorageService` - Local encrypted storage

### Data Flow

```
BLE Sensor → SensorService → Redux (glucoseSlice) → SyncService → Firebase Firestore
                                          ↓
                                    UI (Screens)
```

## Testing Setup

### Mocks (jest.setup.js)

The following are globally mocked:
- `react-native-ble-plx` (BleManager)
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `react-native-encrypted-storage`

### Test Structure

Place tests in `src/__tests__/` mirroring source structure:
- Redux slices: `src/__tests__/slices/*.test.ts`
- Services: `src/__tests__/services/*.test.ts`
- Components: `src/__tests__/components/*.test.tsx`

### Coverage Thresholds

All thresholds require **50%+** coverage:
- Branches, Functions, Lines, Statements

## Key Dependencies

- **React Native 0.74.1** with TypeScript
- **Firebase v20**: Auth, Firestore, Messaging, Storage
- **BLE**: `react-native-ble-plx` for sensor communication
- **Charts**: `victory-native` for glucose history visualization
- **Navigation**: React Navigation v7 (bottom-tabs + native-stack)
