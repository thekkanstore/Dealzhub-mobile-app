# Global Safe Area Implementation - 2025 Modern Approach

This implementation provides a comprehensive, typed, and performant solution for handling safe areas globally across your React Native application.

## 🎯 Key Features

- **Zero Manual Imports**: No need to import `useSafeAreaInsets` in every component
- **TypeScript Support**: Fully typed with interfaces and proper error handling
- **Performance Optimized**: Uses `useMemo` and `initialWindowMetrics` for fast rendering
- **Multiple Usage Patterns**: Hooks, styles, and utilities for different use cases
- **Device Detection**: Built-in device type and notch detection

## 📱 Usage Examples

### 1. Simple Bottom Padding (Most Common)
```tsx
import { useSafeAreaBottom } from '../../providers/SafeAreaProvider';

const MyComponent = () => {
  const bottomPadding = useSafeAreaBottom(20); // 20px additional padding
  
  return (
    <View style={{paddingBottom: bottomPadding}}>
      <Button title="Submit" />
    </View>
  );
};
```

### 2. Pre-computed Style Objects
```tsx
import { useGlobalSafeArea } from '../../providers/SafeAreaProvider';

const MyComponent = () => {
  const { styles } = useGlobalSafeArea();
  
  return (
    <View style={styles.bottomOnly}>  {/* Only bottom safe area */}
      <Content />
    </View>
  );
};
```

### 3. Dynamic Safe Area Styles
```tsx
import { useSafeAreaStyle } from '../../providers/SafeAreaProvider';

const MyComponent = () => {
  const safeStyle = useSafeAreaStyle(['bottom'], {bottom: 20});
  
  return (
    <View style={[myStyles.container, safeStyle]}>
      <Content />
    </View>
  );
};
```

### 4. Device Detection
```tsx
import { useDeviceInfo } from '../../providers/SafeAreaProvider';

const MyComponent = () => {
  const { hasNotch, isIphone } = useDeviceInfo();
  
  return (
    <View>
      {hasNotch && <Text>This device has a notch</Text>}
      {isIphone && <Text>This is an iPhone</Text>}
    </View>
  );
};
```

### 5. Full Control Access
```tsx
import { useGlobalSafeArea } from '../../providers/SafeAreaProvider';

const MyComponent = () => {
  const { insets, getInset, addInsets } = useGlobalSafeArea();
  
  // Direct access to insets
  const topInset = insets.top;
  
  // Get specific inset with additional padding
  const bottomWithPadding = getInset('bottom', 15);
  
  // Create custom style
  const customStyle = addInsets(['top', 'bottom'], {top: 10, bottom: 20});
  
  return (
    <View style={customStyle}>
      <Content />
    </View>
  );
};
```

## 🛠️ Available Hooks

### Primary Hooks
- `useGlobalSafeArea()` - Full access to all safe area functionality
- `useSafeAreaTop(additional?)` - Top inset with optional additional padding
- `useSafeAreaBottom(additional?)` - Bottom inset with optional additional padding
- `useSafeAreaStyle(edges?, additionalPadding?)` - Dynamic style generation
- `useDeviceInfo()` - Device type and characteristic detection

### Pre-computed Styles
The `styles` object provides these ready-to-use styles:
- `styles.container` - All edges
- `styles.topOnly` - Top edge only
- `styles.bottomOnly` - Bottom edge only
- `styles.horizontalOnly` - Left and right edges
- `styles.verticalOnly` - Top and bottom edges
- `styles.excludeTop` - All edges except top
- `styles.excludeBottom` - All edges except bottom

## 🎨 Integration Patterns

### For Full-Screen Images (like GettingStarted)
```tsx
const MyScreen = () => {
  const bottomPadding = useSafeAreaBottom(20);
  
  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground source={image} style={styles.image}>
        <View style={{paddingBottom: bottomPadding}}>
          <Button title="Action" />
        </View>
      </ImageBackground>
    </View>
  );
};
```

### For Regular Screens
```tsx
const MyScreen = () => {
  const { styles } = useGlobalSafeArea();
  
  return (
    <View style={styles.container}>
      <Content />
    </View>
  );
};
```

### For Modals or Overlays
```tsx
const MyModal = () => {
  const safeStyle = useSafeAreaStyle(['top', 'bottom']);
  
  return (
    <View style={[modalStyles.container, safeStyle]}>
      <ModalContent />
    </View>
  );
};
```

## 🔧 Configuration

The provider is automatically configured in App.tsx with:
- `SafeAreaProvider` from react-native-safe-area-context
- `initialWindowMetrics` for performance optimization
- `GlobalSafeAreaProvider` for typed global access

## 📊 Performance Benefits

1. **Memoized Calculations**: All styles and calculations are memoized
2. **Initial Metrics**: Uses `initialWindowMetrics` for instant first render
3. **Context Optimization**: Single context provider prevents prop drilling
4. **TypeScript**: Compile-time optimization and error prevention

## 🔍 Migration Guide

### Before (Old Way)
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MyComponent = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{paddingBottom: insets.bottom + 20}}>
      <Content />
    </View>
  );
};
```

### After (New Way)
```tsx
import { useSafeAreaBottom } from '../../providers/SafeAreaProvider';

const MyComponent = () => {
  const bottomPadding = useSafeAreaBottom(20);
  
  return (
    <View style={{paddingBottom: bottomPadding}}>
      <Content />
    </View>
  );
};
```

This modern approach provides better performance, type safety, and developer experience while eliminating repetitive imports throughout your application.