import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {RegisterUserStackParamList} from './rootparamstypes';
import UserDetails from '../screens/UserDetails/UserDetails';
import ChooseUserType from '../screens/ChooseUserType/ChooseUserType';
import StoreDetails from '../screens/StoreDetails.tsx/StoreDetails';

const Stack = createStackNavigator<RegisterUserStackParamList>();

export const RegisterUserStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.USER_DETAILS as 'UserDetails'}
        component={UserDetails}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.CHOOSE_USER_TYPE as 'ChooseUserType'}
        component={ChooseUserType}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.STORE_DETAILS as 'StoreDetails'}
        component={StoreDetails}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
