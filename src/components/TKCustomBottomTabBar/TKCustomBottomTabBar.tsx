import React, {Fragment} from 'react';
import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useKeyboardListener} from '../../hooks/useKeyboardListener';
import {colors} from '../../config/styles/colors';
import {moderateScale, moderateScaleVertical} from '../../config/styles/responsiveSize';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';

const TKCustomBottomTabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
  const [isKeyboardVisible] = useKeyboardListener();
  const focusedRoute = state.routes[state.index];

  const focusedRouteName = getFocusedRouteNameFromRoute(focusedRoute) || 'HomePage';
  const screensThatShouldShowTabBar = ['HomePage', 'Home', 'TransactionHistory', 'ProfileScreen'];
  const shouldShowTabBar = screensThatShouldShowTabBar.includes(focusedRouteName);

  if (!shouldShowTabBar) {
    return null;
  }

  const dynamicStyles = StyleSheet.create({
    tabBar: {
      ...styles.tabBar,
      height: moderateScaleVertical(55),
      display: isKeyboardVisible ? 'none' : 'flex',
    },
  });

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
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
                style={[styles.tabItem]}>
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color: '',
                    size: 0,
                  })}
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
    backgroundColor: colors.primaryBackgroundColor,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? moderateScale(10) : 0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackgroundColor,
    marginHorizontal: moderateScale(35),
    marginBottom: moderateScale(10),
    borderRadius: moderateScale(30),
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default React.memo(TKCustomBottomTabBar);
