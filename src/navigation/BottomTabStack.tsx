import React from 'react';
import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {navigationStrings} from './navigationStrings';
// import LXIcon from '../components/LxIcon/LXIcon';
import {HomeStack} from './HomeStack';
import TKCustomBottomTabBar from '../components/TKCustomBottomTabBar/TKCustomBottomTabBar';
import {TKHomeSelectedIcon} from '../components/Icons/TKHomeSelectedIcon';
import {TKHomeUnselectedIcon} from '../components/Icons/TKHomeUnselectedIcon';
import {TKHeartSelectedIcon} from '../components/Icons/TKHeartSelectedIcon';
import {TKHeartUnselectedIcon} from '../components/Icons/TKHeartUnselectedIcon';
import {TKCartUnselectedIcon} from '../components/Icons/TKCartUnselectedIcon';
import {TKCartIcon} from '../components/Icons/TKCartIcon';

const Tab = createBottomTabNavigator();

const getCustomTabBar = (props: BottomTabBarProps) => {
  return <TKCustomBottomTabBar {...props} />;
};

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
    name: navigationStrings.CART_TAB as 'CartTab',
    component: HomeStack,
    label: 'Profile',
    icon: (focused: boolean) =>
      focused ? <TKCartIcon width={30} height={30} /> : <TKCartUnselectedIcon />,
  },
] as const;
const BottomTabBarStack: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
