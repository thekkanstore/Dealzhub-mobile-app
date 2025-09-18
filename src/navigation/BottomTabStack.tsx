import React, {useCallback} from 'react';
import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';

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
    component: HomeStack,
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
