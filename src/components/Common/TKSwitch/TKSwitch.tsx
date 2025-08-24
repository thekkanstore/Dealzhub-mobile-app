import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import {colors} from '../../../config/styles/colors';

interface TKSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled: boolean;
}

const TKSwitch: React.FC<TKSwitchProps> = ({value = false, onValueChange, disabled = false}) => {
  const animatedValue = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    animatedValue.value = withTiming(value ? 1 : 0, {duration: 200});
  }, [value, animatedValue]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [colors.secondaryButtonBackgroundColor, colors.tertiaryButtonBackgroundColor],
    );
    return {
      backgroundColor,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animatedValue.value, [0, 1], [3, 19]);
    return {
      transform: [{translateX}],
    };
  });

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View style={[styles.track, trackAnimatedStyle]}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.switchBorder,
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryBackgroundColor,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default TKSwitch;
