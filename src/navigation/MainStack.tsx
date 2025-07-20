import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {RootStackParamList} from './rootparamstypes';
import {AuthStack} from './AuthStack';
import {View} from 'react-native';
import {hideSplash} from 'react-native-splash-view';
import TKButton from '../components/TKButton/TKButton';
import TKHeader from '../components/TKHeader/TKHeader';
import TKTextInput from '../components/TKTextInput/TKTextInput';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainStack() {
  useEffect(() => {
    setTimeout(() => {
      hideSplash(); // Hide after some time
    }, 5000);
  }, []);
  return (
    <View style={{flex: 1, justifyContent: 'center', gap: 10}}>
      <TKTextInput label="label" error="error" />
      <TKHeader header="Header" />
      <TKButton title="primary" type="primary" />
      <TKButton title="secondary" type="secondary" />
      <TKButton title="tertiary" type="tertiary" />
      <TKButton title="neutral" type="neutral" />
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
