import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationStrings} from './navigationStrings';
import {RootStackParamList} from './rootparamstypes';
import {AuthStack} from './AuthStack';
import {hideSplash} from 'react-native-splash-view';
import BottomTabBarStack from './BottomTabStack';
import {useAppSelector} from '../redux/hooks';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {TKNotificationPermissionHandler} from '../components/Common/TKNotificationPermissionHandler/TKNotificationPermissionHandler';
// import {updateNotificationPermissionModalVisibility} from '../redux/systemSlice';
import {RegisterUserStack} from './RegisterStack';
import {useGetAppConfig} from '../react-queries/appConfig/appConfigQuery';
import {linkingConfiguration} from './linkingConfiguration';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainStack() {
  const insets = useSafeAreaInsets();
  useGetAppConfig();
  useEffect(() => {
    setTimeout(() => {
      hideSplash();
    }, 2000);
  }, []);
  const isUserDetails = useAppSelector(state => state.user.user);
  const isNewUser = useAppSelector(state => state.user.isNewUser);

  // const handleNotification = () => {
  //   updateNotificationPermissionModalVisibility(false);
  // };

  const getUserStack = () => {
    if (isNewUser) {
      return (
        <Stack.Screen
          name={navigationStrings.REGISTER_STACK as 'RegisterUserStack'}
          component={RegisterUserStack}
          options={{gestureEnabled: false}}
        />
      );
    }
    return (
      <Stack.Screen
        name={navigationStrings.BOTTOM_TAB_STACK as 'BottomTabStack'}
        component={BottomTabBarStack}
        options={{gestureEnabled: false}}
      />
    );
  };
  return (
    <NavigationContainer linking={linkingConfiguration}>
      <View
        style={{
          flex: 1,
          paddingTop: isUserDetails ? insets.top : 0,
          paddingBottom: isUserDetails ? insets.bottom : 0,
        }}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {!isUserDetails ? (
            <Stack.Screen
              name={navigationStrings.AUTH_STACK}
              component={AuthStack}
              options={{gestureEnabled: false}}
            />
          ) : (
            getUserStack()
          )}
        </Stack.Navigator>
      </View>
      {/* {isUserDetails && !isNewUser && (
        <TKNotificationPermissionHandler
          onPermissionGranted={handleNotification}
          onPermissionDenied={handleNotification}
          autoRequestOnMount={true}
        />
      )} */}
    </NavigationContainer>
  );
}
