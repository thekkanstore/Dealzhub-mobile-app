import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {HomeStackParamList} from './rootparamstypes';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return null;
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={navigationStrings.HOME as 'Home'}
        component={HomeScreen}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={
          navigationStrings.INTERCITY_SHIPMENT_ORDER_CREATION as 'IntercityShipmentOrderCreation'
        }
        component={IntercityShipmentOrderCreation}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.HYPER_LOCAL_ORDER_CREATION as 'HyperLocalOrderCreation'}
        component={HyperLocalOrderCreation}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.ADD_DELIVERY_ADDRESS as 'AddDeliveryAddress'}
        component={AddDeliveryAddress}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.ADDRESS_LIST as 'AddressList'}
        component={AddressList}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.USER_MAP as 'UserMap'}
        component={UserMap}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.ORDER_DETAIL_WEB_VIEW as 'OrderDetailWebView'}
        component={OrderTrackingWebView}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationStrings.NOTIFICATION as 'Notification'}
        component={Notification}
        options={{gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
};
