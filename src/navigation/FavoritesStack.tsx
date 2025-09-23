import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {FavoritesStackParamList} from './rootparamstypes';
import {VendorStack} from './VendorStack';
import Wishlist from '../screens/Wishlist/Wishlist';

const Stack = createStackNavigator<FavoritesStackParamList>();

export const FavoritesStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.FAVORITES as 'Favorites'}
        component={Wishlist}
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
