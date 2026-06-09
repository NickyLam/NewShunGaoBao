# GlucoseGuard Testing Guide

## Overview

This project includes unit tests, integration tests, and end-to-end (E2E) tests.

## Test Structure

```
src/__tests__/
├── store.test.ts
├── slices/
│   ├── glucoseSlice.test.ts
│   ├── settingsSlice.test.ts
│   ├── authSlice.test.ts
│   └── notesSlice.test.ts
├── services/
│   └── AlarmService.test.ts
└── components/
    └── TestComponent.test.tsx

e2e/
├── config.js
└── app.test.js
```

## Running Tests

### Unit Tests

Run all unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage report:

```bash
npm run test:coverage
```

### E2E Tests

Coming soon - will require Detox or Maestro.

## Test Coverage Targets

- Branch coverage: 50%+
- Function coverage: 50%+
- Line coverage: 50%+
- Statement coverage: 50%+

## Writing New Tests

### Redux Slice Tests

1. Test initial state
2. Test each action
3. Test edge cases

### Service Tests

1. Test each public method
2. Mock dependencies
3. Test error handling

### Component Tests

1. Test rendering
2. Test interactions
3. Test with different props

## Mocking Dependencies

- BLE: `react-native-ble-plx` is mocked
- Firebase: All Firebase modules are mocked
- Storage: `react-native-encrypted-storage` is mocked

## Best Practices

1. Write tests before implementing features (TDD)
2. Keep tests isolated
3. Use descriptive test names
4. Test edge cases
5. Keep tests fast
