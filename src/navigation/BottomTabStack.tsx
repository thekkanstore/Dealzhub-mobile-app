import React, {useCallback} from 'react';
import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StackActions} from '@react-navigation/native';

import {navigationStrings} from './navigationStrings';
// import LXIcon from '../components/LxIcon/LXIcon';
import {HomeStack} from './HomeStack';
import {TKCartIcon} from '../components/Common/Icons/TKCartIcon';
import {TKCartUnselectedIcon} from '../components/Common/Icons/TKCartUnselectedIcon';
import {TKHeartSelectedIcon} from '../components/Common/Icons/TKHeartSelectedIcon';
import {TKHeartUnselectedIcon} from '../components/Common/Icons/TKHeartUnselectedIcon';
import {TKHomeSelectedIcon} from '../components/Common/Icons/TKHomeSelectedIcon';
import {TKHomeUnselectedIcon} from '../components/Common/Icons/TKHomeUnselectedIcon';
import TKCustomBottomTabBar from '../components/Common/TKCustomBottomTabBar/TKCustomBottomTabBar';
import {TKVendorSelectedIcon} from '../components/Common/Icons/TKVendorSelectedIcon';
import {TKVendorUnSelectedIcon} from '../components/Common/Icons/TKVendorUnSelectedIcon';
import {VendorStack} from './VendorStack';
import {FavoritesStack} from './FavoritesStack';

const Tab = createBottomTabNavigator();

const screens = [
  {
    name: navigationStrings.HOME_TAB as 'HomeTab',
    component: HomeStack,
    icon: (focused: boolean) =>
      focused ? (
        <TKHomeSelectedIcon width={30} height={30} />
      ) : (
        <TKHomeUnselectedIcon width={30} height={30} />
      ),
  },
  {
    name: navigationStrings.FAVORITES_TAB as 'FavoritesTab',
    component: FavoritesStack,
    icon: (focused: boolean) =>
      focused ? (
        <TKHeartSelectedIcon width={30} height={30} />
      ) : (
        <TKHeartUnselectedIcon width={30} height={30} />
      ),
  },
  {
    name: navigationStrings.VENDOR_TAB as 'VendorTab',
    component: VendorStack,
    icon: (focused: boolean) =>
      focused ? (
        <TKVendorSelectedIcon width={30} height={30} />
      ) : (
        <TKVendorUnSelectedIcon width={30} height={30} />
      ),
    listeners: ({navigation}: any) => ({
      tabPress: (e: any) => {
        const state = navigation.getState();
        const vendorTabState = state.routes.find(
          (route: any) => route.name === navigationStrings.VENDOR_TAB,
        );

        // If VendorStack has more than one screen (not on initial screen)
        if (vendorTabState?.state?.routes?.length > 1) {
          // Prevent default tab switch behavior
          e.preventDefault();
          // Reset VendorStack to initial screen
          navigation.dispatch(StackActions.popToTop());
          // Then switch to the tab
          navigation.navigate(navigationStrings.VENDOR_TAB);
        }
      },
    }),
  },
  {
    name: navigationStrings.CART_TAB as 'CartTab',
    component: HomeStack,
    label: 'Profile',
    icon: (focused: boolean) =>
      focused ? <TKCartIcon width={30} height={30} /> : <TKCartUnselectedIcon />,
  },
] as const;
const BottomTabBarStack: React.FC = () => {
  const getCustomTabBar = useCallback((props: BottomTabBarProps) => {
    return <TKCustomBottomTabBar {...props} />;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        lazy: false,
      }}
      tabBar={getCustomTabBar}>
      {screens.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarIcon: ({focused}) => screen.icon(focused),
            ...((screen as any).options || {}),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomTabBarStack;
