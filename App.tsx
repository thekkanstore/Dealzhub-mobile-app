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
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';
import {GlobalSafeAreaProvider} from './src/providers/SafeAreaProvider';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

GoogleSignin.configure({
  webClientId: Config.GOOGLE_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/user.phonenumbers.read'],
});

export const queryClient = new QueryClient();

function App(): React.JSX.Element {
  console.log('Firebase initialized:', firebase.apps.length > 0);

  firestore()
    .collection('test')
    .doc('connection_check')
    .get()
    .then(doc => {
      console.log('Firestore connection successful:', doc.exists);
    })
    .catch(error => {
      console.log('Firestore connection error:', error);
    });

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
