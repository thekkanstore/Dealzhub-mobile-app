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
import TKRenderIf from '../components/TKRenderIf/TKRenderIf';
import {TKNotificationPermissionHandler} from '../components/TKNotificationPermissionHandler/TKNotificationPermissionHandler';
import {updateNotificationPermissionModalVisibility} from '../redux/systemSlice';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainStack() {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    setTimeout(() => {
      hideSplash(); // Hide after some time
    }, 2000);
  }, []);
  const isUserDetails = useAppSelector(state => state.user.user);
  const isShowNotificationPermissionModal = useAppSelector(
    state => state.system.isShowNotificationPermission,
  );

  const handleNotification = () => {
    updateNotificationPermissionModalVisibility(false);
  };

  return (
    <NavigationContainer>
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
            <Stack.Screen
              name={navigationStrings.BOTTOM_TAB_STACK as 'BottomTabStack'}
              component={BottomTabBarStack}
              options={{gestureEnabled: false}}
            />
          )}
        </Stack.Navigator>
      </View>
      <TKRenderIf isRender={isShowNotificationPermissionModal}>
        <TKNotificationPermissionHandler
          onPermissionGranted={handleNotification}
          onPermissionDenied={handleNotification}
          autoRequestOnMount={true}
        />
      </TKRenderIf>
    </NavigationContainer>
  );
}
