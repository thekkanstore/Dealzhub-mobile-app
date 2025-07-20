import React, {Fragment} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useKeyboardListener} from '../../hooks/useKeyboardListener';
import {colors} from '../../config/styles/colors';
import {fontScale, moderateScale, moderateScaleVertical} from '../../config/styles/responsiveSize';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {fontFamily} from '../../config/styles/fontFamily';

const TKCustomBottomTabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible] = useKeyboardListener();
  const focusedRoute = state.routes[state.index];

  // method used to hide the tab bar
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedRoute) || 'HomePage';
  const screensThatShouldShowTabBar = ['HomePage', 'Home', 'TransactionHistory', 'ProfileScreen'];
  const shouldShowTabBar = screensThatShouldShowTabBar.includes(focusedRouteName);

  if (!shouldShowTabBar) {
    return null; // Hide the tab bar
  }

  // Dynamic styles based on props
  const dynamicStyles = StyleSheet.create({
    tabBar: {
      ...styles.tabBar,
      height: Platform.OS === 'ios' ? 50 + insets.bottom : 50 + moderateScaleVertical(26),
      paddingBottom: moderateScale(10),
      display: isKeyboardVisible ? 'none' : 'flex',
    },
  });

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // If you want to reset to the initial screen and clear stack history
              navigation.reset({
                index: 0,
                routes: [{name: route.name}],
              });
            }
          };

          return (
            <Fragment key={route.name}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}>
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color: '',
                    size: 0,
                  })}
                <Text style={[styles.tabLabel, isFocused && styles.tabSelectedLabel]}>
                  {typeof label === 'function'
                    ? label({
                        focused: isFocused,
                        color: isFocused ? colors.darkTextColor : colors.darkTextColor,
                        position: 'below-icon',
                        children: route.name,
                      })
                    : label}
                </Text>
              </TouchableOpacity>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryBackgroundColor,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryBackgroundColor,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
  },
  tabItemActive: {
    borderTopWidth: moderateScale(2),
    borderTopColor: colors.primaryBackgroundColor,
  },
  tabLabel: {
    marginBottom: moderateScale(6),
    marginTop: moderateScale(4),
    fontSize: fontScale(14),
    fontWeight: '600',
    fontFamily: fontFamily.medium,
    color: colors.disabledTextColor,
  },
  tabSelectedLabel: {
    fontSize: fontScale(14),
    fontWeight: '600',
    fontFamily: fontFamily.medium,
    color: colors.secondaryTextColor,
  },
});

export default React.memo(TKCustomBottomTabBar);
