import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {CartStackParamList} from './rootparamstypes';
import {VendorStack} from './VendorStack';
import Cart from '../screens/Cart/Cart';

const Stack = createStackNavigator<CartStackParamList>();

export const CartStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.CART as 'Cart'}
        component={Cart}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.VENDOR_STACK as 'VendorStack'}
        component={VendorStack}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
