import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthStackParamList} from './rootparamstypes';
// import {navigationStrings} from './navigationStrings';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return null
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* <Stack.Screen
        name={navigationStrings.LOGIN as 'Login'}
        component={LoginScreen}
        options={{gestureEnabled: false}}
      /> */}
      {/* <Stack.Screen
        name={navigationStrings.FORGOT_PASSWORD as 'ForgotPassword'}
        component={ForgotPassword}
        options={{gestureEnabled: false}}
      /> */}
    </Stack.Navigator>
  );
};
