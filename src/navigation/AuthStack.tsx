import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthStackParamList} from './rootparamstypes';
import {navigationStrings} from './navigationStrings';
import GettingStarted from '../screens/GettingStarted/GettingStarted';
import Login from '../screens/Login/Login';
import {useAppSelector} from '../redux/hooks';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  const isGettingStarted = useAppSelector(state => state.system.isShownGettingStarted);
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isGettingStarted ? (
        <Stack.Screen
          name={navigationStrings.GETTING_STARTED as 'GettingStarted'}
          component={GettingStarted}
          options={{gestureEnabled: false}}
        />
      ) : (
        <Stack.Screen
          name={navigationStrings.LOGIN as 'Login'}
          component={Login}
          options={{gestureEnabled: false}}
        />
      )}
    </Stack.Navigator>
  );
};
