import React, {Fragment, useCallback, useMemo} from 'react';
import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  getFocusedRouteNameFromRoute,
  NavigationRoute,
  ParamListBase,
} from '@react-navigation/native';
import {useKeyboardListener} from '../../../hooks/useKeyboardListener';
import {colors} from '../../../config/styles/colors';
import {moderateScale, moderateScaleVertical} from '../../../config/styles/responsiveSize';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useAppSelector} from '../../../redux/hooks';
import {updateIsFromProductDetails} from '../../../redux/productSlice';

const screensThatShouldShowTabBar = ['HomePage', 'Home', 'Vendor', 'Favorites', 'Cart'];
const TKCustomBottomTabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
  const [isKeyboardVisible] = useKeyboardListener();
  const focusedRoute = state.routes[state.index];

  const focusedRouteName = getFocusedRouteNameFromRoute(focusedRoute) || 'HomePage';
  const isFromProductScreen = useAppSelector(state => state.product.isFromProductDetails);
  const shouldShowTabBar = useMemo(() => {
    if (isFromProductScreen && focusedRouteName === 'Vendor') {
      return false;
    }
    return screensThatShouldShowTabBar.includes(focusedRouteName);
  }, [focusedRouteName, isFromProductScreen]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        tabBar: {
          ...styles.tabBar,
          height: moderateScaleVertical(55),
          display: isKeyboardVisible ? 'none' : 'flex',
        },
      }),
    [isKeyboardVisible],
  );

  const onPress = useCallback(
    (route: NavigationRoute<ParamListBase, string>, isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      updateIsFromProductDetails(false);
      setTimeout(() => {
        if (!isFocused && !event.defaultPrevented) {
          navigation.reset({
            index: 0,
            routes: [{name: route.name}],
          });
        }
      }, 300);
    },
    [navigation],
  );
  if (!shouldShowTabBar) {
    return null;
  }

  return (
    <View style={[styles.container]}>
      <View style={dynamicStyles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          return (
            <Fragment key={route.name}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={() => onPress(route, isFocused)}
                style={[styles.tabItem]}
                activeOpacity={0.7}>
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
    paddingBottom: Platform.OS === 'ios' ? 0 : moderateScale(15),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackgroundColor,
    marginHorizontal: moderateScale(35),
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
