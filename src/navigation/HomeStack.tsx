import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {HomeStackParamList} from './rootparamstypes';
import Home from '../screens/Home/Home';
import Profile from '../screens/Profile/Profile';
import Settings from '../screens/Settings/Settings';
import {RegisterUserStack} from './RegisterStack';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.HOME as 'Home'}
        component={Home}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.PROFILE as 'Profile'}
        component={Profile}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.SETTINGS as 'Settings'}
        component={Settings}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.REGISTER_USER_STACK as 'RegisterUserStack'}
        component={RegisterUserStack}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
