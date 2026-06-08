import React, {createContext, useContext, useMemo, ReactNode} from 'react';
import {useSafeAreaInsets, EdgeInsets} from 'react-native-safe-area-context';
import {ViewStyle, StyleProp, Platform} from 'react-native';

// Types for safe area configuration
export type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';
export type SafeAreaEdges = SafeAreaEdge[];

interface SafeAreaStyles {
  container: ViewStyle;
  topOnly: ViewStyle;
  bottomOnly: ViewStyle;
  horizontalOnly: ViewStyle;
  verticalOnly: ViewStyle;
  excludeTop: ViewStyle;
  excludeBottom: ViewStyle;
}

interface SafeAreaContextValue {
  insets: EdgeInsets;
  styles: SafeAreaStyles;
  addInsets: (edges?: SafeAreaEdges, additionalPadding?: Partial<EdgeInsets>) => ViewStyle;
  getInset: (edge: SafeAreaEdge, additional?: number) => number;
  hasNotch: boolean;
  isIphone: boolean;
  safeAreaHeight: number;
}

const SafeAreaContext = createContext<SafeAreaContextValue | undefined>(undefined);

interface SafeAreaProviderProps {
  children: ReactNode;
}

export const GlobalSafeAreaProvider: React.FC<SafeAreaProviderProps> = ({children}) => {
  const insets = useSafeAreaInsets();

  // Memoized calculations
  const contextValue = useMemo(() => {
    const hasNotch = insets.top > 20;
    const isIphone = Platform.OS === 'ios';
    const safeAreaHeight = insets.top + insets.bottom;

    // Enhanced Android bottom inset detection
    const androidBottomInset =
      Platform.OS === 'android'
        ? Math.max(insets.bottom, 24) // Minimum 24px for Android navigation bar
        : insets.bottom;

    // Adjusted insets with Android-specific bottom padding
    const adjustedInsets = {
      ...insets,
      bottom: Platform.OS === 'android' ? androidBottomInset : insets.bottom,
    };

    // Pre-computed style objects using adjusted insets
    const styles: SafeAreaStyles = {
      container: {
        paddingTop: adjustedInsets.top,
        paddingBottom: adjustedInsets.bottom,
        paddingLeft: adjustedInsets.left,
        paddingRight: adjustedInsets.right,
      },
      topOnly: {
        paddingTop: adjustedInsets.top,
      },
      bottomOnly: {
        paddingBottom: adjustedInsets.bottom,
      },
      horizontalOnly: {
        paddingLeft: adjustedInsets.left,
        paddingRight: adjustedInsets.right,
      },
      verticalOnly: {
        paddingTop: adjustedInsets.top,
        paddingBottom: adjustedInsets.bottom,
      },
      excludeTop: {
        paddingBottom: adjustedInsets.bottom,
        paddingLeft: adjustedInsets.left,
        paddingRight: adjustedInsets.right,
      },
      excludeBottom: {
        paddingTop: adjustedInsets.top,
        paddingLeft: adjustedInsets.left,
        paddingRight: adjustedInsets.right,
      },
    };

    // Dynamic inset calculator using adjusted insets
    const addInsets = (
      edges: SafeAreaEdges = ['top', 'bottom', 'left', 'right'],
      additionalPadding: Partial<EdgeInsets> = {},
    ): ViewStyle => ({
      paddingTop: edges.includes('top')
        ? adjustedInsets.top + (additionalPadding.top || 0)
        : additionalPadding.top || 0,
      paddingBottom: edges.includes('bottom')
        ? adjustedInsets.bottom + (additionalPadding.bottom || 0)
        : additionalPadding.bottom || 0,
      paddingLeft: edges.includes('left')
        ? adjustedInsets.left + (additionalPadding.left || 0)
        : additionalPadding.left || 0,
      paddingRight: edges.includes('right')
        ? adjustedInsets.right + (additionalPadding.right || 0)
        : additionalPadding.right || 0,
    });

    // Single inset getter using adjusted insets
    const getInset = (edge: SafeAreaEdge, additional = 0): number => {
      return adjustedInsets[edge] + additional;
    };

    return {
      insets: adjustedInsets,
      styles,
      addInsets,
      getInset,
      hasNotch,
      isIphone,
      safeAreaHeight,
    };
  }, [insets]);

  return <SafeAreaContext.Provider value={contextValue}>{children}</SafeAreaContext.Provider>;
};

// Custom hook with error handling
export const useGlobalSafeArea = (): SafeAreaContextValue => {
  const context = useContext(SafeAreaContext);
  if (context === undefined) {
    throw new Error('useGlobalSafeArea must be used within a GlobalSafeAreaProvider');
  }
  return context;
};

// Convenience hooks for specific use cases
export const useSafeAreaTop = (additional = 0): number => {
  const {getInset} = useGlobalSafeArea();
  return getInset('top', additional);
};

export const useSafeAreaBottom = (additional = 0): number => {
  const {getInset} = useGlobalSafeArea();
  return getInset('bottom', additional);
};

export const useSafeAreaStyle = (
  edges?: SafeAreaEdges,
  additionalPadding?: Partial<EdgeInsets>,
): StyleProp<ViewStyle> => {
  const {addInsets} = useGlobalSafeArea();
  return useMemo(() => addInsets(edges, additionalPadding), [edges, additionalPadding, addInsets]);
};

// Device detection hooks
export const useDeviceInfo = () => {
  const {hasNotch, isIphone, safeAreaHeight} = useGlobalSafeArea();
  return {hasNotch, isIphone, safeAreaHeight};
};

export default GlobalSafeAreaProvider;
