import React from 'react';
import 'react-native-gesture-handler';
import 'react-native-screens/gesture-handler';
import 'react-native-reanimated';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import {View} from 'react-native';

import MainStack from './src/navigation/MainStack';
import {persistor, store} from './src/redux/store';
import TKStatusBar from './src/components/Common/TKStatusBar/TKStatusBar';
import {ToastConfig} from './src/components/Common/TKToastConfig/TKToastConfig';
import {TKGlobalModalManager} from './src/components/Common/TKGlobalModalManager/TKGlobalModalManager';
import {SafeAreaProvider, initialWindowMetrics} from 'react-native-safe-area-context';
import {GlobalSafeAreaProvider} from './src/providers/SafeAreaProvider';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

GoogleSignin.configure({
  webClientId: Config.GOOGLE_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/user.phonenumbers.read'],
});
function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <GlobalSafeAreaProvider>
            <View style={{flex: 1}}>
              <TKGlobalModalManager>
                <KeyboardProvider>
                  <TKStatusBar />
                  <MainStack />
                  <Toast config={ToastConfig} />
                </KeyboardProvider>
              </TKGlobalModalManager>
            </View>
          </GlobalSafeAreaProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
