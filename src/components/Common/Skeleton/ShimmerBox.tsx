import React, {useEffect, useRef} from 'react';
import {
  Animated,
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ShimmerBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const ShimmerBox: React.FC<ShimmerBoxProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
  children,
}) => {
  const animatedOpacity = useRef(new Animated.Value(0.4)).current;
  const animatedSweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation matching web's animate-pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    // Subtle light sweep matching web's via-white/30 gradient
    const sweepAnimation = Animated.loop(
      Animated.timing(animatedSweep, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );

    pulseAnimation.start();
    sweepAnimation.start();

    return () => {
      pulseAnimation.stop();
      sweepAnimation.stop();
    };
  }, [animatedOpacity, animatedSweep]);

  const translateX = animatedSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: animatedOpacity,
            backgroundColor: '#E5E7EB',
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{translateX}],
          },
        ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
});

export default ShimmerBox;
