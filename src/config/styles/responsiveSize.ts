import {Dimensions, Platform, StatusBar, NativeModules} from 'react-native';

const {width, height} = Dimensions.get('window');

// Base dimensions for scaling calculations
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Define the type for PlatformConstants
interface PlatformConstantsIOS {
  interfaceIdiom?: string;
}

// Type for NativeModules to address the TypeScript error
interface CustomNativeModules {
  PlatformConstants?: PlatformConstantsIOS;
}

// Cast NativeModules to our custom interface
const customNativeModules = NativeModules as CustomNativeModules;

// Detect notched devices
const hasNotch = (): boolean => {
  if (Platform.OS === 'android') {
    return !!(StatusBar.currentHeight && StatusBar.currentHeight > 24);
  }

  if (Platform.OS === 'ios') {
    const PlatformConstants = customNativeModules.PlatformConstants;
    return !!(
      PlatformConstants?.interfaceIdiom === 'phone' &&
      !Platform.isPad &&
      !Platform.isTV &&
      (height >= 812 || width >= 812)
    );
  }

  return false;
};

// Status Bar Height for layouts
const StatusBarHeight: number = Platform.select({
  ios: hasNotch() ? 47 : 10,
  android: (StatusBar.currentHeight ?? 0) + 10,
  default: 0,
});

const getApproximateBottomSafeArea: number = Platform.select({
  ios: hasNotch() ? 34 : 30,
  android: 10,
  default: 10,
});

// UI Scaling functions
const scale = (size: number): number => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number): number => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5): number => size + (scale(size) - size) * factor;
const moderateScaleVertical = (size: number, factor = 0.5): number =>
  size + (verticalScale(size) - size) * factor;

// Updated text scaling function for pixel-based font sizes
// This will scale fonts responsively based on device size
const fontScale = (size: number): number => {
  // Base scale factor - adjust this depending on how aggressive you want the scaling
  const factor = Math.min(width, height) / guidelineBaseWidth;

  // Apply moderate scaling to prevent fonts from becoming too large or small
  // You can adjust the 0.5 factor to control how much the font scales
  return Math.round(size + (size * factor - size) * 0.5);
};

// Example usage: fontScale(14) for a 14px font that scales appropriately

// Only export the scaling functions and required dimensions
export {
  // UI Scaling functions
  scale,
  verticalScale,
  moderateScale,
  moderateScaleVertical,
  fontScale,
  width,
  height,
  StatusBarHeight,
  getApproximateBottomSafeArea,
};
