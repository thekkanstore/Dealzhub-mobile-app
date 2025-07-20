import React from 'react';
import {TextStyle, ViewStyle} from 'react-native';
import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {colors} from '../config/styles/colors';
import {moderateScaleVertical} from '../config/styles/responsiveSize';
import {navigationStrings} from './navigationStrings';
// import LXIcon from '../components/LxIcon/LXIcon';
import {HomeStack} from './HomeStack';
import TKCustomBottomTabBar from '../components/TKCustomBottomTabBar/TKCustomBottomTabBar';

const Tab = createBottomTabNavigator();

const getCustomTabBar = (props: BottomTabBarProps) => {
  return <TKCustomBottomTabBar {...props} />;
};

const screens = [
  {
    name: navigationStrings.HOME_TAB as 'HomeTab',
    component: HomeStack,
    label: 'Home',
    // icon: (focused: boolean) => <LXIcon name={focused ? 'homeBottomSelect' : 'homeBottom'} />,
  },
  {
    name: navigationStrings.HOME_TAB as 'HomeTab',
    component: HomeStack,
    label: 'Orders',
    // icon: (focused: boolean) => (
    //   <LXIcon name={focused ? 'transactionBottomSelect' : 'transactionBottom'} />
    // ),
    options: {
      tabBarStyle: {
        display: 'flex',
        backgroundColor: colors.primaryBackgroundColor,
        paddingTop: moderateScaleVertical(7),
      },
    },
  },
  {
    name: navigationStrings.HOME_TAB as 'HomeTab',
    component: HomeStack,
    label: 'Profile',
    // icon: (focused: boolean) => <LXIcon name={focused ? 'profileBottom' : 'profileBottom'} />,
    options: {
      unmountOnBlur: false,
    },
  },
] as const;
const BottomTabBarStack: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 12,
          color: colors.primaryBackgroundColor,
        } as TextStyle,
        tabBarStyle: {
          backgroundColor: colors.primaryBackgroundColor,
          paddingTop: moderateScaleVertical(7),
        } as ViewStyle,
      }}
      tabBar={getCustomTabBar}>
      {screens.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: screen.label,
            // tabBarIcon: ({focused}) => screen.icon(focused),
            ...((screen as any).options || {}),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomTabBarStack;
