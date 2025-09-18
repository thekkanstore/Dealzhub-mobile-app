import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {VendorStackParamList} from './rootparamstypes';
import {RegisterUserStack} from './RegisterStack';
import Vendor from '../screens/Vendor/Vendor';
import ProductUpdate from '../screens/ProductUpdate/ProductUpdate';

const Stack = createStackNavigator<VendorStackParamList>();

export const VendorStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.VENDOR as 'Vendor'}
        component={Vendor}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.REGISTER_USER_STACK as 'RegisterUserStack'}
        component={RegisterUserStack}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.PRODUCT_UPDATE as 'ProductUpdate'}
        component={ProductUpdate}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
