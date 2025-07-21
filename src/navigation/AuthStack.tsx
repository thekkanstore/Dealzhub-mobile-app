import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthStackParamList} from './rootparamstypes';
import {navigationStrings} from './navigationStrings';
import GettingStarted from '../screens/GettingStarted/GettingStarted';
// import {navigationStrings} from './navigationStrings';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* <Stack.Screen
        name={navigationStrings.LOGIN as 'Login'}
        component={LoginScreen}
        options={{gestureEnabled: false}}
      />  */}
      <Stack.Screen
        name={navigationStrings.GETTING_STARTED as 'GettingStarted'}
        component={GettingStarted}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
