import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {HomeStackParamList} from './rootparamstypes';
import Home from '../screens/Home/Home';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.HOME as 'Home'}
        component={Home}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
