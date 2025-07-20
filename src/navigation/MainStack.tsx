import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {RootStackParamList} from './rootparamstypes';
import {AuthStack} from './AuthStack';
import {Text, View} from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainStack() {
  return (
    <View style={{flex: 1, backgroundColor: 'red', padding: 100}}>
      <Text style={{color: 'white', fontSize: 30}}>MainStack</Text>
    </View>
  );
  const isLoggedIn = useAppSelector(state => state.userDetails.isUserLoggedIn);
  const isHideSplashScreen = useAppSelector(state => state.system.isHideSplashScreen);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name={navigationStrings.AUTH_STACK}
          component={AuthStack}
          options={{gestureEnabled: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
